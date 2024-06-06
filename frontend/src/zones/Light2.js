import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common.js';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import LightModeIcon from '@mui/icons-material/LightMode';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const Light = (props) => {
    const data = props.data;
    const [isLoading, setLoading] = useState(false);
    const [state, setState] = useState(data.state);
    const [brightness, setBrightness] = useState(parseInt(data.hasOwnProperty('brightness') ? data.brightness * 100 / 255 : 100));
    const [error, setError] = useState(null);

    if(data.type == 'Impulse') console.log(data)

    var icon_on = <LightModeIcon style= {{color: 'white'}} />;
    var icon_off = <PowerSettingsNewIcon style= {{color: 'white'}}/>;
    var color_on = 'yellow';

    if (data.type == 'Plug' || data.type == 'Switch') {
        icon_on = <FlashOnIcon style= {{color: 'white'}} />;
        icon_off = <FlashOffIcon style= {{color: 'white'}} />;;
        color_on = 'cyan';
    }

    const sync = () => {

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const api = '/zones/test/';
        const token = getToken();
        const user = getUser();

        axios
            .post(
                `${backendUrl}${api}`,
                {
                    username: user.username,
                    device: data.device,
                    type: data.type,
                    action: 'sync',
                },
                {
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((response) => {
//                console.log(response);
                setTimeout(update, 2000);
            })
            .catch((error) => {
                setError(error);
                console.log(error);
            })
            .finally(() => {
            });
    };

    const update = async () => {

        try {
      
            setLoading(true);
            const url = process.env.REACT_APP_BACKEND_URL;
            const api = '/zones/device/';
      
            const request = {
              device: data['device']
            };
      
            const options = {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': getToken(), 
                },
              }
      
              axios.post(`${url}${api}`, request, options).then(
                response => {
                    setLoading(false);
//                    console.log(response);
//                    setData(response.data.data);
                    var thisDevice =  response.data.data;
                    if (thisDevice.hasOwnProperty('state')) setState(thisDevice['state'])  
                    if (thisDevice.hasOwnProperty('brightness')) setBrightness(thisDevice['brightness'])  
                    //console.log("DATA", response.data.data);
                }
            ).catch(
                error => {
                    setLoading(false);
                    console.log(error);
                }
            );
      
          } catch (error) {console.log('Error fetching data: '+ error)
          } finally {setLoading(false);}
      
    };
      
    const handleSliderChange = (event, value) => {
        if (isLoading) return;

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const api = '/zones/test/';
        const token = getToken();
        const user = getUser();

        setLoading(true);
        axios
            .post(
                `${backendUrl}${api}`,
                {
                    username: user.username,
                    device: data.device,
                    type: data.type,
                    action: 'brightness',
                    value: parseInt(value * 255 / 100),
                },
                {
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((response) => {
                setLoading(false);
                console.log(response);
                setBrightness(value);
                if (value > 0) setState('on');
                if (value === 0) setState('off');
            })
            .catch((error) => {
                setLoading(false);
                setError(error);
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleClick = (action) => {
        if (isLoading) return;

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const api = '/zones/test/';
        const token = getToken();
        const user = getUser();

        setLoading(true);
        axios
            .post(
                `${backendUrl}${api}`,
                {
                    username: user.username,
                    device: data.device,
                    type: data.type,
                    action: action,
                },
                {
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((response) => {
                setLoading(false);
                console.log(response);
                setState(action);
                if (action === 'on') setBrightness(255);
                if (action === 'off') setBrightness(0);
            })
            .catch((error) => {
                setLoading(false);
                setError(error);
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };


    useEffect(sync, []);

    var bg = 'grey';
    if (state === 'on') bg = 'black';
    if (state === 'off') bg = 'black';

    var bc = 'black';
    if (state === 'on') bc = color_on;
    if (state === 'off') bc = 'black';

    return (
        <>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
                <div
                    className={`panel m-1`}
                    style={{ backgroundColor: bg, borderTop: '1em solid', borderBottom: '1em solid', borderColor: bc }}
                >
                    <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize:'1.5em' }} className='my-1'>{data.name}</p>
                    {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
                    <>
                    <div 
                        style={{ display: 'flex', justifyContent: 'center', gap: '1rem'}}
                    >
                        {(state == 'off' && data.type !== 'Impulse') && <div
                            className="btn m-1"
                            onClick={() => {
                                handleClick('on');
                            }}
                        >
                            {icon_on}
                        </div>}
                        {(state == 'on' || data.type == 'Impulse') && <div
                            className="btn m-1"
                            onClick={() => {
                                handleClick('off');
                            }}
                        >
                            {icon_off}
                        </div>}
                    </div>
                    {state === 'on' && data.hasOwnProperty('brightness') && (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Slider
                                value={brightness}
                                aria-label="Default"
                                valueLabelDisplay="auto"
                                onChangeCommitted={handleSliderChange}
                                sx={{ width: '80%' }}
                                style={{color: 'yellow'}}
                            />
                        </Box>
                        )}
                    </>
                </div>
            </div>
        </>
    );
};

export default Light;
