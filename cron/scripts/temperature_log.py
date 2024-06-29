import os, json, time, datetime
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

def log_temperature(device):

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        props = device_info(device)['data']
        temperature = float(props['state'].split(' ')[0])
        now = f"{datetime.datetime.utcnow()}"
        print(device, now, temperature)

        query = f"""
            insert into temperature_log 
            (device, utc, temperature)
            VALUES
            ({repr(device)}, {repr(now)},  {temperature})
        """
    
        cursor.execute(query)
        connection.commit()

    except Exception as err:
        print(str(err))

    finally:
        cursor.close()
        connection.close()


def devices(debug = False):

    response = {}

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        query = """
            select device from devices 
            where property = 'type' and value = 'Temperature'
        """
        cursor.execute(query)
        result = cursor.fetchall()

        response['data'] = []

        for device, in result:
            response['data'].append(device)

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

def device_info(device_id, debug = True):

    response = {}

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        query = f"""
            select property, value from devices 
            where device = '{device_id}'
        """
        cursor.execute(query)
        result = cursor.fetchall()

        response['data'] = {}

        for property, value, in result:
            response['data'][property] = value
            
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

def update(device):

    payload = {'device': f"{device}", 'action': 'sync', 'type': 'Temperature'}
    mqtt_message = json.dumps(payload)  # Message to publish

    print(MQTT_TOPIC_FOR_ACTION, payload)
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.publish(MQTT_TOPIC_FOR_ACTION, mqtt_message)
 
    client.disconnect()

def main():

    d = devices()
    for device in d['data']: update(device)

    time.sleep(10)

    for device in d['data']: log_temperature(device)

main()