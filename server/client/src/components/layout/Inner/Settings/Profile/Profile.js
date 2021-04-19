import React, { useState, useRef, useEffect } from 'react';
import intlTelInput from 'intl-tel-input';
import './Profile.scss';
import { connect } from 'react-redux';
import 'intl-tel-input/build/css/intlTelInput.css';
import ImagePicker from "./ImagePicker/ImagePicker";
import {
    fetchSettingsProfileData,
    sendSettingsProfileData,
    wipeSettingsProfileData
} from "../../../../../actions/settingsAction";
import Loading from "../../../utils/Loading/Loading";
import Spinner from "../../../utils/Spinner/Spinner";
import Button from "../Button/Button";
import requireAuth from "../../../../../middlewares/requireAuth";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";

import twitter from '../../../../../assets/icons/twitter.svg';
import instagram from '../../../../../assets/icons/instagram.svg';
import facebook from '../../../../../assets/icons/facebook.svg';
import youtube from '../../../../../assets/icons/youtube.svg';


const Profile = ({
                     profileData,
                     fetchSettingsProfileData,
                     sendSettingsProfileData,
                     wipeSettingsProfileData
}) => {
    const [philosophy, setPhilosophy] = useState('');
    const [bio, setBio] = useState('');
    const [locationCoords, setLocationCoords] = useState([]);
    const [showPopUp, setShouPopUp] = useState(false);
    const [formError, setFormError] = useState({ show: true, text: '' });
    const [formSuccess, setFormSuccess] = useState({ show: true, text: '' });
    const [avatar, setAvatar] = useState('');
    const [showSendingSpinner, setShowSendingSpinner] = useState(false);
    const [phoneCountry, setPhoneCountry] = useState('');
    const [telFn, setTelFn] = useState(null);

    // refs
    const phoneInput = useRef();
    const fullNameInput = useRef();
    const birthdayDayInput = useRef();
    const birthdayMonthInput = useRef();
    const birthdayYearInput = useRef();
    const jobInput = useRef();
    const locationCountryInput = useRef();
    const locationCityInput = useRef();
    const socialTwitterInput = useRef();
    const socialInstagramInput = useRef();
    const socialFacebookInput = useRef();
    const socialYoutubeInput = useRef();

    useEffect(() => {
        document.title = 'Adasik - Settings/Profile';
        fetchSettingsProfileData();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            wipeSettingsProfileData();
            pageViewSocket.disconnect()
        };
    }, []);

    useEffect(() => {
        if (profileData) {
            if (profileData.dataSent) {
                setShowSendingSpinner(false);
                if (profileData.name) setFormSuccess({ show: true, text: 'Your data was successfully updated' });
                if (!profileData.name) setFormSuccess({ show: true, text: 'Your data was successfully submitted' });
                fetchSettingsProfileData();
            }

            if (!profileData.dataSent) setFormSuccess({ show: false, text: '' });
            if (!profileData.Error || profileData.PhoneError) setFormError({ show: false, text: '' });

            if (profileData.Error) {
                setShowSendingSpinner(false);
                if (profileData.name) setFormError({ show: true, text: 'Did not submit your data. try again' });
                if (!profileData.name) setFormError({ show: true, text: 'Did not update your data. try again' });
            }

            if (profileData.PhoneError) {
                setShowSendingSpinner(false);
                setFormError({ show: true, text: 'Phone number is already exists' });
            }

            if (profileData.name) fullNameInput.current.value = profileData.name;
            if (profileData.gender) document.querySelector(`input[value=${ profileData.gender }]`).checked = true;
            if (profileData.birthday) {
                if (profileData.birthday.day) birthdayDayInput.current.value = profileData.birthday.day;
                if (profileData.birthday.month) birthdayMonthInput.current.value = profileData.birthday.month;
                if (profileData.birthday.year) birthdayYearInput.current.value = profileData.birthday.year;
            }

            if (profileData.job) jobInput.current.value = profileData.job;
            if (profileData.location && profileData.location.country) locationCountryInput.current.value = profileData.location.country;
            if (profileData.location && profileData.location.city) locationCityInput.current.value = profileData.location.city;
            if (profileData.philosophy) setPhilosophy(profileData.philosophy);
            if (profileData.bio) setBio(profileData.bio);
            if (profileData.education) document.querySelector(`input[value*='${ profileData.education }']`).checked = true;
            if (profileData.howHeardUs) document.querySelector(`input[value*='${ profileData.howHeardUs }']`).checked = true;

            if (profileData.social) {
                profileData.social.forEach(socialObj => {
                    if (socialObj.name === 'Twitter') socialTwitterInput.current.value = socialObj.link;
                    else if (socialObj.name === 'Instagram') socialInstagramInput.current.value = socialObj.link;
                    else if (socialObj.name === 'Facebook') socialFacebookInput.current.value = socialObj.link;
                    else if (socialObj.name === 'Youtube') socialYoutubeInput.current.value = socialObj.link;
                });
            }

            if  (profileData.avatar) setAvatar(profileData.avatar);
        }
    }, [profileData]);

    useEffect(() => {
        if (phoneInput?.current) {
            const iti = intlTelInput(phoneInput.current, {
                separateDialCode: true
            });

            if (profileData && profileData.phoneNumber) iti.setNumber(profileData.phoneNumber);
            if (profileData && profileData.prePhoneNumber) iti.setCountry(profileData.prePhoneNumber.split('-')[1]);

            const wrapper = document.querySelector('.iti--allow-dropdown');
            const label = document.createElement('label');
            const label2 = document.createElement('label');
            label.classList.add('input--bg');
            label2.classList.add('input--text');
            label2.innerText = 'Phone Number';
            wrapper.appendChild(label);
            wrapper.appendChild(label2);
        }
    }, [phoneInput, profileData, phoneCountry]);

    function handleLocationClick() {
        navigator.geolocation.getCurrentPosition(success => {
            setLocationCoords([success.coords.latitude, success.coords.longitude]);
        }, (err => {}));
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        // construct the data
        const data = {
            type: profileData?.name ? 'edit' : 'submit',
            avatar,
            fullName: fullNameInput.current.value,
            gender: e.target.elements.gender.value,
            birthday: {
                day: birthdayDayInput.current.value,
                month: birthdayMonthInput.current.value,
                year: birthdayYearInput.current.value
            },
            phoneNumber: phoneInput.current.value,
            prePhoneNumber: document.querySelectorAll('.iti__selected-dial-code')[1]?.textContent + '-' + document.querySelectorAll('.iti__selected-flag')[1].attributes['aria-activedescendant'].value.split('-')[2],
            job: jobInput.current.value,
            location: {
                country: locationCountryInput.current.value,
                city: locationCityInput.current.value,
                coords: locationCoords || []
            },
            philosophy,
            bio,
            education: e.target.elements.education.value,
            howHeardUs: e.target.elements.discover.value,
            social: {
                twitter: socialTwitterInput.current.value,
                instagram: socialInstagramInput.current.value,
                facebook: socialFacebookInput.current.value,
                youtube: socialFacebookInput.current.value
            }
        };

        sendSettingsProfileData(data);
        setShowSendingSpinner(true);
    }

    return (
        <div className="settings--profile-container" style={ (showPopUp || !profileData) ? { height: '86vh', overflowY: 'hidden' } : {} }>
            { !profileData && <Loading text="Fetching data..." /> }
            <div className="settings--profile__header-container">
                <p>In order to provide you better statistics reports, we want you to tell us a little about yourself.</p>
                <p>Too see how we handle your data, see our Privacy Policy.</p>
                {
                    profileData && !profileData.name &&
                    <p className="must--fill">* Fill the red ones to continue using Adasik *</p>
                }
                {/*<p>To change your Privacy settings, go to Privacy tab and manage how people can se you information.</p>*/}
            </div>
            <div className="settings--profile__body-container">
                <form onSubmit={ handleFormSubmit }>
                    <ImagePicker
                        setShowPopUp={ setShouPopUp }
                        avatar={ avatar }
                        setAvatar={ setAvatar }
                    />
                    <div className="settings--profile__inputs-container">
                        <div className="inputs--top">
                            <div className="input--group-container__horizontal">
                                <input ref={ fullNameInput } type="text" id="settings--profile__full-name" placeholder="Full Name" required />
                                <label className="settings--profile__border-bottom" />
                                <label htmlFor="settings--profile__full-name" className="settings--profile__label">Full Name</label>
                            </div>
                            <div className="gender--container">
                                <div className="radio--group-container">
                                    <input type="radio" value="male" name="gender" id="settings--profile__male" />
                                    <label htmlFor="settings--profile__male">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Male</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="female" name="gender" id="settings--profile__female" />
                                    <label htmlFor="settings--profile__female">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Female</span>
                                    </label>
                                </div>
                            </div>
                            <div className="input--multi ad-mr-7">
                                <h3>Birthday</h3>
                                <div className="input--group-container__vertical">
                                    <input required ref={ birthdayDayInput } type="number" min={ 0 } max={ 31 } id="settings--profile__day" placeholder="Day" />
                                    <label className="settings--profile__border-bottom" />
                                    <label htmlFor="settings--profile__day" className="settings--profile__label">Day</label>
                                </div>
                                <div className="input--group-container__vertical">
                                    <input required ref={ birthdayMonthInput } type="number" min={ 0 } max={ 12 } id="settings--profile__month" placeholder="Month" />
                                    <label className="settings--profile__border-bottom" />
                                    <label htmlFor="settings--profile__month" className="settings--profile__label">Month</label>
                                </div>
                                <div className="input--group-container__vertical">
                                    <input required ref={ birthdayYearInput } type="number" min={ 10 } max={ 2021 } id="settings--profile__year" placeholder="Year" />
                                    <label className="settings--profile__border-bottom" />
                                    <label htmlFor="settings--profile__year" className="settings--profile__label">Year</label>
                                </div>
                            </div>
                            <div className="input--phone-number">
                                <input ref={ phoneInput } placeholder="Phone Number" type="text" />
                            </div>
                            <div className="input--group-container__horizontal">
                                <input ref={ jobInput } type="text" id="settings--profile__Job" placeholder="Job" />
                                <label className="settings--profile__border-bottom" />
                                <label htmlFor="settings--profile__Job" className="settings--profile__label">Job</label>
                            </div>
                            <div className="input--multi location ad-mr-7">
                                <h3>Location</h3>
                                <div className="input--group-container__vertical">
                                    <input onClick={ handleLocationClick } ref={ locationCountryInput } type="text" id="settings--profile__country" placeholder="Country" />
                                    <label className="settings--profile__border-bottom" />
                                    <label htmlFor="settings--profile__country" className="settings--profile__label">Country</label>
                                </div>
                                <div className="input--group-container__vertical">
                                    <input onClick={ handleLocationClick } ref={ locationCityInput } type="text" id="settings--profile__city" placeholder="City" />
                                    <label className="settings--profile__border-bottom" />
                                    <label htmlFor="settings--profile__city" className="settings--profile__label">City</label>
                                </div>
                            </div>
                            <div className="input--group-container__horizontal philosophy">
                                <input
                                    type="text"
                                    maxLength="60"
                                    id="settings--profile__philosophy"
                                    placeholder="Your Philosophy of life in 60 characters!"
                                    value={ philosophy }
                                    onChange={ /* TODO: use a handler function */ e => setPhilosophy(e.target.value) }
                                />
                                <label className="settings--profile__border-bottom" />
                                <label htmlFor="settings--profile__philosophy" className="settings--profile__label">Your Philosophy of life in 60 characters or less!</label>
                                <p className="counter">{ 60 - philosophy.length }</p>
                            </div>
                            <div className="input--group-container__horizontal bio">
                                <input
                                    type="text"
                                    maxLength="70"
                                    id="settings--profile__bio"
                                    placeholder="Your biography in 70 characters!"
                                    value={ bio }
                                    onChange={ /* TODO: use a handler function */ e => setBio(e.target.value) }
                                />
                                <label className="settings--profile__border-bottom" />
                                <label htmlFor="settings--profile__bio" className="settings--profile__label">Your biography in 70 characters or less!</label>
                                <p className="counter">{ 70 - bio.length }</p>
                            </div>
                        </div>
                        <div className="inputs--bottom">
                            <div className="input--bottom-collection">
                                <h3>
                                    <span>Education</span>
                                </h3>
                                <div className="radio--group-container">
                                    <input type="radio" value="Some school" name="education" id="settings--profile__edu-1" />
                                    <label htmlFor="settings--profile__edu-1">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Some school</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="High school" name="education" id="settings--profile__edu-2" />
                                    <label htmlFor="settings--profile__edu-2">
                                        <span className="radio--bg" />
                                        <span className="radio--text">High school</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Some college" name="education" id="settings--profile__edu-3" />
                                    <label htmlFor="settings--profile__edu-3">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Some college</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="College degree (BA/BS)" name="education" id="settings--profile__edu-4" />
                                    <label htmlFor="settings--profile__edu-4">
                                        <span className="radio--bg" />
                                        <span className="radio--text">College degree (BA/BS)</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Professional degree (law, medicine, etc)" name="education" id="settings--profile__edu-5" />
                                    <label htmlFor="settings--profile__edu-5">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Professional degree (law, medicine, etc)</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Masters degree" name="education" id="settings--profile__edu-6" />
                                    <label htmlFor="settings--profile__edu-6">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Masters degree</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="PhD" name="education" id="settings--profile__edu-7" />
                                    <label htmlFor="settings--profile__edu-7">
                                        <span className="radio--bg" />
                                        <span className="radio--text">PhD</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Associate's degree" name="education" id="settings--profile__edu-8" />
                                    <label htmlFor="settings--profile__edu-8">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Associate's degree</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Other" name="education" id="settings--profile__edu-9" />
                                    <label htmlFor="settings--profile__edu-9">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Other</span>
                                    </label>
                                </div>
                            </div>
                            <div className="input--bottom-collection">
                                <h3 className="discover">
                                    <span>How did you discover Adasik?</span>
                                </h3>
                                <div className="radio--group-container">
                                    <input type="radio" value="Search engine (Google, Yahoo, etc.)" name="discover" id="settings--profile__discover-1" />
                                    <label htmlFor="settings--profile__discover-1">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Search engine (Google, Yahoo, etc.)</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Recommended by friend or colleague" name="discover" id="settings--profile__discover-2" />
                                    <label htmlFor="settings--profile__discover-2">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Recommended by friend or colleague</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Social media" name="discover" id="settings--profile__discover-3" />
                                    <label htmlFor="settings--profile__discover-3">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Social media</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Blog or publication" name="discover" id="settings--profile__discover-4" />
                                    <label htmlFor="settings--profile__discover-4">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Blog or publication</span>
                                    </label>
                                </div>
                                <div className="radio--group-container">
                                    <input type="radio" value="Other" name="discover" id="settings--profile__discover-5" />
                                    <label htmlFor="settings--profile__discover-5">
                                        <span className="radio--bg" />
                                        <span className="radio--text">Other</span>
                                    </label>
                                </div>
                            </div>
                            <div className="input--bottom-collection">
                                <h3 className="discover">
                                    <span>Social Media</span>
                                </h3>
                                <div className="input--multi social-media">
                                    <div className="input--group-container__vertical">
                                        <label htmlFor="settings--profile__twitter" className="settings--profile__icon-label">
                                            <div className="input--icon-container twitter">
                                                <img src={ twitter } alt="twitter" />
                                            </div>
                                        </label>
                                        <input ref={ socialTwitterInput } type="text" id="settings--profile__twitter" placeholder="Your Twitter ID" />
                                        <label className="settings--profile__border-bottom" />
                                        <label htmlFor="settings--profile__twitter" className="settings--profile__label">Your Twitter ID</label>
                                    </div>
                                    <div className="input--group-container__vertical">
                                        <label htmlFor="settings--profile__instagram" className="settings--profile__icon-label">
                                            <div className="input--icon-container instagram">
                                                <img src={ instagram } alt="instagram" />
                                            </div>
                                        </label>
                                        <input ref={ socialInstagramInput } type="text" id="settings--profile__instagram" placeholder="Your Instagram ID" />
                                        <label className="settings--profile__border-bottom" />
                                        <label htmlFor="settings--profile__instagram" className="settings--profile__label">Your Instagram ID</label>
                                    </div>
                                    <div className="input--group-container__vertical">
                                        <label htmlFor="settings--profile__facebook" className="settings--profile__icon-label">
                                            <div className="input--icon-container facebook">
                                                <img src={ facebook } alt="facebook" />
                                            </div>
                                        </label>
                                        <input ref={ socialFacebookInput } type="text" id="settings--profile__facebook" placeholder="Your Facebook ID" />
                                        <label className="settings--profile__border-bottom" />
                                        <label htmlFor="settings--profile__facebook" className="settings--profile__label">Your Facebook ID</label>
                                    </div>
                                    <div className="input--group-container__vertical">
                                        <label htmlFor="settings--profile__youtube" className="settings--profile__icon-label">
                                            <div className="input--icon-container youtube">
                                                <img src={ youtube } alt="youtube" />
                                            </div>
                                        </label>
                                        <input ref={ socialYoutubeInput } type="text" id="settings--profile__youtube" placeholder="Your Youtube ID" />
                                        <label className="settings--profile__border-bottom" />
                                        <label htmlFor="settings--profile__youtube" className="settings--profile__label">Your Youtube ID</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="settings--profile__footer-container">
                            <div className="upper-container">
                                { formError.show && <p className="form--error">{ formError.text }</p> }
                                { showSendingSpinner && <Spinner /> }
                                { formSuccess.show && <p className="form--success">{ formSuccess.text }</p> }
                            </div>
                            <Button
                                value={ (profileData && profileData.name) ? 'Edit' : 'Submit' }
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        profileData: state.settings.profile
    };
}

export default requireAuth(connect(mapStateToProps, {
    fetchSettingsProfileData,
    sendSettingsProfileData,
    wipeSettingsProfileData
})(Profile), true);