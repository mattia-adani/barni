import './App.css';
import OperatorsTable from './jobs/dispatching/Operators.js'
import OrdersTable from './jobs/dispatching/Orders.js'
import TasksToAssignTable from './jobs/dispatching/TasksToAssign.js'

import DragAndDropExample from './test/dnd.js'
import Products from './products/ProductsList.js'
import ProductComponents from './products/ProductComponents.js'
import ComponentSequence from './products/ComponentSequence.js'
import Operators from './operators/Operators.js'


import React, { useState, useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function SelectPage({page, getPage, getElapsed}) {

  if (page == 'orders') {return <OrdersTable getPage = {getPage}/>;}
  if (page == 'operators') {return <OperatorsTable getPage = {getPage} getElapsed = {getElapsed}/>;}
  if (page == 'TasksToAssign') {return <TasksToAssignTable getPage = {getPage}/>;}
  else {return <OperatorsTable getPage = {getPage}/>;}
}

function Tabs(props) {

  return (
    <Nav  variant="tabs" defaultActiveKey={props.page}>
      <Nav.Item>
        <Nav.Link onClick = {() => {props.setPage("operators")}} activekey = "operators" eventKey="operators">Operators</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link onClick = {() => {props.setPage("orders")}} activekey = "orders" eventKey="orders">Orders</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link onClick = {() => {props.setPage("TasksToAssign")}} activekey = "TasksToAssign" eventKey="TasksToAssign">Tasks to assign</Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

/*
const Clock = ({setElapsed}) => {

  const url = 'http://localhost:8000/operators/?r=clock'   
    
  const [obj, setObj] = useState([]);

  const update = () => {
    fetch(url)
    .then((res) => {
    return res.json();
    })
    .then((data) => {
    //console.log(data);
    setObj(data);
  })
    .catch(rejected => {
    console.log(rejected);
  });
  } 

  setTimeout(update, 3000);

  var Started = obj.Started;
  var Completed = obj.Completed;
  var elapsed = obj.elapsed;
  var elapsed_sec = obj.elapsed_sec;
  var time_acceleration = obj.time_acceleration;
  
  setElapsed(elapsed_sec);
  
  return (
      <div>
      <span className= "mx-1">Started: {Started}</span>
      <span className= "mx-1">Current: {Completed}</span>
      <span className= "mx-1">Elapsed: {elapsed}</span>
      <span className= "mx-1">Elapsed (sec): {elapsed_sec} @ {time_acceleration}x</span>
      </div>);
}
*/


function Clock() {

  const [time, setTime] = useState(new Date());

  const apiUrl = process.env.REACT_APP_API_URL;
  const url = apiUrl + '/operators/?r=clock'   
  
  const [obj, setObj] = useState([]);
/*
  const dns = require('dns');

  const hostname = 'backend'; // replace with your server's hostname
  var ip;
  
  // Resolve the hostname to an IP address
  dns.resolve4(hostname, (err, addresses) => {
    if (err) {
      console.error(`Error resolving IP for ${hostname}: ${err.message}`);
      return;
    }
  
    ip = addresses[0];
    console.log(`IP address for ${hostname}: ${ip}`);
  });
*/
  const update = () => {
    fetch(url)
    .then((res) => {
    return res.json();
    })
    .then((data) => {
    //console.log(data);
    setObj(data);
  })
    .catch(rejected => {
    console.log(rejected);
  });
  } 


  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
      // If you need to update App's state, consider using a prop callback
      // instead of directly calling setElapsed here
      update()
  //    console.log(ip)

    }, 3000);

    return () => clearInterval(timerId); // Cleanup the interval on component unmount
  }, []); // Empty dependency array ensures the effect runs only once on mount

  var Started = obj.Started;
  var Completed = obj.Completed;
  var elapsed = obj.elapsed;
  var elapsed_sec = obj.elapsed_sec;
  var time_acceleration = obj.time_acceleration;


  // Rest of your Clock component logic
  return (
    <div>
      <p>{time.toLocaleTimeString()}</p>
      <div>
      <span className= "mx-1">Started: {Started}</span>
      <span className= "mx-1">Current: {Completed}</span>
      <span className= "mx-1">Elapsed: {elapsed}</span>

      <span className= "mx-1">Elapsed (sec): {elapsed_sec} @ {time_acceleration}x</span>
      </div>

    </div>
  );
}





function App() {

//  console.log(process.env.REACT_APP_API_URL);
  const [page, setPage] = useState('operators');
  const [elapsed, setElapsed] = useState(0);
  const getElapsed = () => elapsed;
  const getPage = () => page;

  return (
  <div className="App">
        <h1>KUOYO Control Panel</h1>
        {/*<h5><Clock /></h5>*/}
        <Tabs page={page} setPage={setPage} />

    <Router>
      <Routes>
      <Route path="/" element={<SelectPage page={page} getPage={getPage} getElapsed={getElapsed} />} />
      <Route path="/dnd" element={<DragAndDropExample />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:ProductID/components/" element={<ProductComponents />} />     
      <Route path="/products/:ProductID/components/:ComponentID/sequence/" element={<ComponentSequence />} />     
      <Route path="/operators/" element={<Operators />} />     

      </Routes>
    </Router>
    </div>
  );
}

export default App;
