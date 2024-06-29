FROM alpine:3.20

# Install the required packages
RUN apk add --no-cache \
    postgresql-client \
    rclone \
    python3 \
#    py3-pip \
#    build-base \
#    libpq-dev \
    py3-psycopg2 \
    py3-paho-mqtt \
    dos2unix

# Install Python packages using pip
#RUN pip install --no-cache-dir psycopg2-binary paho-mqtt
COPY ./scripts /scripts

RUN dos2unix /scripts/* || true
RUN chmod +x /scripts/*

COPY crontab /etc/crontabs/root
COPY rclone.conf /root/.config/rclone/rclone.conf