import React from 'react';
import { Routes, Route} from 'react-router-dom';

import DictionariesList from './DictionariesList.js';
import Dictionary from './Dictionary.js';

const DictionariesGate = () => {

    return (
        <>
            <div>
               <Routes>
                   <Route index element={<DictionariesList />} />
                   <Route path="dictionary/:dictionary_id/*" element={<Dictionary />} />
                </Routes>
            </div>
        </>
    );
};



export default DictionariesGate;