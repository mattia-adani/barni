import React from 'react';
import {Routes, Route, Link } from 'react-router-dom';
//import { useNavigate } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import DictTag from '../dictionaries/DictTag'


//import {getToken, setUserSession, removeUserSession} from '../utils/common.js'
import UsersAccess from './UsersAccess.js';
import UsersList from './UsersList.js';

const UsersMain = () => {

  //  const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            <div className="my-2">
                <Nav variant="tabs">
                    <Nav.Item>
                        <Nav.Link as={Link} to={`/users`} eventKey="users"><DictTag tag= {'Users'}/></Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={Link} to={`/users/access/`} eventKey="access"><DictTag tag= {'Access Control'}/></Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
            <div>
               <Routes>
                   <Route index element={<UsersList />} />
                   <Route path="access/" element={<UsersAccess />} />
                </Routes>
            </div>
        </>
    );
};



export default UsersMain;