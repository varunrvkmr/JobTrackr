# Use official Python 3.11 image
FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Install Python dependencies globally
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose Flask port
EXPOSE 5050

# Start Gunicorn for Flask app with Xvfb support
#ENTRYPOINT ["/bin/sh", "-c", "\
#    echo 'Running database migration...' && flask db upgrade && \
#    echo 'Starting Xvfb...' && Xvfb :99 -screen 0 1920x1080x24 & \
#    sleep 3 && \
#     echo 'Starting Gunicorn...' && exec gunicorn -b 0.0.0.0:5050 wsgi:app --chdir /app --workers=2 --timeout=120 --log-level=debug --capture-output\
#"]
ENV PYTHONPATH="/usr/local/lib/python3.11/site-packages"


#ENTRYPOINT ["/bin/sh", "-c", "\
#    echo 'Running database migration...' && flask db upgrade && \
#    echo 'Starting Gunicorn...' && exec gunicorn -b 0.0.0.0:5050 wsgi:app --chdir /app --workers=2 --timeout=120 --log-level=debug --capture-output\
#"]

ENTRYPOINT ["/bin/sh", "-c", "\
    echo 'Running database migration...' && flask db upgrade && \
    echo 'Starting Gunicorn...' && exec gunicorn -b 0.0.0.0:5050 wsgi:app \
    --chdir /app --workers=2 --timeout=120 \
    --log-level=debug --capture-output \
    --forwarded-allow-ips='*' \
"]

