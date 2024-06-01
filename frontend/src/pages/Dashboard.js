import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, removeUserSession } from '../utils/common';
import ChangePassword from './ChangePassword';
import DictTag from '../dictionaries/DictTag';


const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
//    console.log("USER", user);

  // handle click event of logout button
  const handleLogout = () => {
    removeUserSession();
    window.location.reload();
//    navigate('/login');
  }

  // handle click event of logout button
  const handleChangePassword = () => {
    navigate('/change-password');
  }
  
  return (
    <>
    <div>
    <DictTag tag= {'Logged in as'}/> {user.username}<br /><br />
      <button className = 'm-2' onClick={handleLogout} ><DictTag tag= {'Logout'}/></button>
      <button className = 'm-2' onClick={handleChangePassword} ><DictTag tag= {'Change password'}/></button>
      {/*<input className = 'm-2' type="button" onClick={() => {navigate('/products')}} value="Products" />
      <input className = 'm-2' type="button" onClick={() => {navigate('/operators')}} value="Operators" />
      <input className = 'm-2' type="button" onClick={() => {navigate('/jobs')}} value="Jobs" />
      <input className = 'm-2' type="button" onClick={() => {navigate('/managers')}} value="Managers" />
      <input className = 'm-2' type="button" onClick={() => {navigate('/kits')}} value="Kits" /> */}

    </div>
    </>
  );
}

export default Dashboard;