# Use official Python 3.11 image
FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Install system dependencies for Playwright & Xvfb (GUI support)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libgbm1 \
    libxkbcommon-x11-0 \
    libgtk-3-0 \
    libasound2 \
    fonts-liberation \
    libxshmfence1 \
    curl \
    xvfb \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies globally
COPY requirements.txt ./
#RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Google Chrome for Linux inside the container
RUN apt-get update && apt-get install -y chromium
# Install Playwright and its dependencies globally
RUN pip install playwright
RUN playwright install --with-deps

# Install `browser-use` from GitHub
RUN pip install git+https://github.com/browser-use/browser-use.git

# Copy backend source code
COPY . .

# Expose Flask port
EXPOSE 5050

# Set environment variable for GUI support
ENV DISPLAY=host.docker.internal:0
ENV QT_X11_NO_MITSHM=1

# Start Gunicorn for Flask app with Xvfb support
#ENTRYPOINT ["/bin/sh", "-c", "\
#    echo 'Running database migration...' && flask db upgrade && \
#    echo 'Starting Xvfb...' && Xvfb :99 -screen 0 1920x1080x24 & \
#    sleep 3 && \
#     echo 'Starting Gunicorn...' && exec gunicorn -b 0.0.0.0:5050 wsgi:app --chdir /app --workers=2 --timeout=120 --log-level=debug --capture-output\
#"]
ENV PYTHONPATH="/usr/local/lib/python3.11/site-packages"


ENTRYPOINT ["/bin/sh", "-c", "\
    echo 'Running database migration...' && flask db upgrade && \
    echo 'Starting Gunicorn...' && exec gunicorn -b 0.0.0.0:5050 wsgi:app --chdir /app --workers=2 --timeout=120 --log-level=debug --capture-output\
"]
