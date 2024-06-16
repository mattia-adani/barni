import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common.js';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const Impulse = (props) => {
    const data = props.data;
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    var icon = <PowerSettingsNewIcon style= {{color: 'white'}}/>;


    const handleClick = () => {
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
                    action: 'on',
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
//                console.log(response);
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


    var bg = 'black';

    var bc = 'black';

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
                            onClick={() => {
                                handleClick();
                            }}
                        >
                            {icon}
                        </div>}
                    </div>
                    </>
                </div>
        </>
    );
};

export default Impulse;
