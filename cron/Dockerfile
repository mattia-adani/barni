FROM alpine:3.20
RUN apk add --no-cache \
    postgresql-client \
    rclone \
    python3 \
    py3-pip \
#    py3-psycopg2 \
#    py3-paho-mqtt \
    dos2unix 

# Create a virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install additional Python packages in the virtual environment
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir pytz requests psycopg2-binary paho-mqtt

# Install Python packages using pip
#RUN pip install --no-cache-dir psycopg2-binary paho-mqtt
COPY ./scripts /scripts

RUN dos2unix /scripts/* || true
RUN chmod +x /scripts/*

COPY crontab /etc/crontabs/root
COPY rclone.conf /root/.config/rclone/rclone.conf