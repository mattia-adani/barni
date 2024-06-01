import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Outlet, Link } from 'react-router-dom';

import  {Insert, Update, Delete} from './DictElems'
import { getToken } from '../utils/common';

const DictionariesList = () => {

    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {

        try {

            var request = {'request': null};

            const backend = process.env.REACT_APP_API_URL;   
            const api = "/dictionaries/";   

            const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken(),
            },
            body: JSON.stringify(request),
            };
    

        const response = await fetch(backend+api, options);
        console.log(response);
        const data = await response.json();
        
        setContent(<>


            <table className="table table-bordered table-striped text-start table-fixed table-sm table-responsive-sm">
            <thead>
                <tr className="table-light" >
                <th>dictionary_id</th>
                <th>dictionary_name</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
                {data["data"].map((record) => { 

                    return (
                        <>
                        <tr>
                    <td><Link to={'/dictionaries/dictionary/'+record.dictionary_id}>{record.dictionary_id}</Link></td>
                    <td><Update id = {record.dictionary_id} FieldName = 'dictionary_name' FieldType = 'text' FieldValue = {record.dictionary_name} api = {'/dictionaries/update/'}/></td>
                    <td><Delete id = {record.dictionary_id} api = {'/dictionaries/delete/'}/></td>                
                    </tr>                        
                        </>
                    );
                }

                )}
                <Insert  api = {'/dictionaries/insert/'}/>

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
    () => {fetchData()}
    , []
);

    var loading = <><Spinner className = 'm-5' animation="border" variant="primary" /></>;

return (<><Outlet/>{isLoading ? loading : content }</>);
};

export default DictionariesList;
