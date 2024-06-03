import os
import asyncio
import json
from aiomqtt import Client, MqttError
import psycopg2 as db

dbconfig = {
    'host': os.environ.get('DB_HOST'),
    'port': os.environ.get('DB_PORT'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_DATABASE')
}

# Define the MQTT broker details
BROKER = os.environ.get('MQTT_BROKER')
PORT = int(os.environ.get('MQTT_PORT'))
MQTT_TOPIC_FOR_SYNC = os.environ.get('MQTT_TOPIC_FOR_SYNC')

async def mqtt_listener():

    reconnect_interval = 1  # seconds

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        while True:
            try:
                async with Client(BROKER, PORT) as client:
                    await client.subscribe(MQTT_TOPIC_FOR_SYNC)                  
                    async for message in client.messages:
                        try:
                            print(f'Received message: [{message.topic}] {message.payload.decode()}')
                            msg = json.loads(message.payload.decode())
                            value = msg['value']
                            if isinstance(value, bool): value=int(value)

                            query = f"""
                                    INSERT INTO devices 
                                    (device, property, value)
                                    VALUES
                                    ({repr(msg['device'])}, {repr(msg['property'])}, {repr(msg['value'])})
                                    ON CONFLICT (device, property) DO UPDATE
                                    SET value = {repr(value)}
                                    """

                            cursor.execute(query)
                            connection.commit()

                        except Exception as err:
                            print(str(err))
            except MqttError as error:
                print(f'Error "{error}". Reconnecting in {reconnect_interval} seconds.')
                await asyncio.sleep(reconnect_interval)
    finally:
        cursor.close()
        connection.close()

async def main():

    await asyncio.gather(
        mqtt_listener()
    )

if __name__ == '__main__':
    asyncio.run(main())
