FROM python:3.11-slim

WORKDIR /workspace

# Install system dependencies needed for compiling some packages if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to cache docker layer
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Command to run FastAPI server (we will run migrations during compose lifecycle or inline)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
