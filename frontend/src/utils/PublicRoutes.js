
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from './common';

// handle the public routes
const PublicRoutes = () => {
  return !getToken() ? <Outlet /> : <Navigate to="/zone/doors" />
}

export default PublicRoutes;
