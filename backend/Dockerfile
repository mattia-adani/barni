# Use an official Python runtime as a parent image
FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY ./requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

#RUN timedatectl set-timezone Europe/Rome

# Copy the current directory contents into the container at /app
COPY . /app/

# Collect static files
#RUN python manage.py migrate
#RUN python migrate.py
