import React, { useState } from 'react';
import { setUserSession } from '../utils/common';
import axios from 'axios';
import { MD5 } from 'crypto-js';
import { Box, Button, CircularProgress, TextField, Typography, Container, Paper } from '@mui/material';

const Login = () => {

  const username = useFormInput('');
  const password = useFormInput('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const backendurl = process.env.REACT_APP_BACKEND_URL;   
  const api = '/auth/login/';

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
      setError('Login failed. Please check your credentials.');
      console.log(error);
    });
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          MEMS
        </Typography>
        <Typography component="h1" variant="p" align="center">
          Smarthome
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            {...username}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...password}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
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
