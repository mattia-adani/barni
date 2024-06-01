import { React, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

const FilterInput = ({initialValue, setExternalValue}) => {
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
          style = {{width: '60%'}}
          type="text"
          value={inputValue} // Bind input value to state
          onChange={handleChange} // Call handleChange function on change
        />
        {/* Display the value of the input <p>Input value: {inputValue}</p>*/}        
      </div>
    );
};

export default FilterInput;