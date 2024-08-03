import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/common';
import { Spinner } from 'react-bootstrap';
import Light from './Light2';
import Impulse from './Impulse';
import Cover from './Cover';
import Sensor from './Sensor';
import CoolingControl from './CoolingControl';
import ClimateControl from './ClimateControl';

const Device = props => {

  const data = props.data;

  var content = <div className="panel border border-2 m-1">{data.name}</div>

  if (data.type === 'Light' || data.type === 'Dimmer') content = <Light data = {data}/>
  else if (data.type === 'RGBW') content = <Light data = {data}/>
  else if (data.type === 'Plug') content = <Light data = {data}/>
  else if (data.type === 'Status') content = <Light data = {data}/>
  else if (data.type === 'Impulse') content = <Impulse data = {data}/>
  else if (data.type === 'Blinds') content = <Cover data = {data}/>
  else if (data.type === 'Shutters') content = <Cover data = {data}/>
  else if (data.type === 'Temperature') content = <Sensor data = {data}/>
  else if (data.type === 'AirCondControl') content = <CoolingControl data = {data}/>
  else if (data.type === 'Cooling') content = <ClimateControl data = {data}/>

  return <>
      <div className="col-12 col-sm-6 col-md-4 col-lg-2 mb-2">
      {content}
      </div>
  </>
}

const Group = props => {
//  console.log("PROPS", props)
  const data = props.data;
  if (props.activeGroup !== '' && !(props.activeGroup === data.group)) return <></>; 
  return (
  <>
    {/*<div className="row">
      *<div className="col-12">
        <div 
          className="panel border border-2 bg-primary"
          style = {{color: 'white'}}
        >
          {data.group}
        </div>            
      </div>
    </div> */}
    <div className="row">
    {data.devices.map((device) => <Device key = {device.device} data = {device}/>)}
    </div>
  </>
  );

}

const Zone = ({sidebarShow, zone}) => {
//  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeGroup, setActiveGroup] = useState('');


  const fetchData = async () => {

  try {

      setLoading(true);
      const url = process.env.REACT_APP_BACKEND_URL;
      const api = '/zones/devices/';

      const request = {
        zone: zone
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
//              console.log(response);
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
  
  useEffect(() => {fetchData()}, [zone]);

  const backgroundImageUrl = `/img/Barni001.jpg`;

  const content = 
  <>
  
  <div className="content"  style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '100vh' }}> 

  <div className='container-fluid mt-0 pt-3' style = {{border: '1px solid black'}}>
    <div className="row">
      <div className="col-12">
        <div 
          className="panel border border-2 p-1 d-block d-lg-none"
          style = {{backgroundColor: 'white', color: 'black'}}
          onClick={sidebarShow}
        >
          {zone}
        </div>            
      </div>
    </div>
    <div className='row'>  
    {data.map ( (group) => 
      <><div className = 'col-4 col-sm-3 col-md-2 col-lg-1'>
      <div 
      className = 'btn m-1 border border-1' 
      onClick = {() => {setActiveGroup(group.group)}}
      style = {{backgroundColor: group.group === activeGroup ? 'black' : 'white', color: group.group === activeGroup ? 'white' : 'black' }}
      >{group.group}</div></div> </>)}  
    </div>
    {data.map ( (group) => <Group key = {group.group} data = {group} activeGroup = {activeGroup}/>)}
  </div>
  </div>

  </>;

  var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;
  
  return (<>{isLoading ? loading : content }</>);


}

export default Zone;
