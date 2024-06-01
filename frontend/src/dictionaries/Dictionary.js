import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Outlet, Link } from 'react-router-dom';

import { useParams } from 'react-router-dom';
import { getToken } from '../utils/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faSave, faCancel } from '@fortawesome/free-solid-svg-icons';

const Insert = ({dictionary_id}) =>  {

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
      
    const insert = async (dictionary_id) => {
      var body =  { 
          dictionary_id: dictionary_id,
          tag_name: Name,
          tag: ID
      };
    
      try {

          setDisabled(true);
  
          const backend = process.env.REACT_APP_API_URL;   
          const api = "/dictionaries/dictionary/tag/insert/";
  
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
                    <td><input type="text"  value={ID} onChange={handleIDChange} className="mx-1" disabled={disabled}/></td>
                    <td><input type="text"  value={Name} onChange={handleNameChange} className="mx-1" disabled={disabled}/></td>
                    <td>
                    <FontAwesomeIcon className = 'mx-1' icon={faSave} onClick={() => insert(dictionary_id)} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
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

const Update = ({id, dictionary_id, FieldName, FieldType, FieldValue}) =>  {

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
  
    const updateParameter = async () => {
      var body =  { 
          id: dictionary_id,
          tag: id,
          FieldName: FieldName, 
          FieldValue: parameterValue,
      };
  
      try {
          setDisabled(true);
  
          const backend = process.env.REACT_APP_API_URL;   
          const api = "/dictionaries/dictionary/tag/update/";   
  
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
    //      console.log(data);
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
            <FontAwesomeIcon className = 'mx-1' icon={faSave} onClick={() => updateParameter()} style={{ cursor: 'pointer' }}></FontAwesomeIcon>
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

const Delete = ({dictionary_id, tag}) => {

    const handleClick = () => {

        const fetchData = async () => {

            try {
    
                var request = {'id': dictionary_id, 'tag': tag};
    
                const backend = process.env.REACT_APP_API_URL;   
                const api = "/dictionaries/dictionary/tag/delete/";   

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
            fetchData();
        };

    return(<><FontAwesomeIcon icon={faTrash} onClick={() => handleClick()} style={{ cursor: 'pointer' }}></FontAwesomeIcon></>);

};


const Dictionary = () =>  {

    let { dictionary_id  } = useParams();

    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (id) => {
        //console.log("fetching", id)
        try {

            var request = {'id': id};

            const backend = process.env.REACT_APP_API_URL;   
            const api = "/dictionaries/dictionary/";   

            const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken(),
            },
            body: JSON.stringify(request),
            };
    

        const response = await fetch(backend+api, options);
        //console.log(response);
        const data = await response.json();
        
        setContent(<>


            <table className="table table-bordered table-striped text-start table-fixed table-sm table-responsive-sm">
            <thead>
                <tr className="table-light" >
                <th>tag</th>
                <th>tag_name</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
                {data["data"].map((record) => { 
   
                    return (
                        <>
                    <tr>
                    <td><Update id = {record.tag} FieldName = 'tag' FieldType = 'text' FieldValue = {record.tag} dictionary_id = {dictionary_id} api = {'/dictionaries/dictionary/tag/update/'}/></td>
                    <td><Update id = {record.tag} FieldName = 'tag_name' FieldType = 'text' FieldValue = {record.tag_name} dictionary_id = {dictionary_id} api = {'/dictionaries/dictionary/tag/update/'}/></td>
                    <td><Delete dictionary_id= {dictionary_id} tag = {record.tag} /></td>                
                    </tr>                        
                        </>
                    );
                }

                )}
                <Insert  dictionary_id = {dictionary_id} api = {'/dictionaries/dictionary/tag/insert/'}/>

              </tbody>

            </table>
        </>);

    } catch (error) {
        setContent('Error fetching data: '+ error)
      } finally {
        setIsLoading(false);
      }

    };
  

useEffect(
    () => {fetchData(dictionary_id)}
    , []
);

    var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;

return (<><Outlet/>{isLoading ? loading : content }</>);
};

export default Dictionary;