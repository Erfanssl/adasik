import React, { useState, useRef, useEffect } from 'react';
import './CountryPicker.scss';
import countries from './countries';

import textCutter from "../../../../../../utility/textCutter";
import down from '../../../../../../assets/icons/back.svg';

const CountryPicker = ({
                           country,
                           setCountry,
                           setLocationCoords
}) => {
    const [show, setShow] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    // refs
    const listContainerEl = useRef();
    const countryPickerEl = useRef();

    useEffect(() => {
        if (show) {
            if (listContainerEl?.current) listContainerEl.current.classList.add('active');
            if (countryPickerEl?.current) countryPickerEl.current.classList.add('active');
        } else {
            if (listContainerEl?.current) listContainerEl.current.classList.remove('active');
            if (countryPickerEl?.current) countryPickerEl.current.classList.remove('active');
        }
    }, [show]);

    useEffect(() => {
        if (country) {
            if (countryPickerEl?.current) countryPickerEl.current.classList.add('complete');
        }
    }, [country]);

    function handleCountryPickerClick() {
        setShow(show => !show);
        navigator.geolocation.getCurrentPosition(success => {
            setLocationCoords([success.coords.latitude, success.coords.longitude]);
        }, (err => {}));
    }

    function handleListContainerClick(e) {
        e.stopPropagation();
    }

    function handleSearchInputChange(e) {
        setSearchInput(e.target.value);
    }

    function handleCountryClick(name) {
        setCountry(name);
        setSearchInput('');
        setShow(false);
    }

    function renderCountries() {
        let countriesList = countries;
        if (searchInput) countriesList = countries.filter(c => c.name.toLowerCase().includes(searchInput.toLowerCase()));

        return countriesList.map(({ name }) => {
            return <li key={ name } onClick={ handleCountryClick.bind(null, name) }>{ name }</li>
        })
    }

    return (
        <div ref={ countryPickerEl } onClick={ handleCountryPickerClick } className="country-picker">
            {
                country ?
                    <p className="country-name">{ textCutter(country, 12) }</p> :
                    <p className="placeholder">Country</p>
            }
            <img src={ down } alt="arrow" />
            <p className="label">Country</p>
            <div onClick={ handleListContainerClick } ref={ listContainerEl } className="list-container">
                <input id="country-input" placeholder="Search" value={ searchInput } onChange={ handleSearchInputChange }  type="text"/>
                <label htmlFor="input" />
                <ul className="country-list">
                    { renderCountries() }
                </ul>
            </div>
        </div>
    );
};

export default CountryPicker;
