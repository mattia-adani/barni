import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../utils/common';
import { Spinner } from 'react-bootstrap';
import Light from './Light';
import Switch from './Switch';


const Device = props => {

  const data = props.data;

  if (data.type == 'Light') return <Light data = {data}/>
  if (data.type == 'Plug') return <Switch data = {data}/>
  
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
  return (
  <>
  <div className="container">
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
  </div>
  </>
  );

}

const Test = () => {
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  function handleClick() {

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const api = '/zones/test/';
    const token = getToken();
    const user = getUser();
    console.log(user);
    setLoading(true);
    axios.post(
      `${backendUrl}${api}`,
      {
        username:user.username,
        device: 'StudioLight',
        type: 'light',
        action: 'on'
            
      }, // object for POST request body
      {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      }
    ).then(
      response => {
        setLoading(false);
        console.log(response);
      }
    ).catch(error => {
      setLoading(false);
      setError(error);
      console.log(error);
    }).finally(() => {
      setLoading(false);
    });
  }

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

  const content = data.map ( (group) => <Group key = {group.group} data = {group}/>);

  var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;
  
  return (<>{isLoading ? loading : content }</>);


}

export default Test;
