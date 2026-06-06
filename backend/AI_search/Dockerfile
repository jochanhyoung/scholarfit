FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && if [ -s requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

COPY src ./src
COPY active_scholarship_data.json .
COPY active_scholarship_vectors.npy .
COPY data/scholarship_data.json ./data/scholarship_data.json

CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8001"]
