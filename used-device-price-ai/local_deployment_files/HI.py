import gradio as gr
import pandas as pd
import numpy as np
import re
from collections import defaultdict

specs_df = pd.read_csv('device_specs_structured_dataset.csv')

specs_df['brand'] = specs_df['brand'].astype(str).str.title().str.strip()
specs_df['phone_name'] = specs_df['phone_name'].astype(str).str.strip()
specs_df['list_price_inr'] = pd.to_numeric(specs_df['list_price_inr'], errors='coerce')
specs_df = specs_df.dropna(subset=['list_price_inr'])

specs_df['battery_mah'] = specs_df['battery_raw'].astype(str).str.extract(r'(\d{4,})').astype(float)
specs_df['charging_w'] = specs_df['fast_charging_raw'].astype(str).str.extract(r'(\d+)\s*[wW]').astype(float).fillna(15)
specs_df['display_inch'] = specs_df['display_raw'].astype(str).str.extract(r'(\d+\.\d+)').astype(float)
specs_df['main_cam_mp'] = specs_df['rear_camera_raw'].astype(str).str.extract(r'(\d+)').astype(float)
specs_df['ram_gb'] = specs_df['ram_raw'].astype(str).str.extract(r'(\d+)').astype(float)

def extract_series(brand, phone_name):
    brand_lower = brand.lower()
    name_lower = phone_name.lower()
    
    if brand_lower == 'apple':
        match = re.search(r'(iphone \d+|iphone se|iphone x)', name_lower)
        return match.group(1).title() if match else 'Other iPhones'
    if brand_lower == 'samsung':
        match = re.search(r'(galaxy [a-z])', name_lower)
        return match.group(1).title() if match else 'Other Galaxy'
    if brand_lower == 'oneplus':
        if 'nord' in name_lower: return 'Nord Series'
        match = re.search(r'oneplus (\d+)', name_lower)
        return f"Series {match.group(1)}" if match else 'Other OnePlus'
    if brand_lower in ['xiaomi', 'redmi']:
        if 'note' in name_lower: return 'Note Series'
        if 'poco' in name_lower: return 'Poco Series'
        return 'Mi/Redmi Core'
    if brand_lower == 'vivo':
        match = re.search(r'vivo ([a-z])', name_lower)
        return f"{match.group(1).upper()} Series" if match else 'Other Vivo'

    return "Main Series"

specs_df['series'] = specs_df.apply(lambda row: extract_series(row['brand'], row['phone_name']), axis=1)

catalog = defaultdict(lambda: defaultdict(list))
price_lookup = {}

for _, row in specs_df.iterrows():
    b = row['brand']
    s = row['series']
    m = row['phone_name']
    
    if m not in catalog[b][s]:
        catalog[b][s].append(m)
        
    price_lookup[m] = {
        'base_price': row['list_price_inr'],
        'base_ram': row['ram_gb'] if pd.notna(row['ram_gb']) else 8,
        'base_storage': float(re.search(r'(\d+)', str(row['storage_raw'])).group(1)) if pd.notna(row['storage_raw']) and re.search(r'(\d+)', str(row['storage_raw'])) else 128
    }

for b in catalog:
    for s in catalog[b]:
        catalog[b][s].sort()

brands_list = sorted(list(catalog.keys()))

def get_series_for_brand(brand):
    if not brand or brand not in catalog: return gr.update(choices=[], value=None)
    series_list = sorted(list(catalog[brand].keys()))
    return gr.update(choices=series_list, value=series_list[0] if series_list else None)

def get_models_for_series(brand, series):
    if not brand or not series or series not in catalog.get(brand, {}): 
        return gr.update(choices=[], value=None)
    models_list = catalog[brand][series]
    return gr.update(choices=models_list, value=models_list[0] if models_list else None)

def calculate_hybrid_price(brand, series, model_name, target_ram, target_storage, age_months, condition):
    if model_name not in price_lookup:
        return "Model not found in pricing database."
        
    base_data = price_lookup[model_name]
    new_price = base_data['base_price']
    
    ram_diff = target_ram - base_data['base_ram']
    storage_diff = target_storage - base_data['base_storage']
    
    adjusted_new_price = new_price + (ram_diff * 400) + ((storage_diff / 128) * 2500)
    
    retention_factor = 0.95 
    if brand.lower() == 'apple': retention_factor = 0.97
    elif brand.lower() == 'samsung' and 'S' in series: retention_factor = 0.96
    
    monthly_depreciation = 0.025 * (2 - retention_factor)
    
    if age_months <= 12:
        depreciation = age_months * monthly_depreciation
    else:
        depreciation = (12 * monthly_depreciation) + ((age_months - 12) * (monthly_depreciation * 0.7))
        
    depreciation = min(depreciation, 0.85)
    
    condition_multiplier = {
        "Like New (No scratches, 95%+ battery)": 1.05,
        "Good (Minor wear, 85%+ battery)": 0.95,
        "Fair (Visible scratches, <85% battery)": 0.85,
        "Poor (Cracks, needs repair)": 0.65
    }
    
    used_price = adjusted_new_price * (1 - depreciation) * condition_multiplier.get(condition, 0.95)
    
    return f"₹{max(1000, used_price):,.0f}"

def get_recommendations(price_tier, camera, performance, size, battery, charging):
    df = specs_df.copy()
    
    if price_tier == "Low": df = df[df['list_price_inr'] < 15000]
    elif price_tier == "Mid": df = df[(df['list_price_inr'] >= 15000) & (df['list_price_inr'] < 30000)]
    elif price_tier == "Value for Money": df = df[(df['list_price_inr'] >= 30000) & (df['list_price_inr'] < 50000)]
    elif price_tier == "High": df = df[df['list_price_inr'] >= 50000]

    if camera == "Avg": df = df[df['main_cam_mp'] < 64]
    elif camera == "Good": df = df[(df['main_cam_mp'] >= 64) & (df['main_cam_mp'] < 100)]
    elif camera == "Best": df = df[df['main_cam_mp'] >= 100]

    if performance == "Low": df = df[df['ram_gb'] <= 4]
    elif performance == "Avg": df = df[(df['ram_gb'] > 4) & (df['ram_gb'] <= 8)]
    elif performance == "High": df = df[df['ram_gb'] > 8]

    if size == "Compact": df = df[df['display_inch'] < 6.4]
    elif size == "Big": df = df[df['display_inch'] >= 6.4]

    if battery == "Small is good": df = df[df['battery_mah'] < 4500]
    elif battery == "Last longer": df = df[df['battery_mah'] >= 4500]

    if charging == "Slow": df = df[df['charging_w'] < 25]
    elif charging == "Medium": df = df[(df['charging_w'] >= 25) & (df['charging_w'] <= 65)]
    elif charging == "Fast": df = df[df['charging_w'] > 65]

    if df.empty:
        return pd.DataFrame({"Message": ["No devices match your exact criteria. Try relaxing some options."]})
        
    res_df = df[['brand', 'phone_name', 'list_price_inr', 'ram_raw', 'storage_raw', 'rear_camera_raw', 'battery_raw']].head(5)
    res_df.columns = ['Brand', 'Model', 'New Price (INR)', 'RAM', 'Storage', 'Camera', 'Battery']
    return res_df

with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 📱 Smart Mobile Assistant (India)")
    
    with gr.Tabs():
        with gr.Tab("Market Value Estimator"):
            with gr.Row():
                with gr.Column():
                    brand_dd = gr.Dropdown(choices=brands_list, label="1. Select Brand")
                    series_dd = gr.Dropdown(choices=[], label="2. Select Series")
                    model_dd = gr.Dropdown(choices=[], label="3. Select Specific Model")
                    
                with gr.Column():
                    ram_slider = gr.Slider(minimum=2, maximum=24, step=2, value=8, label="RAM Capacity (GB)")
                    storage_dd = gr.Dropdown(choices=[32, 64, 128, 256, 512, 1024], value=128, label="Storage Capacity (GB)")
                    age_slider = gr.Slider(minimum=0, maximum=60, step=1, value=12, label="Device Age (Months)")
                    condition_dd = gr.Dropdown(
                        choices=[
                            "Like New (No scratches, 95%+ battery)",
                            "Good (Minor wear, 85%+ battery)",
                            "Fair (Visible scratches, <85% battery)",
                            "Poor (Cracks, needs repair)"
                        ], 
                        value="Good (Minor wear, 85%+ battery)", 
                        label="Device Condition"
                    )
                    
            calc_btn = gr.Button("Calculate Real Market Value", variant="primary")
            calc_output = gr.Textbox(label="Estimated Used Price (INR)", text_align="center")
            
            brand_dd.change(fn=get_series_for_brand, inputs=brand_dd, outputs=series_dd)
            series_dd.change(fn=get_models_for_series, inputs=[brand_dd, series_dd], outputs=model_dd)
            calc_btn.click(
                fn=calculate_hybrid_price, 
                inputs=[brand_dd, series_dd, model_dd, ram_slider, storage_dd, age_slider, condition_dd], 
                outputs=calc_output
            )

        with gr.Tab("Device Recommender"):
            with gr.Row():
                with gr.Column():
                    rec_price = gr.Radio(choices=["Low", "Mid", "Value for Money", "High"], value="Mid", label="Price Range")
                    rec_camera = gr.Radio(choices=["Avg", "Good", "Best"], value="Good", label="Camera Needs")
                    rec_perf = gr.Radio(choices=["Low", "Avg", "High"], value="Avg", label="Performance Level")
                with gr.Column():
                    rec_size = gr.Radio(choices=["Compact", "Big"], value="Big", label="Phone Size")
                    rec_batt = gr.Radio(choices=["Small is good", "Last longer"], value="Last longer", label="Battery Life")
                    rec_charge = gr.Radio(choices=["Slow", "Medium", "Fast"], value="Fast", label="Charging Speed")
            
            rec_btn = gr.Button("Find My Perfect Phone", variant="primary")
            rec_output = gr.Dataframe(headers=['Brand', 'Model', 'New Price (INR)', 'RAM', 'Storage', 'Camera', 'Battery'])
            
            rec_btn.click(
                fn=get_recommendations,
                inputs=[rec_price, rec_camera, rec_perf, rec_size, rec_batt, rec_charge],
                outputs=rec_output
            )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)