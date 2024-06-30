import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common.js';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import TemperatureGraph from './TemperatureGraph.js';

import RGBWColorModal from './colorModal.js';

const Sensor = (props) => {

    const data = props.data;

    const [isLoading, setLoading] = useState(false);
    const [state, setState] = useState(data.state);

    const [error, setError] = useState(null);

    var icon = <></>;
    if (data.type === 'Temperature')
        icon = <DeviceThermostatIcon style= {{color: 'white'}} />;

    var bg = 'black'
    var bc = 'grey'

    const sync = () => {

//        console.log("syncing")
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
                setTimeout(update, 10000);
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
      

    useEffect(() => {
        sync();
        const intervalId = setInterval(sync, 2000);
        return () => clearInterval(intervalId);
      }, []);
    
    return (
        <>
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
                        {<div
                            className="btn m-1"
                        >
                            {icon} <span style={{color: 'white', fontWeight: 'bold', fontSize:'1.5em'}}>{data.state}</span>
                        </div>}
                    </div>
                    {data.hasOwnProperty('log') && parseInt(data.log) === 1 && (<TemperatureGraph device= {data.device}/>)}
                    </>
                </div>
        </>
    );
};

export default Sensor;