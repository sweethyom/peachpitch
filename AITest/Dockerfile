# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

ENV SERVER_PORT=8083

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 8083

CMD ["python", "manage.py", "runserver", "--server.port=${SERVER_PORT}"]
