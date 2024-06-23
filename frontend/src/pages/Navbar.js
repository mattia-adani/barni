import React from 'react';
import { NavLink} from 'react-router-dom';
import { getUser, getToken } from '../utils/common';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import DictTag from '../dictionaries/DictTag';

const Navbar = ({handleShow}) => {

  const visible = getToken() ? true : false;
  const user = getUser();
  const auth = user && user.auth;

  return (
    <>
      <div className = 'bg-light' style = {{display: 'grid', gridTemplateColumns: '1fr auto'}}>
      <div>

      <nav className="navbar navbar-expand-lg navbar-light">

        <div className="container-fluid">

        <FontAwesomeIcon className='d-block d-lg-none p-1' icon={faBars}  onClick={handleShow}/>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink
                  className={`nav-link ${!visible ? 'd-block' : 'd-none'}`}
                  to="/login"
                >
                  Login
                </NavLink>
              </li>
              {visible && (
                <>
                  {false && <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/dashboard"
                    >
                      <DictTag tag= {'Dashboard'}/>
                    </NavLink>
                  </li>}
                  {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/living"
                      >
                        <DictTag tag= {'Living'}/>
                      </NavLink>
                    </li>
                  )}
                  {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/studio"
                      >
                        <DictTag tag= {'Studio'}/>
                      </NavLink>
                    </li>
                  )}

                  {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/doors"
                      >
                        <DictTag tag= {'Doors'}/>
                      </NavLink>
                    </li>
                  )}

                  {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/mems"
                      >
                        <DictTag tag= {'MEMS'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/zla"
                      >
                        <DictTag tag= {'ZOE'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/tja"
                      >
                        <DictTag tag= {'TJA'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/lsa"
                      >
                        <DictTag tag= {'Lulu'}/>
                      </NavLink>
                    </li>
                  )}

                  {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/attic"
                      >
                        <DictTag tag= {'Attic'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/patio"
                      >
                        <DictTag tag= {'Patio'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/pool"
                      >
                        <DictTag tag= {'Pool'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/heating"
                      >
                        <DictTag tag= {'Heating'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('test') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/cooling"
                      >
                        <DictTag tag= {'Cooling'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('users') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/unassigned"
                      >
                        <DictTag tag= {'Unassigned'}/>
                      </NavLink>
                    </li>
                  )}

                {auth && auth.hasOwnProperty('users') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/zone/alarm"
                      >
                        <DictTag tag= {'Alarms'}/>
                      </NavLink>
                    </li>
                  )}

                  {auth && auth.hasOwnProperty('users') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/users"
                      >
                        <DictTag tag= {'Users'}/>
                      </NavLink>
                    </li>
                  )}

                  {auth && auth.hasOwnProperty('devices') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/devices"
                      >
                        <DictTag tag= {'Devices'}/>
                      </NavLink>
                    </li>
                  )}
                  {auth && auth.hasOwnProperty('dictionaries') && (
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/dictionaries"
                      >
                        <DictTag tag= {'Dictionaries'}/>
                      </NavLink>
                    </li>
                  )}

                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      </div>
      {visible && (
      <div className='right-div'>
        <nav className="navbar navbar-expand-lg navbar-light">
          <div className="container-fluid">
            <NavLink className="nav-link" to="/dashboard">
              {user.username}
            </NavLink>
          </div>
        </nav>      

      </div>        
      )}

      </div>
    </>
  );
};

export default Navbar;
