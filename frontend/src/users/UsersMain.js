import React from 'react';
import {Link, Route, Routes } from 'react-router-dom';

import Users from './Users';
import User from './User';
import UsersAccess from './UsersAccess';
import DictTag from '../dictionaries/DictTag'


function UsersMain() {
return (
<>
<Link className='mx-2' to={'/users'}><DictTag tag= {'Users'}/></Link>
    
<Routes>
    <Route index element={<Users />} />
    <Route path="access/" element={<UsersAccess />} />
    <Route path="user/:UserID/*" element={<User />} />
</Routes>

</>

);

}

export default UsersMain;
