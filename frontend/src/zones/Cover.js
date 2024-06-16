import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common.js';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Cover = (props) => {
    const data = props.data;
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    var icon_up = <KeyboardArrowUpIcon fontSize = 'large' style= {{color: 'white'}}/>;
    var icon_down = <KeyboardArrowDownIcon fontSize = 'large' style= {{color: 'white'}}/>;

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

    var bc = '{';

    return (
        <>
                <div
                    className={`panel m-1`}
                    style={{ backgroundColor: bg, borderTop: '0em solid', borderBottom: '0em solid', borderColor: bc }}
                >
                    <>
                    <div 
                        style={{ display: 'flex', justifyContent: 'center', gap: '1rem', border: '1px solid white'}}
                    >
                        {<div
                            className="btn m-1"
                            onClick={() => {
                                handleClick('up');
                            }}
                        >
                            {icon_up}
                        </div>}
                    </div>
                    </>
                    <div 
                        style={{ display: 'flex', justifyContent: 'center', gap: '1rem', border: '1px solid white'}}
                    >
                    <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize:'1.5em'}} className='my-1'>{data.name}</p>
                    {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
                    </div>
                    <>
                    <div 
                        style={{ display: 'flex', justifyContent: 'center', gap: '1rem'}}
                    >
                        {<div
                            className="btn m-1"
                            onClick={() => {
                                handleClick('down');
                            }}
                        >
                            {icon_down}
                        </div>}
                    </div>
                    </>
                </div>
        </>
    );
};

export default Cover;
