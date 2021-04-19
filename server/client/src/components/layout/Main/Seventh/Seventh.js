import React from 'react';
import './Seventh.scss';
import Button from "../../utils/Button/Button";
import collaboration from '../../../../assets/collaboration.svg';

const Seventh = () => {
    return (
        <div className="seventh--container">
            <div className="seventh--left-container">
                <h2>Signup Now!</h2>
                <p>And start using all of these tools to know yourself better completely free</p>
                <Button />
            </div>
            <div className="seventh--right-container">
                <img src={ collaboration } alt="collaboration"/>
            </div>
        </div>
    );
};

export default Seventh;