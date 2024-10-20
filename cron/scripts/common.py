import os, json
import psycopg2 as db
import paho.mqtt.client as mqtt

dbconfig = {
    'host': os.environ.get('POSTGRES_HOST'),
    'port': os.environ.get('POSTGRES_PORT'),
    'user': os.environ.get('POSTGRES_USER'),
    'password': os.environ.get('POSTGRES_PASSWORD'),
    'database': os.environ.get('POSTGRES_DB')
}

MQTT_BROKER=os.environ.get('MQTT_BROKER')
MQTT_PORT=int(os.environ.get('MQTT_PORT'))
MQTT_TOPIC_FOR_ACTION=os.environ.get('MQTT_TOPIC_FOR_ACTION')
MQTT_TOPIC_FOR_SYNC=os.environ.get('MQTT_TOPIC_FOR_SYNC')

def switch(device, action):
    payload = {'device': f"{device}", 'action': action, 'value': action}
    mqtt_message = json.dumps(payload)  # Message to publish
    print("SWITCHING", MQTT_BROKER, MQTT_PORT, MQTT_TOPIC_FOR_ACTION, payload)
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.publish(MQTT_TOPIC_FOR_ACTION, mqtt_message)
    client.disconnect()

def variable(device, property='value', debug=False):
    response = {}

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        query = f"""
            select value from devices 
            where property = '{property}' and device = {repr(device)}
        """
        cursor.execute(query)
        result = cursor.fetchone()

        if not result: return response

        value, = result
        response['data'] = value

        response['status'] = 'OK'
        return response
        
    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug:
            print(response)
        cursor.close()
        connection.close()
