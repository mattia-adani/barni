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

#print(jsondata)
colors = []

try:

    with open("{}/{}".format(workingDir, "colors1.json")) as f:
        for line in f:
            cols = json.loads(line)
            for hex, color in cols.items():
                print(hex, color)
                _col = color
                _col["hex"] = hex
                colors.append(_col)

except Exception as err:
    print(str(err))


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

    for color in colors:
        query = f"""
                INSERT INTO colors 
                (hex, color_name, color_group, red, green, blue, luma, hue)
                VALUES
                ({repr(color['hex'])}, '{color['name'].replace("'s", "")}', {repr(color['group'])}, {repr(color['red'])}, {repr(color['green'])}, {repr(color['blue'])}, {repr(color['luma'])}, {repr(color['hue'])})
                ON CONFLICT (hex) DO UPDATE
                SET 
                color_name = '{color['name'].replace("'s", "")}',
                color_group = {repr(color['group'])},
                red = {repr(color['red'])},
                green = {repr(color['green'])},
                blue = {repr(color['blue'])},
                luma = {repr(color['luma'])},
                hue = {repr(color['hue'])}
                """
        try:
            cursor.execute(query)
            connection.commit()
        except Exception as err:
            print(str(err))

    for element in jsondata:
        ObjectID=element['ObjectID']
        if ObjectID is None: continue
        if ObjectID == '': continue
        for field, value in element.items():
            if field=='ObjectID': continue
            if value is None: continue
            if value=='': continue
            json={"ObjectID": ObjectID, "Property": field,  "Value": value}
#            print(json)

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

