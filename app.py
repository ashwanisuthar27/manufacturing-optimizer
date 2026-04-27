import streamlit as st
import pandas as pd
import numpy as np
import joblib
from scipy.optimize import minimize

st.set_page_config(page_title="AI Manufacturing Optimizer", layout="wide")

@st.cache_resource
def load_models():
    model = joblib.load('xgb_manufacturing_model.pkl')
    scaler = joblib.load('manufacturing_scaler.pkl')
    return model, scaler

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