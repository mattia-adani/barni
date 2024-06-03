from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

import json
import psycopg2 as db
import paho.mqtt.client as mqtt

from .utils import dbconfig
from .utils import debug
from .utils import DateTimeEncoder
from .utils import get_auth_grant

from .utils import MQTT_BROKER
from .utils import MQTT_PORT
from .utils import MQTT_TOPIC_FOR_ACTION
#from .utils import MQTT_TOPIC_FOR_SYNC

###############################################################################################

@csrf_exempt
@debug
def test(request, debug=False):

    AUTH_TAG = 'test'
    response = {}

    class Error(Exception):
        pass

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except:
            token = None

        if token is None or token == 'undefined':
            raise Error("No token")
        
        auth_grant = get_auth_grant(AUTH_TAG, token, cursor)
        if debug:
            print("AUTH_GRANT", auth_grant)
        if auth_grant is None:
            response["status"] = 'not authorized (0)'
            raise Error("No authorization")

        if auth_grant.find("a") == -1 and auth_grant.find("r") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = []

        try:
            body = json.loads(request.body.decode("utf-8"))
            if debug:
                print(body)

            query = """
                SELECT A.*, B.password, B.token_date, B.token
                FROM 
                users as A
                LEFT JOIN users_keys as B
                on A.username = B.username 
                ORDER BY lastname, firstname
            """

            # cursor.execute(query)
            # columns = [description[0] for description in cursor.description]
            # result = cursor.fetchall()
            
            # Publish message to MQTT broker
#            mqtt_broker = 'mqtt'  # Replace with your MQTT broker URL
#            mqtt_port = 1883  # Replace with your MQTT broker port
#            mqtt_topic = 'test/topic'  # Replace with your MQTT topic
            mqtt_message = json.dumps(body)  # Message to publish

            client = mqtt.Client()
            client.connect(MQTT_BROKER, MQTT_PORT, 60)
            client.publish(MQTT_TOPIC_FOR_ACTION, mqtt_message)
            client.disconnect()

            response['status'] = 'OK'

        except Exception as err:
            response["error"] = str(err)

    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug:
            print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def devices(request, debug=False):

    AUTH_TAG = 'test'
    response = {}

    class Error(Exception):
        pass

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except:
            token = None

        if token is None or token == 'undefined':
            raise Error("No token")
        
        auth_grant = get_auth_grant(AUTH_TAG, token, cursor)
        if debug:
            print("AUTH_GRANT", auth_grant)
        if auth_grant is None:
            response["status"] = 'not authorized (0)'
            raise Error("No authorization")

        if auth_grant.find("a") == -1 and auth_grant.find("r") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = []
        devices = []
        try:
            body = json.loads(request.body.decode("utf-8"))
            ROOM = body["zone"]
            if debug:
                print(body)

            query = f"""
                SELECT device
                FROM devices
                WHERE property = 'room'
                AND value = '{ROOM}'
            """

            cursor.execute(query)
            # columns = [description[0] for description in cursor.description]
            result = cursor.fetchall()
            for device, in result:

                query = f"""
                    SELECT property, value
                    FROM devices
                    WHERE device = '{device}'
                """
                cursor.execute(query)
                # columns = [description[0] for description in cursor.description]
                result = cursor.fetchall()
                _device = {}
                _device['device'] = device
                for property, value in result:
                    _device[property] = value
                devices.append(_device)

            groups = []
            for device in devices:
                if 'group' in device:
                    if device['group'] not in groups:
                        groups.append(device['group'])
                else:
                    if '' not in groups:
                        groups.append('')

            for group in groups:
                group_devices = []
                for device in devices:
                    if 'group' in device:
                        if device['group'] == group:
                            group_devices.append(device)
                    else:
                        if group == '':
                            group_devices.append(device)
                response["data"].append({'group': group, 'devices': group_devices})

            response['status'] = 'OK'

        except Exception as err:
            response["error"] = str(err)

    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug:
            print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################
