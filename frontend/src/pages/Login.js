import React, { useState } from 'react';
import { setUserSession } from '../utils/common';
import axios from 'axios';
import { MD5 } from 'crypto-js';

const Login = () => {

  const username = useFormInput('');
  const password = useFormInput('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const backendurl = process.env.REACT_APP_BACKEND_URL;   
  const api = '/auth/login/'

  // handle button click of login form
  const handleLogin = () => {

    setError(null);
    setLoading(true);

//    setLoading(false);

    axios.post(`${backendurl}${api}`, 
      { username: username.value, password: MD5(password.value).toString() }
    ).then(response => {
        setLoading(false);
        //console.log(response);
        setUserSession(response.data.key, response.data); 
        window.location.reload();    
    }).catch(error => {
      
      setLoading(false);
      console.log(error);
    });
  
    }


  return (
    <div>
      Login<br /><br />
      <div>
        Username<br />
        <input type="text" {...username} autoComplete="new-password" />
      </div>
      <div style={{ marginTop: 10 }}>
        Password<br />
        <input type="password" {...password} autoComplete="new-password" />
      </div>
      {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
      <input type="button" value={loading ? 'Loading...' : 'Login'} onClick={handleLogin} disabled={loading} /><br />
    </div>
  );
}

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);

  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}

export default Login;