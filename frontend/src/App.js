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
const sidebarClose = () => setShow(false);
const sidebarShow = () => setShow(true);

useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('Service Worker registered', reg))
      .catch((err) => console.error('Service Worker registration failed', err));
  }
}, []);


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
        
        <Sidebar show = {show} handleClose={sidebarClose}/>   
        <Navbar show = {show} handleShow = {sidebarShow}/>

        <div className="content"> 
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
                  <Route path="/zone/living" element={<Zone sidebarShow={sidebarShow} zone={'LIVING'} />} />     
                  <Route path="/zone/studio" element={<Zone sidebarShow={sidebarShow} zone={'STUDIO'} />} />     
                  <Route path="/zone/doors" element={<Zone sidebarShow={sidebarShow} zone={'DOORS'} />} />     
                  <Route path="/zone/tja" element={<Zone sidebarShow={sidebarShow} zone={'TJA'} />} />     
                  <Route path="/zone/zla" element={<Zone sidebarShow={sidebarShow} zone={'ZLA'} />} />     
                  <Route path="/zone/lsa" element={<Zone  sidebarShow={sidebarShow} zone={'LSA'} />} />     
                  <Route path="/zone/mems" element={<Zone  sidebarShow={sidebarShow} zone={'MEMS'} />} />     
                  <Route path="/zone/attic" element={<Zone  sidebarShow={sidebarShow} zone={'ATTIC'} />} />     
                  <Route path="/zone/patio" element={<Zone  sidebarShow={sidebarShow} zone={'PATIO'} />} />     
                  <Route path="/zone/pool" element={<Zone  sidebarShow={sidebarShow} zone={'POOL'} />} />     

                </Route>
              </Routes>
        </div>
      </div>

    </BrowserRouter>
  );
};

export default App;
