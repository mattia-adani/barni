import paho.mqtt.client as mqtt

def on_connect(*args):
    print(args)
#    print(args[0])
#    print(args[1])
#    print(args[2])
#    print(args[3])
#    print(args[4])
    client = args[0]
    rc = args[3]
    print("Connected with result code "+str(rc))
    client.subscribe("test/topic")  # Subscribe to the desired topic
    print("Subscribed to test/topic")

def on_message(*args):
    print("ARGS", args)
    client = args[0]
    userdata = args[1]
    msg = args[2]
    print("Received message")  # Print the received message
    print(msg.topic+" "+str(msg.payload))  # Print the received message

client = mqtt.Client(protocol=mqtt.MQTTv5, client_id="client_identifier")  # Use latest version
#user = 'test'
#password = 'password'

#client.username_pw_set(user,password=password)

client.on_connect = on_connect
client.on_message = on_message

client.connect("mqtt", 1883, 60)  # Replace with your MQTT broker URL and port
client.loop_forever()