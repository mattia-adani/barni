import json, functools, datetime
import string, secrets
import hashlib


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
