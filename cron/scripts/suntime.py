import requests
from datetime import datetime, timedelta
import pytz
from common import variable, switch

# Coordinates for Milan, Italy
milan_lat = 45.4642
milan_lng = 9.1900

def get_sun_times(lat, lng):
    url = f"https://api.sunrise-sunset.org/json?lat={lat}&lng={lng}&formatted=0"
    response = requests.get(url)
    data = response.json()['results']
    
    # Parse UTC times
    sunrise_utc = datetime.fromisoformat(data['sunrise'])
    sunset_utc = datetime.fromisoformat(data['sunset'])
    
    # Convert to Milan time
    milan_tz = pytz.timezone('Europe/Rome')
    sunrise_milan = sunrise_utc.astimezone(milan_tz)
    sunset_milan = sunset_utc.astimezone(milan_tz)
    
    return sunrise_milan, sunset_milan

def main(debug=False):

    enable = variable('night_lights')
    if enable is None or not isinstance(enable, dict): return
    if 'data' not in enable: return
    try:
        if not bool(int(enable['data'])): return
    except Exception as err:
        print(str(err))
        return

    milan_tz = pytz.timezone('Europe/Rome')
    
    sunrise, sunset = get_sun_times(milan_lat, milan_lng)
    stop = sunrise - timedelta(hours = 0)
    start = sunset + timedelta(hours = 0)

    print(f"Sunrise in Milan (local time): {sunrise.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"Sunset in Milan (local time): {sunset.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"Start: {start.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"Stop: {stop.strftime('%Y-%m-%d %H:%M:%S %Z')}")

    now = datetime.now(milan_tz)
    print("Current time:", now.strftime('%Y-%m-%d %H:%M:%S %Z'))

    '''
    value = variable('OUTDOOR_lucigiardino', property='address_switch')

    if value is None or not isinstance(value, dict) or 'data' not in value:
        print("Invalid or missing data for OUTDOOR_lucigiardino")
        return

    address = value['data']
    print("Device address:", address)

    '''
    for device in ['OUTDOOR_lucigiardino', 'SWITCH_1_0_29_K', 'SWITCH_1_0_37_O', 'OUTDOOR_plug6']:

        # Check if it's time to turn on or off the lights
        if now > start or now < stop:
            print("It's nighttime. Turning on the lights.")
            # Add code here to turn on the lights
            switch(device, 'on')
        else:
            print("It's daytime. Turning off the lights.")
            # Add code here to turn off the lights
            switch(device, 'off')

if __name__ == "__main__":
    main()