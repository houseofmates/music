# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libchromaprint-dev \
    libchromaprint-tools \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp using pip (more reliable than downloading binary)
RUN pip install --no-cache-dir yt-dlp

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create volume mount point
VOLUME ["/music"]

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
