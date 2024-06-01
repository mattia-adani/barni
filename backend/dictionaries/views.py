from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

#import os
import json
#import datetime

import psycopg2 as db

from .utils import debug
from .utils import get_auth_grant
from .utils import dbconfig

###############################################################################################

#@debug
@csrf_exempt
def dictionaries(request, debug = False):
    response = {}
    class Error(Exception):
        """A custom exception."""
        pass
    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()
        try:
            body = json.loads(request.body.decode("utf-8"))
            response["request"] = body
        except Exception as err:
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            SELECT * FROM dictionaries
            ORDER BY dictionary_name ASC
            """
        cursor.execute(query)

        response["data"] = []

        columns = [description[0] for description in cursor.description]
        result = cursor.fetchall()
        for rowIndex, rowContent in enumerate(result):
            record = {}
            for fieldIndex, fieldValue in enumerate(rowContent):
                record[columns[fieldIndex]] = str(fieldValue) if fieldValue else None

            response["data"].append(record)

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)

    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))

###############################################################################################

#@debug
@csrf_exempt
def insert(request, debug = False):

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
        
        auth_grant = get_auth_grant("dictionaries", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("i") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if not (request.method == 'POST'):
            raise Error("No post data")

        try:      
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)
            response["request"] = body
            name = repr(body["name"])

        except Exception as err: 
            print(str(err))
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            INSERT INTO dictionaries
            (dictionary_name)
            VALUES
            ({name})
             """
        if debug: print(query)
        cursor.execute(query)
        connection.commit()

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)
    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))

#################################

#@debug
@csrf_exempt
def delete(request, debug = False):

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
        
        auth_grant = get_auth_grant("dictionaries", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("d") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if not (request.method == 'POST'):
            raise Error("No post data")

        try:      
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)
            response["request"] = body
            id = int(body["id"])

        except Exception as err: 
            print(str(err))
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            DELETE FROM dictionaries
            WHERE dictionary_id = {id}
            """

        if debug: print(query)
        cursor.execute(query)
        connection.commit()

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)

    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))

#################################

#@debug
@csrf_exempt
def update(request, debug = False):

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
        
        auth_grant = get_auth_grant("dictionaries", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("u") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if not (request.method == 'POST'):
            raise Error("No post data")

        try:      
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)
            response["request"] = body
            FieldName = body["FieldName"]
            FieldValue = repr(body["FieldValue"])
            id = int(body["id"])

        except Exception as err: 
            print(str(err))
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            UPDATE dictionaries
            SET {FieldName} = {FieldValue}
            WHERE dictionary_id = {id}
            """

        if debug: print(query)
        cursor.execute(query)
        connection.commit()

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)

    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))

###############################################################################################

#@debug
@csrf_exempt
def dictionary(request, debug = False):
    response = {}
    class Error(Exception):
        """A custom exception."""
        pass
    try:
        connection = db.connect(**dbconfig)
        cursor = connection.cursor()
        try:
            body = json.loads(request.body.decode("utf-8"))
            response["request"] = body
            id = int(body["id"])
        except Exception as err:
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            SELECT * FROM dictionaries_entries
            WHERE dictionary_id = {id}
            ORDER BY tag ASC
            """
        if debug: print(query)
        cursor.execute(query)
        response["data"] = []
        columns = [description[0] for description in cursor.description]
        result = cursor.fetchall()
        for rowIndex, rowContent in enumerate(result):
            record = {}
            for fieldIndex, fieldValue in enumerate(rowContent):
                record[columns[fieldIndex]] = str(fieldValue) if fieldValue else None

            response["data"].append(record)

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)

    finally:
        if debug: print(response)
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))

###############################################################################################

#@debug
@csrf_exempt
def tag_insert(request, debug = False):

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
        
        auth_grant = get_auth_grant("dictionaries", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("i") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if not (request.method == 'POST'):
            raise Error("No post data")

        try:      
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)
            response["request"] = body
            dictionary_id = int(body["dictionary_id"])
            tag = repr(body["tag"])            
            tag_name = repr(body["tag_name"])

        except Exception as err: 
            print(str(err))
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            INSERT INTO dictionaries_entries
            (dictionary_id, tag, tag_name)
            VALUES
            ({dictionary_id}, {tag}, {tag_name})
             """
        if debug: print(query)
        cursor.execute(query)
        connection.commit()

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)
    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))

###############################################################################################

#@debug
@csrf_exempt
def tag_update(request, debug = False):

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
        
        auth_grant = get_auth_grant("dictionaries", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("u") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if not (request.method == 'POST'):
            raise Error("No post data")

        try:      
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)
            response["request"] = body
            id = int(body["id"])
            tag = repr(body["tag"])            
            FieldName = body["FieldName"]
            FieldValue = repr(body["FieldValue"])

        except Exception as err: 
            print(str(err))
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            UPDATE dictionaries_entries
            SET {FieldName} = {FieldValue}
            WHERE dictionary_id = {id} AND tag = {tag}
             """
        if debug: print(query)
        cursor.execute(query)
        connection.commit()

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)
    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))

###############################################################################################

#@debug
@csrf_exempt
def tag_delete(request, debug = False):

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
        
        auth_grant = get_auth_grant("dictionaries", token, cursor)

        if auth_grant is None:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if auth_grant.find("d") == -1 and auth_grant.find("a") == -1:
            response["status"] = 'not authorized'
            raise Error("No authorization")

        if not (request.method == 'POST'):
            raise Error("No post data")

        try:      
            body = json.loads(request.body.decode("utf-8"))
            if debug: print(body)
            response["request"] = body
            id = int(body["id"])
            tag = repr(body["tag"])            

        except Exception as err: 
            if debug: print(str(err))
            response["error_message"] = str(err)
            raise Error("Unable to decode body of request.")

        query = f"""
            DELETE FROM dictionaries_entries
            WHERE dictionary_id = {id} AND tag = {tag}
             """
        if debug: print(query)
        cursor.execute(query)
        connection.commit()

    except Exception as err:
        response["query"] = query.replace("\n", "").replace("\t", " ")
        response["error"] = str(err)
    finally:
        cursor.close()
        connection.close()
        return HttpResponse(json.dumps(response))
