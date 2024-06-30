from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

import json
import psycopg2 as db

from .utils import dbconfig
from .utils import debug
from .utils import DateTimeEncoder
from .utils import get_auth_grant

###############################################################################################

@csrf_exempt
#@debug
def devices_list(request, debug=False):

    AUTH_TAG = 'devices'
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
            if debug:
                print(body)

            query = f"""
                SELECT device
                FROM devices
                GROUP BY device
                ORDER BY device ASC
            """

            cursor.execute(query)
            # columns = [description[0] for description in cursor.description]
            result = cursor.fetchall()
            for device, in result:
                if debug: print(device)    
                query = f"""
                    SELECT property, value
                    FROM devices
                    WHERE device = '{device}'
                """
                if debug: print(query)
                cursor.execute(query)
                # columns = [description[0] for description in cursor.description]
                result = cursor.fetchall()
                _device = {}
                _device['device'] = device
                _device['id'] = device
                for property, value in result:
                    _device[property] = value
                devices.append(_device)

            response['data'] = devices
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
def device_detail(request, debug=False):

    AUTH_TAG = 'devices'
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

        response["data"] = []

        try:
            body = json.loads(request.body.decode("utf-8"))
            device = body["device"]

            if debug:
                print(body)

            query = f"""
                SELECT property, value
                FROM devices
                WHERE device = '{device}'
                ORDER BY property
            """
            if debug: print(query)
            cursor.execute(query)
            # columns = [description[0] for description in cursor.description]
            result = cursor.fetchall()
            if debug: print(result)
            for property, value in result:
                response['data'].append({'device': device, 'property':property, 'value': value})

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
def device_insert(request, debug=False):

    AUTH_TAG = 'devices'
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

        if auth_grant.find("a") == -1 and auth_grant.find("i") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = {}

        try:
            body = json.loads(request.body.decode("utf-8"))
            device = repr(body["device"])
            type = repr(body["type"])
            room = repr(body["room"])
            group = repr(body["group"])

            if debug:
                print(body)

            query = f"""
                INSERT INTO devices 
                (device, property, value)
                VALUES
                ({device}, 'device', {device}),
                ({device}, 'type', {type}),
                ({device}, 'room', {room}),
                ({device}, 'group', {group})                
                 """
            if debug: print(query)
            cursor.execute(query)
            connection.commit()

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
def device_delete(request, debug=False):

    AUTH_TAG = 'devices'
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

        if auth_grant.find("a") == -1 and auth_grant.find("d") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = {}

        try:
            body = json.loads(request.body.decode("utf-8"))
            device = repr(body["device"])

            if debug:
                print(body)

            query = f"""
                DELETE FROM devices
                WHERE device = {device} 
                """
            cursor.execute(query)
            connection.commit()

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
def device_update(request, debug=False):

    AUTH_TAG = 'devices'
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

        if auth_grant.find("a") == -1 and auth_grant.find("u") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = {}

        try:
            body = json.loads(request.body.decode("utf-8"))

            if debug: print(body)
            
            device = repr(body["device"])
            property = repr(body["target_field"])
            value = repr(body["target_value"])

            query = f"""
                UPDATE devices
                SET value = {value}
                WHERE device = {device} AND property = {property}
            """
            if debug: print(query)

            cursor.execute(query)
            connection.commit()
            
            query = f"""
                SELECT property, value
                FROM devices
                WHERE device = {device}
            """
            if debug: print(query)

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
def device_property_insert(request, debug=False):

    AUTH_TAG = 'devices'
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

        if auth_grant.find("a") == -1 and auth_grant.find("i") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = {}

        try:
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)

            device = repr(body["device"])
            property = repr(body["property"])
            value = repr(body["value"])

            query = f"""
                INSERT INTO devices 
                (device, property, value)
                VALUES
                ({device}, {property}, {value})
                """
            
            if debug: print(query)
            cursor.execute(query)
            connection.commit()

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
def device_property_delete(request, debug=False):

    AUTH_TAG = 'devices'
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

        if auth_grant.find("a") == -1 and auth_grant.find("d") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = {}

        try:
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)

            device = repr(body["device"])
            property = repr(body["property"])

            query = f"""
                DELETE FROM devices
                WHERE device = {device}
                AND property = {property}
                """
            
            if debug: print(query)
            cursor.execute(query)
            connection.commit()

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
def device_property_update(request, debug=False):

    AUTH_TAG = 'devices'
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

        if auth_grant.find("a") == -1 and auth_grant.find("u") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")

        response["data"] = []

        if request.method != 'POST':
            raise Error("No post data")

        response["data"] = {}

        try:
            body = json.loads(request.body.decode("utf-8"))

            if debug: print(body)
            
            device = repr(body["device"])
            property = repr(body["property"])
#            value = repr(body["value"])

            target_field = body["target_field"]
            target_value = repr(body["target_value"])

            query = f"""
                UPDATE devices
                SET {target_field} = {target_value}
                WHERE device = {device} AND property = {property}
            """
            if debug: print(query)

            cursor.execute(query)
            connection.commit()
            
            query = f"""
                SELECT property, value
                FROM devices
                WHERE device = {device}
            """
            if debug: print(query)

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
@debug
def device_temperature(request, debug=False):

    AUTH_TAG = 'devices'
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

        response["data"] = []

        try:
            body = json.loads(request.body.decode("utf-8"))
            response["request"] = body
            if debug:
                print(body)

            device = body["device"]

            query = f"""
                SELECT utc, temperature 
                FROM temperature_log
                WHERE device = '{device}'
                ORDER BY utc
            """
            if debug: print(query)
            cursor.execute(query)
            # columns = [description[0] for description in cursor.description]
            result = cursor.fetchall()
            if debug: print(result)
            for utc, temperature in result:
                response['data'].append({'timestamp': utc, 'temperature':temperature})

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
