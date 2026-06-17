# 🏦 Loan Approval Prediction System

## 📌 Project Overview

The Loan Approval Prediction System is a Machine Learning project developed to predict whether a loan application should be approved or rejected based on an applicant's financial and personal information.

The objective of this project is to assist banks and financial institutions in making faster, data-driven, and more consistent loan approval decisions by leveraging historical loan application data.

---

## 🎯 Problem Statement

HDFC Bank Ltd. aims to improve loan processing efficiency by predicting whether a loan application should be approved or rejected based on applicant details.

Using information such as income, loan amount, CIBIL score, education, employment status, and asset values, a supervised Machine Learning model is developed to classify applications as:

- ✅ Approved
- ❌ Rejected

---

## 📂 Dataset Description

The dataset contains applicant financial and demographic information used for loan approval prediction.

### Features Used

| Feature | Description |
|----------|------------|
| loan_id | Unique loan identifier |
| no_of_dependents | Number of dependents |
| education | Graduate / Not Graduate |
| self_employed | Employment status |
| income_annum | Annual income |
| loan_amount | Requested loan amount |
| loan_term | Loan repayment duration |
| cibil_score | Credit score |
| residential_assets_value | Residential asset value |
| commercial_assets_value | Commercial asset value |
| luxury_assets_value | Luxury asset value |
| bank_asset_value | Value of bank assets |
| loan_status | Approved / Rejected (Target Variable) |

---

## 🛠️ Technologies Used

### Programming Language
- Python

### Libraries
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Scikit-Learn

### Development Tools
- Jupyter Notebook
- Visual Studio Code
- Git
- GitHub

---

## 🔄 Project Workflow

### 1. Data Collection

The dataset was imported using Pandas.

```python
df = pd.read_csv("loan_approval_dataset.csv")
```

### 2. Exploratory Data Analysis (EDA)

Performed:
- Dataset inspection
- Feature analysis
- Missing value checking
- Statistical summary generation

### 3. Data Preprocessing

Categorical variables were converted into numerical values.

#### Education Encoding

| Category | Value |
|-----------|--------|
| Graduate | 1 |
| Not Graduate | 0 |

#### Self Employed Encoding

| Category | Value |
|-----------|--------|
| Yes | 1 |
| No | 0 |

#### Loan Status Encoding

| Category | Value |
|-----------|--------|
| Approved | 1 |
| Rejected | 0 |

---

### 4. Feature Selection

Input Features:

- Number of Dependents
- Education
- Self Employment Status
- Annual Income
- Loan Amount
- Loan Term
- CIBIL Score
- Residential Assets Value
- Commercial Assets Value
- Luxury Assets Value
- Bank Assets Value

Target Variable:

```python
loan_status
```

---

### 5. Train-Test Split

The dataset was divided into:

- 80% Training Data
- 20% Testing Data

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)
```

---

### 6. Model Training

A Random Forest Classifier was used to train the model.

```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)
```

---

## 🤖 Why Random Forest?

Random Forest was selected because:

- Handles structured tabular data efficiently
- Reduces overfitting through ensemble learning
- Works well with both numerical and categorical features
- Provides feature importance analysis
- Produces high classification accuracy

---

## 📊 Model Evaluation

The model was evaluated using:

### Accuracy Score
Measures overall prediction correctness.

### Confusion Matrix
Provides information about:

- True Positives
- True Negatives
- False Positives
- False Negatives

### Classification Report

Includes:

- Precision
- Recall
- F1 Score

### ROC-AUC Score
Measures the model's ability to distinguish between approved and rejected applications.

---

## 📈 Key Factors Affecting Loan Approval

Based on the dataset and model training:

### CIBIL Score
- Strongest indicator of loan approval.
- Higher scores increase approval probability.

### Annual Income
- Higher income improves loan eligibility.

### Asset Values
- Applicants with higher residential, commercial, and bank assets are more likely to receive approval.

### Loan Amount
- Very large loan amounts relative to income may increase rejection probability.

---

## 📋 Project Structure

```text
Loan_Approval_System/
│
├── Loan_approval_disapproval-model.ipynb
├── loan_approval_dataset.csv
├── README.md
├── requirements.txt
└── .gitignore
```

---

## 🚀 Future Enhancements

- Deploy model using Streamlit
- Create a user-friendly web interface
- Perform hyperparameter tuning
- Add cross-validation
- Implement SHAP Explainability
- Visualize feature importance
- Integrate with real-world banking workflows

---

## 🎓 Learning Outcomes

This project helped in understanding:

- Data Cleaning and Preprocessing
- Exploratory Data Analysis (EDA)
- Feature Engineering
- Classification Algorithms
- Random Forest Implementation
- Model Evaluation Techniques
- Git and GitHub Version Control
- End-to-End Machine Learning Workflow

---

## 👨‍💻 Author

**Govind Madhav Srivastava**

B.Tech Computer Engineering  
Thapar Institute of Engineering & Technology

GitHub: https://github.com/Shane-06

---

## ⭐ Repository

If you found this project useful, consider giving it a star on GitHub.
