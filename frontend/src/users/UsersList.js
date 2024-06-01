import React, { useEffect, useState} from 'react';
//import Select from 'react-select';

import { useNavigate } from 'react-router-dom';

import { getUser, getToken } from '../utils/common';

import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faSave, faCancel, faFilter } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Switch from 'react-switch';


const Item = ({item, filterUserID, filterFirstName, filterLastName}) => {

    console.log(item);

    var visible = true;

    if (!(filterUserID == '')) if (!item.username.toString().toUpperCase().includes(filterUserID.toString().toUpperCase())) visible = false;
    if (!(filterFirstName == '')) if (!item.firstname.toString().toUpperCase().includes(filterFirstName.toString().toUpperCase())) visible = false;
    if (!(filterLastName == '')) if (!item.lastname.toString().toUpperCase().includes(filterLastName.toString().toUpperCase())) visible = false;

    if (!visible) return <></>;
    return (
        <>
        <tr>
            <td>{item.username}</td>
            <td><Update item = {item} FieldName = 'firstname' FieldValue =  {item.firstname}/></td>
            <td><Update item = {item} FieldName = 'lastname' FieldValue =  {item.lastname}/></td>
            <td><Update item = {item} FieldName = 'nickname' FieldValue =  {item.nickname}/></td>
            <td><Update item = {item} FieldName = 'email' FieldValue =  {item.email}/></td>
            <td><Update item = {item} FieldName = 'password' FieldValue =  {item.password}/></td>
            <td><SwitchButton item = {item} FieldName = 'is_disabled' /></td>
            <td><Update item = {item} FieldName = 'dictionary_id' FieldValue =  {item.dictionary_id}/></td>
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
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [initialValue, setInitialValue] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const handleUserIDChange = (event) => {
      setUserID(event.target.value);
    };
  
    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
      };
  
    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
      };
      
    const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    };

      useEffect(() => {
    }, [disabled]);
  
  
    
    const insert = async () => {
      var request =  { 
          username: username,
          firstname: firstname,
          lastname: lastname,
          password: password,

        };
  
//        console.log(request)
        const API = process.env.REACT_APP_BACKEND_URL;
        const options = {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken(), 
            },
        }

        var url = `${API}/auth/users/insert/`;

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
        <td><input type="text"  value={username} onChange={handleUserIDChange} className="mx-1" disabled={disabled}/></td>
        <td><input type="text"  value={firstname} onChange={handleFirstNameChange} className="mx-1" disabled={disabled}/></td>
        <td><input type="text"  value={lastname} onChange={handleLastNameChange} className="mx-1" disabled={disabled}/></td>
        <td></td>
        <td></td>
        <td><input type="text"  value={password} onChange={handlePasswordChange} className="mx-1" disabled={disabled}/></td>
        <td></td>
        <td></td>
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
      if (!auth.hasOwnProperty('users')) return <></>;  
      if (auth.users.includes('a') || auth.users.includes('d')) canDelete = true;
    
      if (!canDelete) return <></>;
    
      const request = {
        username: item.username
      };

      const API = process.env.REACT_APP_BACKEND_URL;
      const options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
      };

      const url = `${API}/auth/users/delete/`;

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

  if (!auth.hasOwnProperty('users')) return <></>;
  
  if (auth.users.includes('a') || auth.users.includes('u')) isUpdatable = true;

  if (!isUpdatable) return <>{FieldValue}</>;


  const updateParameter = async () => {
  
    /* eslint-disable no-restricted-globals */
    if (!confirm('Confirm update?')) return;
    /* eslint-enable no-restricted-globals */
      try {
        const user = getUser();
        const auth = user.auth;
        if (!auth.hasOwnProperty('users')) return;
        if (!(auth.users.includes('a') || auth.users.includes('u'))) return;

        const request = {
          username: item.username,
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

        const url = `${API}/auth/users/update/`;
//        console.log("request", request)
        const response = await axios.post(url, request, options);
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


const UpdatePassword = ({item, FieldValue}) =>  {

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
  
    if (!auth.hasOwnProperty('users')) return <></>;
    
    if (auth.users.includes('a') || auth.users.includes('u')) isUpdatable = true;
  
    if (!isUpdatable) return <>{FieldValue}</>;
  
  
    const updateParameter = async () => {
    
      /* eslint-disable no-restricted-globals */
      if (!confirm('Confirm update?')) return;
      /* eslint-enable no-restricted-globals */
        try {
          const user = getUser();
          const auth = user.auth;
          if (!auth.hasOwnProperty('users')) return;
          if (!(auth.users.includes('a') || auth.users.includes('u'))) return;
  
          const request = {
            username: item.username,
            new_password: parameterValue,
          };
  
          const API = process.env.REACT_APP_BACKEND_URL;
          const options = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: getToken(),
            },
          };
  
          const url = `${API}/auth/users/update-password/`;
  //        console.log("request", request)
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
  
const SwitchButton = ({ item, FieldName }) => {

  const [isChecked, setIsChecked] = useState(item[FieldName]);
  const [errorMessage, setErrorMessage] = useState('');

  const updateParameter = async () => {
  
    /* eslint-disable no-restricted-globals */
    if (!confirm('Confirm update?')) return;
    /* eslint-enable no-restricted-globals */
      try {
        const user = getUser();
        const auth = user.auth;
        if (!auth.hasOwnProperty('users')) return;
        if (!(auth.users.includes('a') || auth.users.includes('u'))) return;

        const request = {
          username: item.username,
          target_field: FieldName,
          target_value: isChecked ? 0 : 1,
        };

        const API = process.env.REACT_APP_BACKEND_URL;
        const options = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: getToken(),
          },
        };

        const url = `${API}/auth/users/update/`;
        console.log("request", request)
        const response = await axios.post(url, request, options);
//        console.log(response);
//        window.location.reload();
      } catch (error) {
      console.log(error);
      setErrorMessage(error.message);
    }
  }; // end update parameter  
  
/*
  useEffect(() => {
    setIsChecked(value);
  }, [value]);
*/

const handleChange = (checked) => {
    setIsChecked(checked);
    updateParameter();
  };

  return (
    <div>
      <Switch
        onChange={handleChange}
        checked={isChecked}
        onColor="#86d3ff"
        offColor="#dcdcdc"
        checkedIcon={<span className="p-1" style={{ marginLeft: '8px' }}>Yes</span>}
        uncheckedIcon={<span className="p-1" style={{ marginLeft: '2px' }}>No</span>}
        handleDiameter={24}
        height={26}
        width = {80}
      />
    </div>
  );
};



const UsersList = () => {

    const history = useNavigate();

    try {
      const user = getUser();
      const auth = user.auth;
      if (!auth.hasOwnProperty('users')) history('/dashboard');
      if (!(auth.users.includes("a") || auth.users.includes("r"))) history('/dashboard');
    }
    catch (error) {console.log(error); history('/dashboard');}

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
  
    const [filterUserID, setFilterUserID] = useState('');
    const [filterFirstName, setFilterFirstName] = useState('');
    const [filterLastName, setFilterLastName] = useState('');

    const fetchData = async () => {
  
    try {

        const url = process.env.REACT_APP_BACKEND_URL;
        const api = '/auth/users/list/';

        const request = {};
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
                <p className='my-0'>FirstName</p>
            </th>
            <th>
                <p className='my-0'>LastName</p>
            </th>
            <th>
                <p className='my-0'>NickName</p>
            </th>
            <th>
                <p className='my-0'>Email</p>
            </th>

            <th>
                <p className='my-0'>Password</p>
            </th>
            <th>
                <p className='my-0'>isDisabled</p>
            </th>
            <th>
                <p className='my-0'>Dictionary</p>
            </th>
         
            <th>Actions</th>
            </tr>
            <tr className="table-light" >
            <th><InputComponent initialValue={''} setExternalValue={setFilterUserID}/></th>
            <th><InputComponent initialValue={''} setExternalValue={setFilterFirstName}/></th>
            <th><InputComponent initialValue={''} setExternalValue={setFilterLastName}/></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>

            </tr>
            <Insert />
            </thead>
            <tbody>{
                data.map((item)=>
                <Item 
                    item = {item} 
                    filterUserID={filterUserID} 
                    filterFirstName={filterFirstName}
                    filterLastName={filterLastName}
                    />
                )}
                </tbody>
        </table>

    </>;


    var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;
  
    return (<>{isLoading ? loading : content }</>);

};

export default UsersList;
