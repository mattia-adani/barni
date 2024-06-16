import React from 'react';
import {useState, useEffect} from 'react'
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getToken, removeUserSession } from './utils/common';

import PrivateRoutes from './utils/PrivateRoutes.js';
import PublicRoutes from './utils/PublicRoutes.js';

import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Navbar from './pages/Navbar.js';
import UsersMain from './users/UsersMain.js';
import DevicesMain from './devices/DevicesMain.js';
import DictionariesGate from './dictionaries/DictionariesGate.js';
import ChangePassword from './pages/ChangePassword.js';
import Sidebar from './pages/Sidebar.js';
import Zone from './zones/Zone.js'

function App() {
  
const [authLoading, setAuthLoading] = useState(true);

const [show, setShow] = useState(false);
const handleClose = () => setShow(false);
const handleShow = () => setShow(true);


useEffect(() => {

  const token = getToken();
  if (!token) {
    return;
  }

  const url = process.env.REACT_APP_BACKEND_URL;   
  const api = '/auth/verify/';   
  
  axios.get(`${url}${api}${token}`).then(response => {

    if (!response.hasOwnProperty("data") || !response.data.hasOwnProperty("status") || !response.data.status === "OK")
    {
      removeUserSession();
      window.location.href = '/login';
    } 
      setAuthLoading(false);
    } ).catch(error => {
        removeUserSession();
        setAuthLoading(false);
        console.log(error)
        window.location.href = '/login';
  });


}, []);

if (authLoading && getToken()) {
  return <div className="content">Checking Authentication...</div>
}

  return (
    <BrowserRouter>
        <div className="App">
        
        <Sidebar show = {show} handleClose={handleClose}/>   
        <Navbar show = {show} handleShow = {handleShow}/>

        <div className="content"> 

{/*        <div className="container-fluid mt-3">
          <div className="row">
            <div className="col">
*/}
            <Routes>
                <Route path="*" element={<NotFound />} />
                <Route element={<PublicRoutes />}>
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                </Route>
                <Route element={<PrivateRoutes />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dictionaries/*" element={<DictionariesGate />} />
                  <Route path="/users/*" element={<UsersMain />} />
                  <Route path="/devices/*" element={<DevicesMain />} />
                  <Route path="/change-password/" element={<ChangePassword />} />     
                  <Route path="/zone/living" element={<Zone zone={'LIVING'} />} />     
                  <Route path="/zone/studio" element={<Zone zone={'STUDIO'} />} />     
                  <Route path="/zone/doors" element={<Zone zone={'DOORS'} />} />     
                  <Route path="/zone/tja" element={<Zone zone={'TJA'} />} />     
                  <Route path="/zone/zla" element={<Zone zone={'ZLA'} />} />     
                  <Route path="/zone/lsa" element={<Zone zone={'LSA'} />} />     
                  <Route path="/zone/mems" element={<Zone zone={'MEMS'} />} />     
                  <Route path="/zone/attic" element={<Zone zone={'ATTIC'} />} />     
                  <Route path="/zone/patio" element={<Zone zone={'PATIO'} />} />     
                  <Route path="/zone/pool" element={<Zone zone={'POOL'} />} />     

                </Route>
              </Routes>
{/*
            </div>
          </div>
        </div>
*/}

        </div>
      </div>

    </BrowserRouter>
  );
};

export default App;
