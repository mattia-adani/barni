FROM alpine:3.20

RUN apk add --no-cache postgresql-client
RUN apk add rclone
RUN apk add python3

COPY crontab /etc/crontabs/root
COPY rclone.conf /root/.config/rclone/rclone.conf