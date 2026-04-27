# AI-Driven Predictive Manufacturing Cost Estimator

This project is an AI-powered tool for estimating and optimizing manufacturing costs using machine learning. It combines predictive analytics with prescriptive optimization to help manufacturers minimize costs while meeting production targets.

## Features

- **Predictive Cost Estimation**: Uses XGBoost model to predict manufacturing costs based on input parameters like quantity used, recycled material percentage, production output, material efficiency, and recycled impact.
- **Prescriptive Optimization**: Employs optimization algorithms to find the best combination of parameters that minimize costs while satisfying production constraints.
- **Interactive Web Interface**: Built with Streamlit for easy user interaction and real-time results.
- **Data-Driven Insights**: Includes a Jupyter notebook with exploratory data analysis and model training code.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd manufacturing-optimizer
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure you have the trained model files:
   - `xgb_manufacturing_model.pkl`: The trained XGBoost model
   - `manufacturing_scaler.pkl`: The fitted StandardScaler for feature scaling

   These files should be in the same directory as `app.py`. If not present, run the Jupyter notebook to train and save the models.

## Usage

1. Run the Streamlit application:
   ```bash
   streamlit run app.py
   ```

2. Open your web browser and navigate to the provided URL (usually `http://localhost:8501`).

3. Input your production requirements and current machine settings in the sidebar.

4. View the predicted cost for current settings.

5. Click "Run AI Optimization" to find optimal parameters that minimize costs.

## Requirements

- Python 3.7+
- Dependencies listed in `requirements.txt`:
  - streamlit
  - pandas
  - numpy
  - scikit-learn
  - xgboost
  - scipy
  - joblib

## Model Training

The `ai-driven-predictive-manufacturing-cost-estimator.ipynb` notebook contains:
- Data loading and preprocessing
- Exploratory data analysis
- Feature engineering
- Model training and evaluation
- Model saving

Run this notebook to train the models if the `.pkl` files are missing.

## Project Structure

- `app.py`: Main Streamlit application
- `requirements.txt`: Python dependencies
- `ai-driven-predictive-manufacturing-cost-estimator.ipynb`: Model training notebook
- `xgb_manufacturing_model.pkl`: Trained XGBoost model (generated)
- `manufacturing_scaler.pkl`: Fitted scaler (generated)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.