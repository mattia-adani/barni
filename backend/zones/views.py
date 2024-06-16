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

            devices.sort(key = lambda x : float(x['priority']) if 'priority' in x else 0)

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
                if debug: print("START", group_devices)

                for device in devices:
                    if 'group' in device:
                        if device['group'] == group:
                            group_devices.append(device)
                    else:
                        if group == '':
                            group_devices.append(device)
                
                
                if debug: print("BEFORE", group_devices)
                #group_devices=sorted(group_devices.copy(), key = lambda x: (int(x['priority']) if 'priority' in x else 100, x['name']))
                group_devices.sort(key = lambda x: (float(x['priority']) if 'priority' in x else 100, x['name']))
                if debug: print("AFTER", group_devices)

                if group == 'Lights': priority = 1
                elif group == 'Blinds': priority = 2
                elif group == 'Shutters': priority = 3
                else: priority = 100
                response["data"].append({'group': group, 'group_priority': priority, 'devices': group_devices})

            response["data"] = sorted(response["data"], key=lambda x: (x['group_priority'], x['group']))
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
def device(request, debug=False):

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

        response["data"] = {}

        try:
            body = json.loads(request.body.decode("utf-8"))
            device = body["device"]

            if debug:
                print(body)

            query = f"""
                SELECT property, value
                FROM devices
                WHERE device = '{device}'
            """
            cursor.execute(query)
            # columns = [description[0] for description in cursor.description]
            result = cursor.fetchall()
            response['data']['device'] = device
            for property, value in result:
                response['data'][property] = value

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
def colors(request, debug=False):

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

            query = f"""
                SELECT color_group 
                FROM colors
                GROUP BY color_group
                ORDER BY color_group
            """
            cursor.execute(query)
            # columns = [description[0] for description in cursor.description]
            result = cursor.fetchall()
            
            for color_group, in result:

                query = f"""
                    SELECT hex, color_name, red, green, blue, luma
                    FROM colors
                    WHERE color_group = {repr(color_group)}
                    ORDER BY luma DESC
                """
                cursor.execute(query)
                #columns = [description[0] for description in cursor.description]
                result = cursor.fetchall()
                col_group = {'color_group': color_group, 'colors': []}
                for hex, color_name, red, green, blue, luma in result:
                    col_group['colors'].append({'hex': hex, 'color_name': color_name, 'red': red, 'blue': blue, 'green': green, 'luma': luma})

                response["data"].append(col_group)

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
def RGBcolor(request, debug=False):

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

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = {}

        try:

            body = json.loads(request.body.decode("utf-8"))
            red = body["red"]
            green = body["green"]
            blue = body["blue"]

            if debug:
                print(body)

            query = f"""
                SELECT * 
                FROM colors
                WHERE red = {red} AND green= {green} AND blue = {blue}
            """
            if debug: print(query)
            cursor.execute(query)
            columns = [description[0] for description in cursor.description]
            result = cursor.fetchone()
            if result:
                for column, value in enumerate(result):
                    response['data'][columns[column]] = value 
                response['status'] = 'OK'
            
            else:
                response['status'] = 'KO'

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

###############################################################################################

@csrf_exempt
@debug
def all_devices(request, debug=False):

    AUTH_TAG = 'test'
    response = {}

    class Error(Exception):
        pass

    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        response["data"] = []
        devices = []
        try:
#            body = json.loads(request.body.decode("utf-8"))

#            if debug:
#                print(body)

            query = f"""
                SELECT device
                FROM devices
                GROUP BY device
                ORDER BY device
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

            response["data"] = devices
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
