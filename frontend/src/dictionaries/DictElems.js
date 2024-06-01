import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faSave, faCancel } from '@fortawesome/free-solid-svg-icons';
import { getToken } from '../utils/common';

export const Insert = ({api}) =>  {

    const [ID, setID] = useState('');
    const [Name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [initialValue, setInitialValue] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const handleIDChange = (event) => {
      setID(event.target.value);
    };
  
    const handleNameChange = (event) => {
        setName(event.target.value);
      };
  
      
    useEffect(() => {
    }, [disabled]);
  
  
    
    const insert = async (api) => {
      var body =  { 
          name: Name,
      };
  
//      console.log(body);
  
      try {
          setDisabled(true);
  
          const backend = process.env.REACT_APP_API_URL;   
//          const api = "/dictionaries/insert/";
  
          const options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': getToken(),
          },
          body: JSON.stringify(body),
          };
          
      const response = await fetch(backend+api, options);
      
        const data = await response.json();
        if (!response.ok) {
          throw new Error('Failed to insert');
        }
        setDisabled(false);
        window.location.reload();
      } catch (error) {
          console.log(error.message);
        setErrorMessage('Error in insert: ' + error.message);
      }
  
  };
  
  const contentFocused = (<><tr>
                    <td></td>
                    <td><input type="text"  value={Name} onChange={handleNameChange} className="mx-1" disabled={disabled}/></td>
                    <td>
                    <FontAwesomeIcon className = 'mx-1' icon={faSave} onClick={() => insert(api)} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
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
  
export const Delete = ({id, api}) => {

    const handleClick = (api) => {

        const fetchData = async (api) => {

            try {
    
                var request = {'id': id};
    
                const backend = process.env.REACT_APP_API_URL;   
//                const api = "/dictionaries/delete/";   

                const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getToken(),
                },
                body: JSON.stringify(request),
                };
        
    
            const response = await fetch(backend+api, options);
            const data = await response.json();
            window.location.reload();


            } catch (error) {
                console.log('Error fetching data: '+ error)
            } finally {
                //setIsLoading(false);
            }
    
        };
    


        if (confirm("Confirm delete?"))
            console.log("deleting");
            fetchData(api);
        };

    return(<><FontAwesomeIcon icon={faTrash} onClick={() => handleClick(api)} style={{ cursor: 'pointer' }}></FontAwesomeIcon></>);

};

export const Update = ({id, FieldName, FieldType, FieldValue, api}) =>  {

    const [parameterValue, setParameterValue] = useState(FieldValue);
    const [errorMessage, setErrorMessage] = useState('');
    const [initialValue, setInitialValue] = useState(FieldValue);
    const [disabled, setDisabled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (event) => {
      setParameterValue(event.target.value);
    };
  
  
    useEffect(() => {
      setInitialValue(parameterValue);
    }, []);
  
    useEffect(() => {
    }, [disabled]);
  
    var o;
    if (!isFocused) o = <span onClick = {() => {setIsFocused(true)}}>{FieldValue}</span>;
    else {
  
    if (FieldType == 'text') o = <input type="text"  value={parameterValue} onChange={handleChange} className="mx-1" disabled={disabled}/>
    else if (FieldType == 'number') o = <input type="number"  step = "0.001" value={parameterValue} onChange={handleChange} className="mx-1" disabled={disabled}/>
    else if (FieldType === 'date') o =  <DatePicker
        selected={new Date(parameterValue)}
        onChange={(date) => {setParameterValue(date.toLocaleString('sv').split(' ')[0])}}
      dateFormat="dd/MM/yyyy"
      />;
    else if (FieldType == 'bool') o = (<select
          value={parameterValue}
          onChange={handleChange}>
          <option value={null}>--</option>
          <option value="1">SI</option>
          <option value="0">NO</option>
          </select>);
    }  
  
    const updateParameter = async (api) => {
      var body =  { 
          id: id,
          FieldName: FieldName, 
          FieldValue: parameterValue,
      };
  
      try {
          setDisabled(true);
  
          const backend = process.env.REACT_APP_API_URL;   
//          const api = "/dictionaries/update/";   
  
          const options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': getToken(),
          },
          body: JSON.stringify(body),
          };
          
      const response = await fetch(backend+api, options);
      
        const data = await response.json();
      console.log(data);
        if (!response.ok) {
          throw new Error('Failed to update parameter');
        }
        setInitialValue(parameterValue);
        setDisabled(false);
        setIsFocused(false);
        window.location.reload();

      } catch (error) {
          console.log(error.message);
        setErrorMessage('Error updating parameter: ' + error.message);
      }
  
  };
  
    return (<>
        {o}
        {((parameterValue !== initialValue)) && isFocused && (<>
            <FontAwesomeIcon className = 'mx-1' icon={faSave} onClick={() => updateParameter(api)} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
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
