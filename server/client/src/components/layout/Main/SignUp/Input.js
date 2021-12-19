import React, { useState } from 'react';

const Input = ({ inputRef, ...props }) => {
    const [input, setInput] = useState('');

    function handleChangeInput(e) {
        setInput(e.target.value);
    }

    return (
        <input
            { ...props }
            ref={ inputRef }
            value={ input }
            onChange={ handleChangeInput }
        />
    );
};

export default Input;
