FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements (API-only)
COPY requirements.api.txt ./requirements.api.txt

# Install Python dependencies (API-only)
RUN pip install --no-cache-dir -r requirements.api.txt

# Copy minimal application code
COPY src ./src
COPY main.py ./main.py
COPY config.yaml ./config.yaml

# Expose port
EXPOSE 8000

# Start application
CMD ["python", "main.py", "api"]