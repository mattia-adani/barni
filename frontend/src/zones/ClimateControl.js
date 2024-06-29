import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common.js';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import LightModeIcon from '@mui/icons-material/LightMode';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';

const ClimateControl = ({ data }) => {
    const [isLoading, setLoading] = useState(false);
    const [state, setState] = useState(data.state);
    const [targetTemperature, setTargetTemperature] = useState(data.target_temperature ? parseInt(data.target_temperature) : 20);
    const [temperature, setTemperature] = useState(data.temperature ? parseInt(data.temperature) : '');
    const [error, setError] = useState(null);
    const [enabled, setEnabled] = useState(parseInt(data.cooling_enabled));

    const iconOn = useMemo(() => <LightModeIcon style={{ color: 'white' }} />, []);
    const iconOff = useMemo(() => <PowerSettingsNewIcon style={{ color: 'white' }} />, []);
    const thermostatIcon = useMemo(() => <DeviceThermostatIcon style={{ color: 'white' }} />, []);

    const bg = useMemo(() => state === 'on' ? 'black' : 'black', [state]);
    const borderColor = useMemo(() => state === 'on' ? 'cyan' : 'grey', [state]);

    const marks = useMemo(() => {
        const result = [];
        for (let i = 24; i <= 28; i += 0.5) {
            result.push({ value: i, label: `${i}°` });
        }
        return result;
    }, []);

    const sync = useCallback(() => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const api = '/zones/test/';
        const token = getToken();
        const user = getUser();

        const syncData = async (deviceSuffix) => {
            try {
                await axios.post(
                    `${backendUrl}${api}`,
                    {
                        username: user.username,
                        device: `${data.device}_${deviceSuffix}`,
                        type: data.type,
                        action: 'sync',
                    },
                    {
                        headers: {
                            Authorization: `${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            } catch (error) {
                setError(error.message);
                console.log(error);
            }
        };

        Promise.all([syncData('temperature'), syncData('switch')]).then(() => {
            setTimeout(update, 2000);
        });
    }, [data.device, data.type]);

    const update = useCallback(async () => {
        setLoading(true);
        const url = process.env.REACT_APP_BACKEND_URL;
        const api = '/zones/device/';
        const request = { device: data.device };
        const options = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: getToken(),
            },
        };

        try {
            const response = await axios.post(`${url}${api}`, request, options);
            const thisDevice = response.data.data;
            if (thisDevice.state) setState(thisDevice.state);
            if (thisDevice.target_temperature) setTargetTemperature(thisDevice.target_temperature);
            if (thisDevice.temperature) setTemperature(thisDevice.temperature);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [data.device]);

    const handleSliderChange = useCallback((event, value) => {
        if (isLoading) return;

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const api = '/devices/property/update/';
        const token = getToken();
        const user = getUser();
        console.log(`${backendUrl}${api}`)
        setLoading(true);
        axios
            .post(
                `${backendUrl}${api}`,
                {
                    username: user.username,
                    device: data.device,
                    property: 'target_temperature',
                    target_field: 'value',
                    target_value: parseFloat(value),
                },
                {
                    mode: 'cors',
                    withCredentials: true,
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((response) => {
                setLoading(false);
                console.log(response);
                setTargetTemperature(value);
            })
            .catch((error) => {
                setLoading(false);
                setError(error.message);
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isLoading, data.device, data.type]);

    const handleEnable = useCallback((event, value) => {
        if (isLoading) return;

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const api = '/devices/property/update/';
        const token = getToken();
        const user = getUser();
        console.log(`${backendUrl}${api}`);
        console.log("new value", value) 
        setEnabled(value)

        setLoading(true);
        axios
            .post(
                `${backendUrl}${api}`,
                {
                    username: user.username,
                    device: data.device,
                    property: 'cooling_enabled',
                    target_field: 'value',
                    target_value: value ? 1 : 0,
                },
                {
                    mode: 'cors',
                    withCredentials: true,
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((response) => {
                setLoading(false);
                console.log(response);
            })
            .catch((error) => {
                setLoading(false);
                setError(error.message);
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isLoading, data.cooling_enabled]);

    const handleClick = useCallback((action) => {
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
                    device: `${data.device}_switch`,
                    type: 'Plug',
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
            })
            .catch((error) => {
                setLoading(false);
                setError(error.message);
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isLoading, data.device]);

    useEffect(() => {
        sync();
    }, [sync]);

    console.log(data)
    return (
        <div
            className="panel m-1"
            style={{ backgroundColor: bg, borderTop: '1em solid', borderBottom: '1em solid', borderColor }}
        >
            <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.5em' }} className='my-1'>
                {data.name}
            </p>
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                {state === 'off' ? (
                    <div className="btn m-1" onClick={() => handleClick('on')}>
                        {iconOn}
                    </div>
                ) : (
                    <div className="btn m-1" onClick={() => handleClick('off')}>
                        {iconOff}
                    </div>
                )}
            </div>
            <div className="btn m-1">
            <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.5em' }} className='my-1'>
                {thermostatIcon} <span>{temperature}</span>
            </p>
            </div>
            {['off', 'on'].includes(state) && (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <FormControlLabel 
                    control={<Switch 
                        checked={enabled}
                        onChange={handleEnable}
                        inputProps={{ 'aria-label': 'controlled' }}
                        color='warning' 
                        size = 'large'/>} 
                    label="Enabled" />
                </Box>
            )}

            {['off', 'on'].includes(state) && (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Slider
                        value={targetTemperature}
                        min={23}
                        max={28}
                        step={0.5}
                        marks={marks}
                        aria-label="Target Temperature"
                        valueLabelDisplay="on"
                        onChangeCommitted={handleSliderChange}
                        sx={{ width: '80%' }}
                        style={{ color: 'yellow' }}
                    />
                </Box>
            )}
        </div>
    );
};

export default ClimateControl;
