import os
import streamlit as st
import pandas as pd
import numpy as np
import joblib
import google.genai as genai
from scipy.optimize import minimize

st.set_page_config(page_title="AI Manufacturing Optimizer", layout="wide")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

@st.cache_resource
def load_models():
    model = joblib.load('xgb_manufacturing_model.pkl')
    scaler = joblib.load('manufacturing_scaler.pkl')
    return model, scaler


def call_gemini(prompt, api_key, model=GEMINI_MODEL, temperature=0.3, max_output_tokens=512):
    if not api_key:
        raise ValueError("Gemini API key is required for explanation or question answering.")
    client = genai.Client(api_key=api_key)
    config = genai.types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_output_tokens,
    )
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )
    return response.text.strip()


def build_gemini_context(cost, qty, recycled, output, mat_eff, rec_impact, optimized=False):
    section = "optimized estimate" if optimized else "current estimate"
    return (
        f"You are a manufacturing optimization analyst. Explain the {section} in plain language.\n"
        f"Inputs:\n"
        f"- Quantity Used (kg): {qty}\n"
        f"- Recycled Material (%): {recycled}\n"
        f"- Production Output (Units): {output}\n"
        f"- Material Efficiency: {mat_eff}\n"
        f"- Recycled Impact: {rec_impact}\n"
        f"Predicted cost: ${cost:,.2f}\n"
        f"Please describe the key cost drivers, whether this estimate is efficient, and recommend actions to reduce cost."
    )


def ask_gemini_question(question, context, api_key):
    prompt = (
        f"{context}\n\n"
        f"User question: {question}\n"
        f"Answer the question based on the model output and explanation context. "
        f"If the question is unrelated, say you can only answer questions about the manufacturing cost estimate."
    )
    return call_gemini(prompt, api_key)

try:
    model, scaler = load_models()
except FileNotFoundError:
    st.error("Required .pkl files not found.")
    st.stop()

model_columns = model.get_booster().feature_names
numerical_cols = ['Quantity Used (kg)', 'Recycled Material (%)', 'Production Output (Units)', 
                  'Material_Efficiency', 'Recycled_Impact']

st.title("AI Manufacturing Cost Estimator & Optimizer")

st.sidebar.header("Production Requirements")
target_output = st.sidebar.number_input("Target Production (Units)", 100.0, 1000.0, 600.0)
fixed_material_efficiency = st.sidebar.number_input("Expected Material Efficiency", 1.0, 10.0, 4.5)
fixed_recycled_impact = st.sidebar.number_input("Expected Recycled Impact", 0.0, 50.0, 10.0)

st.sidebar.header("Current Machine Settings")
current_qty = st.sidebar.slider("Current Quantity Used (kg)", 50.0, 200.0, 150.0)
current_recycled = st.sidebar.slider("Current Recycled Material (%)", 0.0, 50.0, 15.0)

gemini_api_key = st.sidebar.text_input(
    "Gemini API Key",
    value=os.getenv("GEMINI_API_KEY", ""),
    type="password",
    help="Enter your Gemini API key to generate explanations and ask follow-up questions."
)

def predict_cost(qty, recycled, output, mat_eff, rec_impact):
    input_data = pd.DataFrame(np.zeros((1, len(model_columns))), columns=model_columns)
    input_data['Quantity Used (kg)'] = qty
    input_data['Recycled Material (%)'] = recycled
    input_data['Production Output (Units)'] = output
    input_data['Material_Efficiency'] = mat_eff
    input_data['Recycled_Impact'] = rec_impact
    
    input_data[numerical_cols] = scaler.transform(input_data[numerical_cols])
    return model.predict(input_data)[0]

current_cost = predict_cost(current_qty, current_recycled, target_output, fixed_material_efficiency, fixed_recycled_impact)

st.subheader("1. Predictive Estimator")
st.metric(label="Estimated Cost (Current Settings)", value=f"${current_cost:,.2f}")

if "gemini_explanation" not in st.session_state:
    st.session_state["gemini_explanation"] = ""
if "gemini_answer" not in st.session_state:
    st.session_state["gemini_answer"] = ""

st.subheader("Gemini Explanation")
with st.expander("Generate or ask about the cost estimate", expanded=True):
    if gemini_api_key:
        if st.button("Explain this estimate with Gemini", key="explain_button"):
            try:
                explanation_prompt = build_gemini_context(
                    current_cost,
                    current_qty,
                    current_recycled,
                    target_output,
                    fixed_material_efficiency,
                    fixed_recycled_impact,
                )
                st.session_state["gemini_explanation"] = call_gemini(explanation_prompt, gemini_api_key)
            except Exception as exc:
                st.error(f"Gemini explanation failed: {exc}")

        if st.session_state["gemini_explanation"]:
            st.markdown(st.session_state["gemini_explanation"])

        question = st.text_area(
            "Ask Gemini about this estimate",
            key="gemini_question",
            placeholder="What drove this cost? How can we reduce it?"
        )
        if st.button("Ask Gemini", key="ask_button"):
            if not question.strip():
                st.warning("Enter a question before asking Gemini.")
            else:
                try:
                    context = st.session_state["gemini_explanation"] or explanation_prompt
                    st.session_state["gemini_answer"] = ask_gemini_question(question, context, gemini_api_key)
                except Exception as exc:
                    st.error(f"Gemini question failed: {exc}")

        if st.session_state["gemini_answer"]:
            st.markdown("**Gemini response:**")
            st.markdown(st.session_state["gemini_answer"])
    else:
        st.info("Enter your Gemini API key in the sidebar to enable explanation and Q&A.")

st.markdown("---")
st.subheader("2. Prescriptive Optimizer")

if st.button("Run AI Optimization"):
    with st.spinner("Finding optimal parameters..."):
        def objective_function(x):
            return predict_cost(x[0], x[1], target_output, fixed_material_efficiency, fixed_recycled_impact)

        def constraint_production(x):
            return (x[0] * fixed_material_efficiency) - target_output

        bounds = [(50.0, 200.0), (0.0, 50.0)]
        initial_guess = [current_qty, current_recycled]
        constraints = [{'type': 'eq', 'fun': constraint_production}]

        result = minimize(
            objective_function, 
            initial_guess, 
            method='SLSQP', 
            bounds=bounds, 
            constraints=constraints
        )

        if result.success:
            opt_qty, opt_recycled = result.x
            minimized_cost = result.fun
            savings = current_cost - minimized_cost
            
            col1, col2, col3 = st.columns(3)
            col1.metric("Optimized Cost", f"${minimized_cost:,.2f}", f"-${savings:,.2f}")
            col2.metric("Optimal Quantity (kg)", f"{opt_qty:.2f}", f"{opt_qty - current_qty:.2f} kg")
            col3.metric("Optimal Recycled (%)", f"{opt_recycled:.2f}%", f"{opt_recycled - current_recycled:.2f} %")
        else:
            st.error("Optimization failed to converge. Try adjusting constraints.")