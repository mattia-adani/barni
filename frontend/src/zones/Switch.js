import React, { useState } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common';
//import { Spinner } from 'react-bootstrap';

const Switch = props => {

    const data = props.data;
    const [isLoading, setLoading] = useState(false);
    const [state, setState] = useState(data.state);

    
    function handleClick(action) {
        
        if (isLoading) return;

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const api = '/zones/test/';
        const token = getToken();
        const user = getUser();

        setLoading(true);
        axios.post(
          `${backendUrl}${api}`,
          {
            username:user.username,
            device: data.device,
            type: data.type,
            action: action
                
          }, // object for POST request body
          {
            headers: {
              'Authorization': `${token}`,
              'Content-Type': 'application/json'
            }
          }
        ).then(
          response => {
            setLoading(false);
            console.log(response);
            setState(action)
          }
        ).catch(error => {
          setLoading(false);
          setError(error);
          console.log(error);
        }).finally(() => {
          setLoading(false);
        });
    };
    
    var bg = "grey"
    if (state === 'on') bg = 'cyan'
    if (state === 'off') bg = 'white'

  return <>
      <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
        <div 
          className={`panel border border-2 m-1`}
          style={{backgroundColor: bg}}
        >
          <p>{data.name}</p>
          {
          data.type == 'Light' ?
          <>
          <div 
            className="btn bg-secondary m-1"
            onClick={() => {handleClick('on')}}
          >
          on
          </div>                  
          <div 
          className="btn bg-secondary m-1"
          onClick={() => {handleClick('off')}}
          >
        off
        </div>
        </>
          : null
          }
        </div>            
      </div>
  </>

}

export default Switch;
