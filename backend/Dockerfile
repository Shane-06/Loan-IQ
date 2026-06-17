FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /workspace

# Copy requirements and install dependencies
COPY requirements.txt /workspace/backend/
RUN pip install --no-cache-dir -r /workspace/backend/requirements.txt

# Copy ML pipeline models, reports, and source modules for dynamic prediction imports
COPY ml/models /workspace/ml/models
COPY ml/reports /workspace/ml/reports
COPY ml/src /workspace/ml/src
COPY loan_approval_dataset.csv /workspace/loan_approval_dataset.csv

# Copy FastAPI backend code
COPY app /workspace/backend/app

WORKDIR /workspace/backend

EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
