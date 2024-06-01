import React, { useState } from 'react';
import axios from 'axios';
import { MD5 } from 'crypto-js';
import { getUser, getToken } from '../utils/common';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'oldPassword') {
      setOldPassword(value);
    } else if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    const backendurl = process.env.REACT_APP_BACKEND_URL;
    const api = '/auth/change_password/'
    const url = `${backendurl}${api}`;

    const user = getUser();

    const request = {
        username: user.username,
        password: MD5(oldPassword).toString(),
        newPassword: MD5(newPassword).toString()
    }

    const options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken(), 
        },
      }

    console.log(options, request)
  
      try {

        const response = await axios.post(url, request, options);
        console.log(response);
        if (response.data.status == 'KO') {
            setError(response.data.message);

        }
        else {
        setSuccess(response.data.status);
        setError('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        }
    } catch (err) {
      setError(err.response.data.message || 'An error occurred');
      setSuccess('');
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Old Password:</label>
          <input
            type="password"
            name="oldPassword"
            value={oldPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Change Password</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}
      </form>
    </div>
  );
};

export default ChangePassword;
