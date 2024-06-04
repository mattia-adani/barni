import React, { useState } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common.js';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import LightModeIcon from '@mui/icons-material/LightMode';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const Dimmer = (props) => {
    const data = props.data;
    const [isLoading, setLoading] = useState(false);
    const [state, setState] = useState(data.state);
    const [brightness, setBrightness] = useState(parseInt(data.brightness * 100 / 255));
    const [error, setError] = useState(null);

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
                if (action === 'on') setBrightness(100);
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

    var bg = 'grey';
    if (state === 'on') bg = 'black';
    if (state === 'off') bg = 'black';

    var bc = 'black';
    if (state === 'on') bc = 'yellow';
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
                        {(state == 'off') && <div
                            className="btn m-1"
                            onClick={() => {
                                handleClick('on');
                            }}
                        >
                            <LightModeIcon style= {{color: 'white'}} />
                        </div>}
                        {(state == 'on') && <div
                            className="btn m-1"
                            onClick={() => {
                                handleClick('off');
                            }}
                        >
                            <PowerSettingsNewIcon style= {{color: 'white'}}/>
                        </div>}
                    </div>
                    {state === 'on' && (
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

export default Dimmer;
