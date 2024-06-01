import React, { useState } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common';

const Test = () => {
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);

  function handleClick() {

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const api = '/zones/test/';
    const token = getToken();
    const user = getUser();
    console.log(user);
    setLoading(true);
    axios.post(
      `${backendUrl}${api}`,
      {
        username:user.username,
        element: 'test',
        action: 'click'
    
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
      }
    ).catch(error => {
      setLoading(false);
      setError(error);
      console.log(error);
    }).finally(() => {
      setLoading(false);
    });
  }

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-3">
            <div 
              className="btn bg-secondary"
              onClick={handleClick}
            >
              button
            </div>            
          </div>
        </div>
      </div>
    </>
  );
}

export default Test;
