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
        
    if brand_lower == 'xiaomi' or brand_lower == 'redmi':
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
        'base_ram': float(re.search(r'(\d+)', str(row['ram_raw'])).group(1)) if pd.notna(row['ram_raw']) and re.search(r'(\d+)', str(row['ram_raw'])) else 8,
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

with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 📱 Smart Market Value Estimator (India)")
    
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
            
    btn = gr.Button("Calculate Real Market Value", variant="primary")
    output_text = gr.Textbox(label="Estimated Used Price (INR)", text_align="center")
    
    brand_dd.change(fn=get_series_for_brand, inputs=brand_dd, outputs=series_dd)
    series_dd.change(fn=get_models_for_series, inputs=[brand_dd, series_dd], outputs=model_dd)
    
    btn.click(
        fn=calculate_hybrid_price, 
        inputs=[brand_dd, series_dd, model_dd, ram_slider, storage_dd, age_slider, condition_dd], 
        outputs=output_text
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)