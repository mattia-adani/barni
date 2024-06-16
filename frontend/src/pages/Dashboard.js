import React from 'react';
import { useNavigate} from 'react-router-dom';
import { getUser, removeUserSession } from '../utils/common';
//import ChangePassword from './ChangePassword';
import DictTag from '../dictionaries/DictTag';


const Dashboard = () => {

  const navigate = useNavigate();
  const user = getUser();

  // handle click event of logout button
  const handleLogout = () => {
    removeUserSession();
    window.location.reload();
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
    </div>
    </>
  );
}

export default Dashboard;