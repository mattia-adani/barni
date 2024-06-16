import React, { useEffect, useState} from 'react';

import { useNavigate, Link, useParams } from 'react-router-dom';

import { getUser, getToken } from '../utils/common';

import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faSave, faCancel, faFilter } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Item = ({item, filterDevice, filterProp, filterValue}) => {

    var visible = true;

    if (!(filterDevice == '')) if (!item.device.toString().toUpperCase().includes(filterDevice.toString().toUpperCase())) visible = false;
    if (!(filterProp == '')) if (!(item.property ? item.property.toString().toUpperCase() : '').includes(filterProp.toString().toUpperCase())) visible = false;
    if (!(filterValue == '')) if (!(item.value ? item.value.toString().toUpperCase() : '').includes(filterValue.toString().toUpperCase())) visible = false;

    if (!visible) return <></>;
    return (
        <>
        <tr>
            <td>{item.device}</td>
            <td><Update item = {item} FieldName = 'property' FieldValue =  {item.property}/></td>
            <td><Update item = {item} FieldName = 'value' FieldValue =  {item.value}/></td>
            <td><Delete item = {item} /></td>
        </tr>
        </>
    );
};

const InputComponent = ({initialValue, setExternalValue}) => {
    // State to hold the value of the input
    const [inputValue, setInputValue] = useState(initialValue);
  
    // Function to handle input change
    const handleChange = (event) => {
      setInputValue(event.target.value);
      setExternalValue(event.target.value);
    };
  
    return (
      <div>
        {/* Input component */}
        <FontAwesomeIcon className = 'mx-1' icon={faFilter}></FontAwesomeIcon>
        <input
          type="text"
          value={inputValue} // Bind input value to state
          onChange={handleChange} // Call handleChange function on change
        />
        {/* Display the value of the input <p>Input value: {inputValue}</p>*/}        
      </div>
    );
};

const Insert = () =>  {

    let {device} = useParams();
    
    const [property, setProp] = useState('');
    const [value, setValue] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [initialValue, setInitialValue] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    
    const handlePropChange = (event) => {
        setProp(event.target.value);
      };
  
    const handleValueChange = (event) => {
        setValue(event.target.value);
      };
      
      useEffect(() => {
    }, [disabled]);
  
  
    const insert = async () => {

      const backend = process.env.REACT_APP_BACKEND_URL;
      const api = '/devices/property/insert/';

      const options = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken(), 
          },
        }

      var request =  { 
          device: device,
          property: property,
          value: value,
        };
  
//        console.log(request)

        axios.post(`${backend}${api}`, request, options).then(
            response => {
  //              console.log(response);
                window.location.reload(); 
            }).catch(error => {
                console.log(error);
                setErrorMessage(error.message);
            });
  };
  
  const contentFocused = (
    <><tr>
        <td>{device}</td>
        <td><input type="text"  value={property} onChange={handlePropChange} className="mx-1" disabled={disabled}/></td>
        <td><input type="text"  value={value} onChange={handleValueChange} className="mx-1" disabled={disabled}/></td>
        <td>
            <FontAwesomeIcon className = 'mx-1' icon={faSave} onClick={insert} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
            <FontAwesomeIcon className = 'mx-1' icon={faCancel} onClick={() => setIsFocused(false)} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
        </td>
</tr></>);

const contentNotFocused = (<><tr>
  <td><>
      <FontAwesomeIcon icon={faPlus} onClick={() => setIsFocused(true)} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
  </></td>
  <td></td>
  <td></td>
</tr></>);

return (isFocused ? contentFocused : contentNotFocused);
  
};

const Delete = ({ item }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleClick = async () => {
  /* eslint-disable no-restricted-globals */
  if (!confirm('Confirm delete?')) return;
  /* eslint-enable no-restricted-globals */
    try {
        const user = getUser();
        const auth = user.auth;
          var canDelete = false;
      if (!auth.hasOwnProperty('devices')) return <></>;  
      if (auth.users.includes('a') || auth.users.includes('d')) canDelete = true;
    
      if (!canDelete) return <></>;
    
      const backend = process.env.REACT_APP_BACKEND_URL;
      const api = '/devices/property/delete/';

      const options = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken(), 
          },
        }

      var request =  { 
          device: item.device,
          property: item.property
        };
  
        console.log(request)
        const response = await axios.post(`${backend}${api}`, request, options)

//      console.log(response);
      window.location.reload();
    } catch (error) {
      console.log(error);
      setErrorMessage(error.message);
    }
  };

  return (
    <>
      <FontAwesomeIcon
        icon={faTrash}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
      {errorMessage && <div>{errorMessage}</div>}
    </>
  );
};

const Update = ({item, FieldName, FieldValue}) =>  {

  const user = getUser();
  const auth = user.auth;
  var isUpdatable = false;

  const [parameterValue, setParameterValue] = useState(FieldValue);
  const [errorMessage, setErrorMessage] = useState('');
  const [initialValue, setInitialValue] = useState(FieldValue);
  const [disabled, setDisabled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event) => {
    setParameterValue(event.target.value);
  };

  useEffect(() => {setInitialValue(parameterValue);}, []);

  useEffect(() => {}, [disabled]);

  if (!auth.hasOwnProperty('devices')) return <></>;
  
  if (auth.users.includes('a') || auth.users.includes('u')) isUpdatable = true;

  if (!isUpdatable) return <>{FieldValue}</>;

  const updateParameter = async () => {
  
    /* eslint-disable no-restricted-globals */
    if (!confirm('Confirm update?')) return;
    /* eslint-enable no-restricted-globals */
      try {
        const user = getUser();
        const auth = user.auth;
        if (!auth.hasOwnProperty('devices')) return;
        if (!(auth.users.includes('a') || auth.users.includes('u'))) return;

        const backend = process.env.REACT_APP_BACKEND_URL;
        const api = '/devices/property/update/';
  
        const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getToken(), 
            },
          }
  
          const request = {
            device: item.device,
            property: item.property,
            value: item.value,

            target_field: FieldName,
            target_value: parameterValue,
          };
      
//          console.log(request)
          const response = await axios.post(`${backend}${api}`, request, options)
//        console.log(response);
        window.location.reload();
      } catch (error) {
      console.log(error);
      setErrorMessage(error.message);
    }
  }; // end update parameter  

  var o;
  if (!isFocused) o = <span  style = {{color: 'blue'}} onClick = {() => {setIsFocused(true)}}>{(FieldValue == null || FieldValue == '') ? '---' : FieldValue }</span>;
  else {

    o = <input type="text"  value={parameterValue} onChange={handleChange} className="mx-1" disabled={disabled}/>

  }
  return (<>
      {o}
      {((parameterValue !== initialValue)) && isFocused && (<>
          <FontAwesomeIcon className = 'mx-1' icon={faSave} onClick={updateParameter} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
          </>
      )}
      { isFocused && (<>
          <FontAwesomeIcon className = 'mx-1' icon={faCancel} onClick={() => {setIsFocused(false)}} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
          </>
      )}          
      {errorMessage && <p>{errorMessage}</p>}
    </>
  );

};

export default function Device ()  {

    let {device} = useParams();

    console.log("DEVICE", device)

    const navigate = useNavigate();

    try {
      const user = getUser();
      const auth = user.auth;
      if (!auth.hasOwnProperty('devices')) navigate('/dashboard');
      if (!(auth.users.includes("a") || auth.users.includes("r"))) navigate('/dashboard');
    }
    catch (error) 
    {
      console.log(error); //navigate('/dashboard');
    }

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
  
    const [filterDevice, setFilterDevice] = useState('');
    const [filterProp, setFilterProp] = useState('');
    const [filterValue, setFilterValue] = useState('');

    const fetchData = async () => {
  
    try {

        const backend = process.env.REACT_APP_BACKEND_URL;
        const api = '/devices/detail/';

        const request = { device: device };
        const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getToken(), 
            },
          }

          axios.post(`${backend}${api}`, request, options).then(
            response => {
                setLoading(false);
                console.log(response);
//                console.log("DATA", response.data.data);
                setData(response.data.data);
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

    var content = 
    <>
        <table className="table table-bordered table-striped text-start table-fixed table-sm table-responsive-sm">
            <thead>
            <tr className="table-light" >
            <th>
                <p className='my-0'>Device</p>
            </th>
            <th>
                <p className='my-0'>Property</p>
            </th>
            <th>
                <p className='my-0'>Value</p>
            </th>
            <th>
            </th>
            </tr>
            <tr className="table-light" >
            <th><InputComponent initialValue={''} setExternalValue={setFilterDevice}/></th>
            <th><InputComponent initialValue={''} setExternalValue={setFilterProp}/></th>
            <th><InputComponent initialValue={''} setExternalValue={setFilterValue}/></th>
            <th></th>
            </tr>
            <Insert />
            </thead>
            <tbody>{
                data.map((item)=>
                <Item 
                    item = {item} 
                    filterDevice={filterDevice} 
                    filterProp={filterProp}
                    filterValue={filterValue}
                    />
                )}
                </tbody>
        </table>

    </>;

    var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;
  
    return (<>{isLoading ? loading : content }</>);

};

