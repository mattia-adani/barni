import os, json, functools, datetime

#################################

dbconfig = {
    'host': os.environ.get('DB_HOST'),
    'port': os.environ.get('DB_PORT'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_DATABASE')
}


MQTT_BROKER=os.environ.get('MQTT_BROKER')
MQTT_PORT=int(os.environ.get('MQTT_PORT'))
MQTT_TOPIC_FOR_ACTION=os.environ.get('MQTT_TOPIC_FOR_ACTION')
MQTT_TOPIC_FOR_SYNC=os.environ.get('MQTT_TOPIC_FOR_SYNC')


def debug(func):
    """Print the function signature and return value"""
    @functools.wraps(func)
    def wrapper_debug(*args, **kwargs):
        args_repr = [repr(a) for a in args]
        kwargs_repr = [f"{k}={repr(v)}" for k, v in kwargs.items()]
        signature = ", ".join(args_repr + kwargs_repr)
        print(f"Calling {func.__name__}({signature})")
        value = func(*args, **kwargs, debug = True)
        print(f"{func.__name__}() returned {repr(value)}")
        return value
    return wrapper_debug

class DateTimeEncoder(json.JSONEncoder):
        #Override the default method
        def default(self, obj):
            if isinstance(obj, (datetime.date, datetime.datetime)):
                return obj.isoformat()

def cleanField(fieldValue):
    if isinstance(fieldValue, int): return fieldValue
    if isinstance(fieldValue, float): return fieldValue
    if isinstance(fieldValue, datetime.datetime): return fieldValue
    if fieldValue is None: return None
    return str(fieldValue)

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

    out["dict"] = {}
    out["dict"]["Products"] = "Prodotti"
    out["dict"]["Operators"] = "Operatori"


    return out

def get_auth_grant(auth_code, token, cursor):

    output_check = check_token(token, cursor)
    if output_check is None: return None
    if 'auth' not in output_check: return None
    auth = output_check['auth']
    if auth is None: return None
    if not isinstance(auth, dict): return None
    if auth_code not in auth.keys(): return None    
    return auth[auth_code]
