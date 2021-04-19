import React from 'react';
import './Checkbox.scss';
import circle from "../../../../../assets/icons/circle-check.svg";
import check from "../../../../../assets/icons/check-check.svg";

const Checkbox = ({ text, checkboxId, checkboxClassName }) => {
    return (
        <>
            <input className={ "settings--checkbox__input " + checkboxClassName} type="checkbox" value={ text } id={ checkboxId } />
            <label className="settings--checkbox__label" htmlFor={ checkboxId }>
                <div className="icon--container">
                    <img className="checkbox--circle" src={ circle } alt="circle" />
                    <img className="checkbox--check" src={ check } alt="check" />
                </div>
                <p>
                    { text }
                </p>
            </label>
        </>
    );
};

export default Checkbox;