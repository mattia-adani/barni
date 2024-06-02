import os, sys
import json
import pandas as pd
import psycopg2 as db

try:
    filename = sys.argv[1]
    if filename is None or filename =='': filename='BarniKNX.xlsx'
except Exception as err:
    filename='BarniKNX.xlsx'

fullFileName=os.path.abspath(__file__)
workingDir=os.path.dirname(fullFileName)
projectDir=os.path.dirname(workingDir)

print(fullFileName, workingDir, projectDir)

df = pd.read_excel("{}/{}".format(workingDir, filename))
jsonstring=df.to_json(orient='records')
jsondata=json.loads(jsonstring)

print(jsondata)

dbconfig = {
    'host': os.environ.get('DB_HOST'),
    'port': os.environ.get('DB_PORT'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_DATABASE')
}

try:
    connection = db.connect(**dbconfig)
    cursor = connection.cursor()

    for element in jsondata:
        ObjectID=element['ObjectID']
        if ObjectID is None: continue
        if ObjectID == '': continue
        for field, value in element.items():
            if field=='ObjectID': continue
            if value is None: continue
            if value=='': continue
            json={"ObjectID": ObjectID, "Property": field,  "Value": value}
            print(json)

            query = f"""
                    INSERT INTO devices 
                    (device, property, value)
                    VALUES
                    ({repr(ObjectID)}, {repr(field)}, {repr(value)})
                    ON CONFLICT (device, property) DO UPDATE
                    SET value = {repr(value)}
                    """
            try:
                cursor.execute(query)
                connection.commit()
            except Exception as err:
                print(str(err))

except Exception as err:
    print(str(err))

finally:
    cursor.close()
    connection.close()

