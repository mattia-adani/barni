import os, json, functools, datetime
import string, secrets
import hashlib

dbconfig = {
    'host': os.environ.get('DB_HOST'),
    'port': os.environ.get('DB_PORT'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_DATABASE')
}

#################################

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

def generate_key(length=32):
    # Define the set of characters to choose from (uppercase letters + lowercase letters + digits)
    characters = string.ascii_letters + string.digits

    # Use secrets.choice to randomly choose characters and join them into a string
    random_string = ''.join(secrets.choice(characters) for _ in range(length))

    return random_string

def calculate_md5(input_string):
    md5_hash = hashlib.md5()
    md5_hash.update(input_string.encode('utf-8'))
    md5_hex = md5_hash.hexdigest()
    return md5_hex

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
