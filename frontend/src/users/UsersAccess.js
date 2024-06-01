import React, { useEffect, useState} from 'react';
import Select from 'react-select';

import { useNavigate } from 'react-router-dom';
//import { Link } from 'react-router-dom';
//import { useParams } from 'react-router-dom';

import { getUser, getToken } from '../utils/common';

import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faSave, faCancel, faFilter } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';


const Item = ({item, filterUserID, filterPermitCode}) => {
    console.log(item)
    var visible = true;

    if (!(filterUserID == '')) if (!item.username.toUpperCase().includes(filterUserID.toUpperCase())) visible = false;
    if (!(filterPermitCode == '')) if (!item.auth_code.toUpperCase().includes(filterPermitCode.toUpperCase())) visible = false;

    if (!visible) return <></>;
    return (
        <>
        <tr>
            <td>{item.firstname} {item.lastname} [{item.username}]</td>
            <td><Update item = {item} FieldName = 'auth_code' FieldValue =  {item.auth_code}/></td>
            <td><Update item = {item} FieldName = 'auth_grant' FieldValue =  {item.auth_grant}/></td>
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

    const [username, setUserID] = useState('');
    const [auth_code, setPermitCode] = useState('');
    const [auth_grant, setPermitValue] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [initialValue, setInitialValue] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const handleUserIDChange = (event) => {
      setUserID(event.target.value);
    };
  
    const handlePermitCodeChange = (event) => {
        setPermitCode(event.target.value);
      };
  
    const handlePermitValueChange = (event) => {
        setPermitValue(event.target.value);
      };
      
    useEffect(() => {
    }, [disabled]);
  
  
    
    const insert = async () => {
      var request =  { 
          username: username,
          auth_code: auth_code,
          auth_grant: auth_grant,
        };
  
        console.log(request)
        const API = process.env.REACT_APP_BACKEND_URL;
        const options = {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken(), 
            },
        }

        var url = `${API}/auth/access_control/insert/`;

        axios.post(url, request, options).then(
            response => {
//                console.log(response);
                window.location.reload(); 
            }).catch(error => {
                console.log(error);
                setErrorMessage(error.message);
            });
  };
  
  const contentFocused = (
    <><tr>
        <td><SelectUser setValue={setUserID}/></td>
        <td><input type="text"  value={auth_code} onChange={handlePermitCodeChange} className="mx-1" disabled={disabled}/></td>
        <td><input type="text"  value={auth_grant} onChange={handlePermitValueChange} className="mx-1" disabled={disabled}/></td>
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
  <td></td>
</tr></>);


return (isFocused ? contentFocused : contentNotFocused);
  
};

const SelectUser = ({setValue}) => {
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);

    const fetchList = async () => {
 
        const backendurl = process.env.REACT_APP_BACKEND_URL;
        const api = '/auth/users/';

        const request = {};
        const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getToken(), 
            },
          }

        const url = `${backendurl}${api}`;

        axios.post(url, request, options).then(
            response => {
                //console.log(response);
                console.log("options", response.data.data);
                setOptions(response.data.data); 

            }).catch(error => {
                console.log(error);
                setError(error.message);
            });
    };
  
    useEffect(() => { fetchList() }, []);
    
    const handleInputChange = (inputValue) => {
      setInputValue(inputValue);
    };
  
    const handleSelectOption = (selectedOption) => {
      setSelectedOption(selectedOption);
      setValue(selectedOption.value);
    };

    const opts = options.map((item) => ({ value: item.username, label: `${item.firstname} ${item.lastname}` }));
    if (error) return <><p style = {{color: 'red'}}>{error}</p></>; 

    return (<>   
            <Select
              options={opts}
              value={selectedOption}
              onChange={handleSelectOption}
              onInputChange={handleInputChange}
              inputValue={inputValue}
              placeholder="Type to filter ..."
              isClearable
              isSearchable
            /></>
    );
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
      if (!auth.hasOwnProperty('access_control')) return;
      if (!(auth.access_control.includes('d') || auth.access_control.includes('a'))) return;

      const request = {
        username: item.username,
        auth_code: item.auth_code,
        auth_grant: item.auth_grant,
      };

      const API = process.env.REACT_APP_BACKEND_URL;
      const options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
      };

      const url = `${API}/auth/access_control/delete/`;

      const response = await axios.post(url, request, options);
      // Optionally, handle success response here
 //     console.log(response);
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

  if (!auth.hasOwnProperty('access_control')) return <></>;
  
  if (auth.access_control.includes('a') || access.access_control.includes('r')) isUpdatable = true;

  if (!isUpdatable) return <>{FieldValue}</>;


  const updateParameter = async () => {
  
    /* eslint-disable no-restricted-globals */
    if (!confirm('Confirm update?')) return;
    /* eslint-enable no-restricted-globals */
      try {
        const user = getUser();
        const auth = user.auth;
        if (!auth.hasOwnProperty('access_control')) return;
        if (!(auth.access_control.includes('a') || access.access_control.includes('u'))) return;

        const request = {
          username: item.username,
          auth_code: item.auth_code,
          auth_grant: item.auth_grant,
          target_field: FieldName,
          target_value: parameterValue,
        };

        const API = process.env.REACT_APP_BACKEND_URL;
        const options = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: getToken(),
          },
        };

        const url = `${API}/auth/access_control/update/`;
        console.log("request", request)
        const response = await axios.post(url, request, options);
//        console.log(response);
        window.location.reload();
      } catch (error) {
      console.log(error);
      setErrorMessage(error.message);
    }
  }; // end update parameter  

  var o;
  if (!isFocused) o = <span  style = {{color: 'blue'}} onClick = {() => {setIsFocused(true)}}>{FieldValue}</span>;
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

const UsersAccess = () => {

//    const history = useNavigate();

    try {
      const user = getUser();
      const auth = user.auth;
      console.log(auth);
//      if (!auth.hasOwnProperty('access_control')) history('/dashboard');
//      if (!(auth.access_control.includes("a") || auth.access_control.includes("r"))) history('/dashboard');
    }
    catch (error) {
      console.log(error); 
      //history('/dashboard');
    }

    const [isLoading, setLoading] = useState(true);
//    const [content, setContent] = useState(null);
    const [data, setData] = useState([]);
  
    const [filterUserID, setFilterUserID] = useState('');
    const [filterPermitCode, setFilterPermitCode] = useState('');

    const fetchData = async () => {
  
    try {

        const API = process.env.REACT_APP_BACKEND_URL;
        const request = {};
        const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getToken(), 
            },
          }

          axios.post(`${API}/auth/access_control/`, request, options).then(
            response => {
                setLoading(false);
  //              console.log(response);
  //              console.log("DATA", response.data.data);
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
                <p className='my-0'>Username</p>
            </th>
            <th>
                <p className='my-0'>Auth Code</p>
            </th>
            <th>
                <p className='my-0'>Auth Grant</p>
            </th>
            <th>Actions</th>
            </tr>
            <tr className="table-light" >
            <th><InputComponent initialValue={''} setExternalValue={setFilterUserID}/></th>
            <th><InputComponent initialValue={''} setExternalValue={setFilterPermitCode}/></th>
            <th></th>
            <th></th>
            </tr>
            <Insert />
            </thead>
            <tbody>{data.map((item)=><Item item = {item} filterUserID={filterUserID} filterPermitCode={filterPermitCode}/>)}</tbody>
        </table>

    </>;


    var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;
  
    return (<>{isLoading ? loading : content }</>);

};

export default UsersAccess;
