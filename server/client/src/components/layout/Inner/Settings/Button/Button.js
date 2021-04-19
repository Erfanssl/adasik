import React from 'react';
import './Button.scss';

const Button = ({ value, onClick }) => {
    if (onClick) {
        return (
            <input
                className="settings--submit-btn"
                type="submit"
                value={ value }
                onClick={ onClick }
            />
        );
    }

    return (
        <input
            className="settings--submit-btn"
            type="submit"
            value={ value }
        />
    );
};

export default Button;