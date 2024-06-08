import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/common';
import { Spinner } from 'react-bootstrap';
import Light from './Light2';
import Impulse from './Impulse';
import Cover from './Cover';

//import Switch from './Switch';
//import Dimmer from './Dimmer';


const Device = props => {

  const data = props.data;

  if (data.type === 'Light' || data.type === 'Dimmer') return <Light data = {data}/>
  else if (data.type === 'RGBW') return <Light data = {data}/>
  else if (data.type === 'Plug') return <Light data = {data}/>
  else if (data.type === 'Impulse') return <Impulse data = {data}/>
  else if (data.type === 'Blinds') return <Cover data = {data}/>
  else if (data.type === 'Shutters') return <Cover data = {data}/>
  
  return <>
      <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
        <div 
          className="panel border border-2 m-1"
        >
          {data.name}
        </div>            
      </div>
  </>
}

const Group = props => {

  const data = props.data;
  if (!(props.activeGroup === data.group)) return <></>; 
  return (
  <>
    <div className="row">
      <div className="col-12">
        <div 
          className="panel border border-2 bg-primary"
          style = {{color: 'white'}}
        >
          {data.group}
        </div>            
      </div>
    </div>
    <div className="row">
    {data.devices.map((device) => <Device key = {device.device} data = {device}/>)}
    </div>
  </>
  );

}

const Test = () => {
//  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeGroup, setActiveGroup] = useState('Lights');


  const fetchData = async () => {

  try {

      setLoading(true);
      const url = process.env.REACT_APP_BACKEND_URL;
      const api = '/zones/devices/';

      const request = {
        zone: 'LIVING'
      };

      const options = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken(), 
          },
        }

        axios.post(`${url}${api}`, request, options).then(
          response => {
              setLoading(false);
              console.log(response);
              setData(response.data.data);
              console.log(response.data.data);
          }
      ).catch(
          error => {
              setLoading(false);
              console.log(error);
          }
      );


    } catch (error) {console.log('Error fetching data: '+ error)
    } finally {setLoading(false);}

  };
  
  // fetch data only on mount
  useEffect(() => {fetchData()}, []);
  /*
  const content = (
    <>
      <div className="container">
        <div className="row">
          <div className="col-3">
            <div 
              className="btn bg-secondary"
              onClick={handleClick}
            >
              button
            </div>            
          </div>
        </div>
      </div>
    </>
  );
  */

  const content = 
  <>
  <div className='container'>
    <div className='row'>  
    {data.map ( (group) => 
      <><div className = 'col-4 col-sm-2 col-md-1 col-lg-1'>
      <div 
      className = 'btn m-1 border border-1' 
      onClick = {() => {setActiveGroup(group.group)}}
      style = {{backgroundColor: group.group === activeGroup ? 'black' : 'white', color: group.group === activeGroup ? 'white' : 'black' }}
      >{group.group}</div></div> </>)}  
    </div>
    {data.map ( (group) => <Group key = {group.group} data = {group} activeGroup = {activeGroup}/>)}
  </div>
  </>;

  var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;
  
  return (<>{isLoading ? loading : content }</>);


}

export default Test;
