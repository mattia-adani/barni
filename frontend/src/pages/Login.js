import React, { useState } from 'react';
import { setUserSession } from '../utils/common';
import axios from 'axios';
import { MD5 } from 'crypto-js';
import './Login.css';  // Import the CSS file here

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

    axios.post(`${backendurl}${api}`, 
      { username: username.value, password: MD5(password.value).toString() }
    ).then(response => {
        setLoading(false);
        setUserSession(response.data.key, response.data); 
        window.location.reload();    
    }).catch(error => {
      setLoading(false);
      console.log(error);
    });
  }

  return (
    <div className='flex-container'>
      <div className='login-box'>
        <h2>MEMS</h2>
        <h4>Smarthome</h4>
        <div className='input-group'>
          <label>Username</label>
          <input name="username" placeholder="username" type="text" {...username} autoComplete="new-password" />
        </div>
        <div className='input-group' style={{ marginTop: 10 }}>
          <label>Password</label>
          <input name="password" placeholder="password" type="password" {...password} autoComplete="new-password" />
        </div>
        {error && <small style={{ color: 'red' }}>{error}</small>}
        <button type="button" onClick={handleLogin} disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </div>
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
