import React, { useState } from 'react';
import './Input.scss';

const Input = ({ content, setContent }) => {
    const [input, setInput] = useState('');

    function handleInputChange(e) {
        setContent(e.target.value);
    }

    return (
        <input
            type="text"
            value={ content }
            onChange={ handleInputChange }
            placeholder="Search among your friends"
        />
    );
};

export default Input;