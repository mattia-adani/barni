import os, json, time
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



def devices(debug = False):

    response = {}

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        query = """
            select device from devices 
            where property = 'type' and (value = 'AirCondControl' or value = 'Cooling')
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

def switch(device, action):
    payload = {'device': f"{device}_switch", 'action': action, 'value': action}
    mqtt_message = json.dumps(payload)  # Message to publish
    print(MQTT_TOPIC_FOR_ACTION, payload)
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.publish(MQTT_TOPIC_FOR_ACTION, mqtt_message)
    client.disconnect()

def update(device):

    payload = {'device': f"{device}", 'action': 'sync', 'type': 'AirCondControl'}
    mqtt_message = json.dumps(payload)  # Message to publish

#    print(MQTT_TOPIC_FOR_ACTION, payload)
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.publish(MQTT_TOPIC_FOR_ACTION, mqtt_message)
 
    client.disconnect()

def main():

    enable = variable('cooling_control')
    if enable is None or not isinstance(enable, dict): return
    if 'data' not in enable: return
    try:
        if not bool(int(enable['data'])): return
    except Exception as err:
        print(str(err))
        return

    d = devices()
    for device in d['data']: update(device)

    time.sleep(5)

    for device in d['data']:
        props = device_info(device)['data']
#        print(props)
        temperature = float(props['temperature'].split(' ')[0])
        target_temperature = float(props['target_temperature'])
        try:
            cooling_enabled = bool(int(props['cooling_enabled']))
        except Exception as err:
            print(str(err)) 
            cooling_enabled = False

        if not cooling_enabled: continue

        if temperature > target_temperature:
           action = 'on'

        else:
            action = 'off'
        
        switch(device, action)
        print(device, cooling_enabled, temperature, target_temperature, action)

main()