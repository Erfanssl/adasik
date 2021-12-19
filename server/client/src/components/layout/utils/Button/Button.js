import React from 'react';
import { Link } from 'react-router-dom';
import './Button.scss';

const Button = ({ text, form= false, link= '/sign-up', ...props }) => {
    function formBtn() {
        return (
            <div>
                { text ? text : 'Get Started' }
            </div>
        );
    }

    function normalBtn() {
        return (
            <Link to={ link }>
                { text ? text : 'Get Started' }
            </Link>
        );
    }

    return (
        <div { ...props } className="button--container__main">
            { form ? formBtn() : normalBtn() }
        </div>
    );
};

export default Button;
