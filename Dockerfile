FROM python:3.9-slim

RUN pip install -U pip setuptools wheel && \
    pip install spacy && \
    python -m spacy download en_core_web_sm

WORKDIR /app
COPY . /app

# Chạy ứng dụng
CMD ["python", "nlr_ai.py"]

