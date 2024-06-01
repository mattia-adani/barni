#from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

import os
import json
import datetime

import psycopg2 as db

from .utils import debug
from .utils import generate_key
from .utils import DateTimeEncoder
from .utils import calculate_md5
from .utils import cleanField

'''
envars = {}
for v in ['DB_USER', 
          'DB_PASSWORD', 
          'DB_HOST', 
          'DB_PORT', 
          'DB_DATABASE']:
    envars[v] = os.environ.get(v)
'''

dbconfig = {
    'host': os.environ.get('DB_HOST'),
    'port': os.environ.get('DB_PORT'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_DATABASE')
}

###############################################################################################

#@debug
def check_token(token, cursor, debug = False):

    query = f"""
        SELECT username, token_date
        FROM users_keys 
        WHERE token = '{token}'
        """

    cursor.execute(query)
    result = cursor.fetchone()
    if result is None: return None
    if debug: print(result)
    username, token_date = result
    now = datetime.datetime.now()
    expires = token_date + datetime.timedelta(days=1)

    if expires < now: 
        print("Token has expired,")
        return None

    out = {}

    out["status"] = 'OK'
    out["username"] = username
    out["expires"] = str(expires)
    out["key"] = token

    query = f"""
        SELECT auth_code, auth_grant
        FROM access_control
        WHERE username = '{username}'
    """
    out["auth"] = {}
    cursor.execute(query)
    result = cursor.fetchall()
    for auth_code, auth_grant in result:
        out["auth"][auth_code] = auth_grant

    query = f"""
        SELECT dictionary_id
        FROM users
        WHERE username = '{username}'
    """
    out["dict"] = {}
    cursor.execute(query)
    result = cursor.fetchone()
    if result is not None:
        dictionary_id, = result
        if dictionary_id is not None:
            try:
                query = f"""
                    SELECT tag, tag_name
                    FROM dictionaries_entries
                    WHERE dictionary_id = {dictionary_id}
                """
                cursor.execute(query)
                result = cursor.fetchall()
                for tag, tag_name in result:
                    out["dict"][tag] = tag_name
            except Exception as err:
                print(str(err))
                print(query)

    return out

###############################################################################################

@csrf_exempt
def verify(request, token):

    response = {}
    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()
        response = check_token(token, cursor)
    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def login(request, debug = False):

    print("login")

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            body = json.loads(request.body.decode("utf-8"))
            username = body["username"]
            password = body["password"]
        except:
            username = None
            password = None

        if username is None or password is None:
            response["status"] = "Not authorized"
            response["message"] = "Empty username or password"
            response["username"] = username
            response["password"] = password
            raise Error("Invalid user or password.")
        
        query = f"""
                SELECT token
                FROM users_keys WHERE username = '{username}' AND password = '{password}'
                """
        if debug: print(query)
        cursor.execute(query)
        result = cursor.fetchone()
        if debug: print(result)

        if result is None:
            response["status"] = "Not authorized"
            response["message"] = "Invalid username or password"
            raise Error("Not authorized.")

        token, = result
        if debug: print("checking token")
        current_token_is_valid = check_token(token, cursor)
        if current_token_is_valid:
            response = current_token_is_valid
            response["status"] = 'OK'
            if debug: print(response)
        else:

            now = str(datetime.datetime.now())
            new_token = generate_key()
            query = f"""
                    UPDATE users_keys 
                    SET token = '{new_token}', 
                    token_date = '{now}' 
                    WHERE username = '{username}' AND password = '{password}'
                    """
            if debug: print(query)
            cursor.execute(query)
            connection.commit()

            response = check_token(new_token, cursor)

    except Error as err:
        response['error'] = str(err)

    except Exception as err:
        print(str(err))
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print("RESPONSE", response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def access_control(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("access_control", token, cursor)
        if debug: print("AUTH_GRANT", auth_grant)    
        if auth_grant is None:
            response["status"] = 'not authorized (0)'
            raise Error("No authorization")

        if auth_grant.find("a") == -1 and  auth_grant.find("r") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")


        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        response["data"] = []
        try:
           #body = json.loads(request.body.decode("utf-8"))

            query = f"""
                    SELECT A.*, B.firstname, B.lastname
                    FROM
                    (SELECT username, auth_code, auth_grant 
                    FROM access_control) as A
                    LEFT JOIN users as B
                    ON A.username = B.username 
                    ORDER BY lastname, firstname, auth_code
                    """

            cursor.execute(query)
            result = cursor.fetchall()

            if result is not None:
                for row in result:
                    username, auth_code, auth_grant, firstname, lastname = row
                    response["data"].append({'firstname':firstname, 'lastname':lastname, 'username': username, 'auth_code': auth_code, 'auth_grant': auth_grant})

        except Exception as err:
            response["error"] = str(err)
                

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

def get_auth_grant(auth_code, token, cursor):

    output_check = check_token(token, cursor)
    if output_check is None: return None
    if 'auth' not in output_check: return None
    auth = output_check['auth']
    if auth is None: return None
    if not isinstance(auth, dict): return None
    if auth_code not in auth.keys(): return None    
    return auth[auth_code]

###############################################################################################

@csrf_exempt
#@debug
def users(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

#        origin = request.headers.get('Origin')
#        response["Origin"] = origin
        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("access_control", token, cursor)
        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")
        
        response["data"] = []

        if not (request.method == 'POST'):
            raise Error("No post data")

        response["data"] = []

        try:

            body = json.loads(request.body.decode("utf-8"))

            query = f"""
                    SELECT username, firstname, lastname 
                    FROM users 
                    ORDER BY lastname, firstname
                    """

            cursor.execute(query)
            result = cursor.fetchall()

            for username, firstname, lastname in result:
                response["data"].append({'username': username, 'firstname': firstname, 'lastname': lastname})

        except Exception as err:
            response["error"] = str(err)
                    
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def users_list(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("users", token, cursor)
        if debug: print("AUTH_GRANT", auth_grant)    
        if auth_grant is None:
            response["status"] = 'not authorized (0)'
            raise Error("No authorization")

        if auth_grant.find("a") == -1 and  auth_grant.find("r") == -1:
            response["status"] = 'not authorized (1)'
            raise Error("No authorization")


        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        response["data"] = []

        try:
            body = json.loads(request.body.decode("utf-8"))

            query = f"""
                    SELECT A.*, B.password, B.token_date, B.token
                    FROM 
                    users as A
                    LEFT JOIN users_keys as B
                    on A.username =B.username 
                    ORDER BY lastname, firstname
                    """

            cursor.execute(query)
            columns = [description[0] for description in cursor.description]
            result = cursor.fetchall()
            
            # Fetching and formatting results
            for rowIndex, rowContent in enumerate(result):
                record = {}
                for fieldIndex, fieldValue in enumerate(rowContent):
                    record[columns[fieldIndex]] = cleanField(fieldValue)
                response["data"].append(record)

        except Exception as err:
            response["error"] = str(err)
                     
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def access_control_insert(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("access_control", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("i") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        try:
            body = json.loads(request.body.decode("utf-8"))

            username = repr(body["username"])
            auth_code = repr(body["auth_code"])
            auth_grant = repr(body["auth_grant"])

            query = f"""
                    INSERT INTO access_control
                    (username, auth_code, auth_grant)
                    VALUES
                    ({username}, {auth_code}, {auth_grant})
                    """
            if debug: print(query)

            cursor.execute(query)
            connection.commit()

            response["status"] = "OK"

        except Exception as err:
            response["status"] = "KO"
            response["message"] = str(err)
                     
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def access_control_delete(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("access_control", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("d") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        try:
            body = json.loads(request.body.decode("utf-8"))

            username = repr(body["username"])
            auth_code = repr(body["auth_code"])
            auth_grant = repr(body["auth_grant"])

            query = f"""
                    DELETE FROM access_control
                    WHERE username = {username}
                    AND auth_code = {auth_code}
                    AND auth_grant = {auth_grant}
                    """

            cursor.execute(query)
            connection.commit()

            response["status"] = "OK"

        except Exception as err:
            response["status"] = "KO"
            response["message"] = str(err)
                    
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def access_control_update(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("access_control", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("a") == -1 and auth_grant.find("u") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        try:
            body = json.loads(request.body.decode("utf-8"))

            username = repr(body["username"])
            auth_code = repr(body["auth_code"])
            auth_grant = repr(body["auth_grant"])
            target_field = body["target_field"]
            target_value = repr(body["target_value"])

            query = f"""
                    UPDATE access_control
                    SET {target_field} = {target_value}
                    WHERE username = {username}
                    AND auth_code = {auth_code}
                    AND auth_grant = {auth_grant}
                    """

            cursor.execute(query)
            connection.commit()

            response["status"] = "OK"

        except Exception as err:
            response["status"] = "KO"
            response["message"] = str(err)
                    
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def users_delete(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("users", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("d") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        try:
            body = json.loads(request.body.decode("utf-8"))

            username = repr(body["username"])

            query = f"""
                    DELETE FROM users
                    WHERE username = {username}
                    """

            cursor.execute(query)
            connection.commit()

            query = f"""
                    DELETE FROM users_keys
                    WHERE username = {username}
                    """

            cursor.execute(query)
            connection.commit()

            response["status"] = "OK"

        except Exception as err:
            response["status"] = "KO"
            response["message"] = str(err)
                     
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def users_insert(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("users", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("i") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        try:
            body = json.loads(request.body.decode("utf-8"))
            if debug: print("BODY", body)
            username = repr(body["username"])
            firstname = repr(body["firstname"])
            lastname = repr(body["lastname"])
            password = repr(calculate_md5(body["password"]))
            token_date = repr(str(datetime.datetime.now()))

            query = f"""
                    INSERT INTO users
                    (username, firstname, lastname)
                    VALUES
                    ({username}, {firstname}, {lastname})
                    """
            if debug: print(query)
            cursor.execute(query)
            connection.commit()

            query = f"""
                    INSERT INTO users_keys
                    (username, password, token_date)
                    VALUES
                    ({username}, {password}, {token_date})
                    """
            if debug: print(query)
            cursor.execute(query)
            connection.commit()

            response["status"] = "OK"

        except Exception as err:
            response["status"] = "KO"
            response["message"] = str(err)
                    
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
#@debug
def users_update(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        auth_grant = get_auth_grant("users", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("u") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        try:
            body = json.loads(request.body.decode("utf-8"))

            username = repr(body["username"])
            target_field = body["target_field"]
            target_value = body["target_value"]

            if target_field == 'password':
                query = f"""
                        UPDATE users_keys
                        SET {target_field} = '{calculate_md5(target_value)}'
                        WHERE username = {username}
                        """
            else:
                query = f"""
                        UPDATE users
                        SET {target_field} = '{target_value}'
                        WHERE username = {username}
                        """

            cursor.execute(query)
            connection.commit()

            response["status"] = "OK"

        except Exception as err:
            response["status"] = "KO"
            response["message"] = str(err)
                    
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################

@csrf_exempt
@debug
def change_password(request, debug = False):

    response = {}

    class Error(Exception):
        pass

    try:

        connection = db.connect(**dbconfig)
        cursor = connection.cursor()

        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        query = f"""
            SELECT username, token_date
            FROM users_keys 
            WHERE token = '{token}'
            """

        cursor.execute(query)
        result = cursor.fetchone()
        if result is None: raise Error("Token not recognized.")
        if debug: print(result)
        token_username, token_date = result
        now = datetime.datetime.now()
        expires = token_date + datetime.timedelta(days=1)

        if expires < now: 
            if debug: print("Token has expired,")
            raise Error("Token has expired.")

        response["data"] = []
        
        if not (request.method == 'POST'):
            raise Error("No post data")

        try:
            body = json.loads(request.body.decode("utf-8"))

            username = body["username"]
            password = body["password"]
            newPassword = body["newPassword"]

            if username != token_username: 
                raise Error("User inconsistent.")

            query = f"""
                SELECT username
                FROM users_keys 
                WHERE username = '{username}' AND password = '{password}'
                """

            cursor.execute(query)
            result = cursor.fetchone()
            if result is None:
                raise Error("Wrong password.")

            query = f"""
                    UPDATE users_keys
                    SET password = '{newPassword}'
                    WHERE username = '{username}'
                    """
            
            cursor.execute(query)
            connection.commit()

            response["status"] = "OK"

        except Exception as err:
            response["status"] = "KO"
            response["message"] = str(err)
                    
    except Error as err:  # Catch the custom Error
        response["status"] = "Error"
        response["message"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

###############################################################################################




'''
@csrf_exempt
def users_update_password(request):

    def calculate_md5(input_string):
        md5_hash = hashlib.md5()
        md5_hash.update(input_string.encode('utf-8'))
        md5_hex = md5_hash.hexdigest()
        return md5_hex

    response = {}

    class Error(Exception):
        pass

    try:

        connection = mysql.connector.connect(**olluda_ADM)
        cursor = connection.cursor()

        origin = request.headers.get('Origin')
        response["Origin"] = origin
        try:
            token = request.headers.get('Authorization')
        except: token = None

        if token is None or (token == 'undefined'): raise Error("No token")
        
        output_check = check_token(token, cursor)

        Access = output_check["access"]
        if Access is None: raise Error ("No authorization (1)")
        if not isinstance(Access, dict):  raise Error ("No authorization (2)")
        if 'users' not in Access.keys(): raise Error ("No authorization (3)")
        if not ("*" in Access['users'].split(',') or "update" in Access['users'].split(',')): raise Error ("No authorization (4)")

        response["data"] = []

        if request.method == 'POST':
            try:
                body = json.loads(request.body.decode("utf-8"))

                UserID = repr(body["UserID"])
                password = repr(calculate_md5(body["new_password"]))

                query = f"""
                        UPDATE users
                        SET password = {password}
                        WHERE 1
                        AND UserID = {UserID}
                        """

                cursor.execute(query)
                connection.commit()

                response["status"] = "OK"

            except Exception as err:
                response["status"] = "KO"
                response["message"] = str(err)
                     
    except Error as err:  # Catch the custom Error
        response["error"] = str(err)

    except Exception as err:
        response["status"] = "Error"
        response["message"] = str(err)

    finally:
        print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response, cls=DateTimeEncoder))

'''

    ###############################################################################################
