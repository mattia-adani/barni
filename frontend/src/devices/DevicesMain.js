import React from 'react';
import {Link, Route, Routes } from 'react-router-dom';

import Devices from './DevicesList';
import Device from './Device';
import DictTag from '../dictionaries/DictTag'


export default function DevicesMain() {

    return (
    <>    
    <Routes>
        <Route index element={<Devices />} />
        <Route path=":device" element={<Device />} />

    </Routes>

    </>

    );

}

