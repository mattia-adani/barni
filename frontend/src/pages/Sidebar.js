// Sidebar.js
import React from 'react';
import { Offcanvas, Nav } from 'react-bootstrap';
import './Sidebar.css'; 
import { getUser, getToken } from '../utils/common';
import { useNavigate} from 'react-router-dom';
import DictTag from '../dictionaries/DictTag';

const Sidebar = ({show, handleClose}) => {

  const visible = getToken() ? true : false;
  const user = getUser();
  const auth = user && user.auth;
  const navigate = useNavigate();

  return (
    <>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {!visible && ( <span className="nav-link" onClick ={() => {handleClose(); navigate("/login")}}><DictTag tag= {'Login'}/></span> )}
            {auth && auth.hasOwnProperty('test') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/zone/living")}}><DictTag tag= {'Living'}/></span> )}
            {auth && auth.hasOwnProperty('test') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/zone/studio")}}><DictTag tag= {'Studio'}/></span> )}
            {auth && auth.hasOwnProperty('test') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/zone/doors")}}><DictTag tag= {'Doors'}/></span> )}
            {auth && auth.hasOwnProperty('test') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/zone/mems")}}><DictTag tag= {'Camera MEMS'}/></span> )}
            {auth && auth.hasOwnProperty('test') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/zone/zla")}}><DictTag tag= {'Camera ZOE'}/></span> )}
            {auth && auth.hasOwnProperty('test') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/zone/tja")}}><DictTag tag= {'Camera Tommy'}/></span> )}
            {auth && auth.hasOwnProperty('test') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/zone/lsa")}}><DictTag tag= {'Camera Lulu'}/></span> )}


            <span className="nav-link" onClick ={() => {handleClose(); navigate("/dashboard")}}><DictTag tag= {'Dashboard'}/></span> 
            {auth && auth.hasOwnProperty('dictionaries') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/dictionaries")}}><DictTag tag= {'Dictionaries'}/></span> )}
            {auth && auth.hasOwnProperty('users') && (<span className="nav-link" onClick ={() => {handleClose(); navigate("/users")}}><DictTag tag= {'Users'}/></span> )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;