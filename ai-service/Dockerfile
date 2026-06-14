FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for audio transcription / speech-to-text
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install watchfiles, wheel, setuptools, and CPU PyTorch (prevents downloading massive CUDA packages)
RUN pip install --no-cache-dir watchfiles "setuptools<=80.10.2" wheel && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install (using --no-build-isolation to force using our pinned setuptools)
COPY requirements.txt ./
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt

# Copy source code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
