import React, { useState, useEffect, useRef } from 'react';
import './UsersSearch.scss';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import {
    usersProfileFetchSearch,
    usersProfileWipeSearch,
    usersProfileWipeData
} from "../../../../../actions/usersProfileAction";
import Spinner from "../../../utils/Spinner/Spinner";
import history from "../../../../../history";

// helpers
import numberFormatter from "../../../../../utility/numberFormatter";
import likesFormatter from "../../../../../utility/likesFormatter";

// icons
import close from '../../../../../assets/icons/close-reply.svg';
import user from '../../../../../assets/icons/user.svg';
import noResult from '../../../../../assets/icons/no-result.svg';

const UsersSearch = ({
                         setUsernameChange,
                         usersSearchData,
                         usersProfileFetchSearch,
                         usersProfileWipeData,
                         usersProfileWipeSearch
}) => {
    // state
    const [input, setInput] = useState('');
    const [inputFocus, setInputFocus] = useState(false);
    const [inputTimeout, setInputTimeout] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showError, setShowError] = useState(false);

    // refs
    const resultContainer = useRef();
    const usersSearchContainer = useRef();
    const inputEl = useRef();

    useEffect(() => {
        return () => {
            usersProfileWipeSearch();
        };
    }, []);

    useEffect(() => {
        if (resultContainer && resultContainer.current && inputFocus && input.length) {
            resultContainer.current.classList.add('active');
            if (usersSearchContainer && usersSearchContainer.current) usersSearchContainer.current.style.zIndex = 15
            if (inputEl && inputEl) inputEl.current.style.borderBottom = 'none';
        } else if (resultContainer && resultContainer.current && (!inputFocus || !input.length)) {
            resultContainer.current.classList.remove('active');
            if (usersSearchContainer && usersSearchContainer.current) usersSearchContainer.current.style.zIndex = 5
        }

        if (inputEl && inputEl.current && !inputFocus) inputEl.current.style.borderBottom = '.1rem solid #ff9900';
        if (inputEl && inputEl.current && inputFocus) inputEl.current.style.borderBottom = '';
    }, [resultContainer, inputFocus, input, inputEl, usersSearchContainer]);

    useEffect(() => {
        if (usersSearchData) {
            if (Array.isArray(usersSearchData)) {
                setShowSpinner(false);
            }

            if (usersSearchData.Error) {
                setShowError(true);
            }
        }
    }, [usersSearchData]);

    useEffect(() => {
        if (!input.length && inputFocus) {
            setShowSpinner(false);
            usersProfileWipeSearch();
            setShowError(false);
        }
    }, [input]);

    function handleInputFocus() {
        setInputFocus(true);
    }

    function handleInputChange(e) {
        setInput(e.target.value);
        setShowSpinner(true);
        const timeoutId = setTimeout(() => {
            if (e.target.value.trim()) usersProfileFetchSearch(e.target.value);
        }, 1000);
        setInputTimeout(timeoutId);
        if (inputTimeout) { clearTimeout(inputTimeout) }
    }

    function handleCloseClick() {
        setInputFocus(false);
        setInput('');
        usersProfileWipeSearch();
    }

    function renderSearchItem() {
        return usersSearchData.map(({ username, avatar, status, fullName, likes, totalScore, rank, level }) => {
            function generateAvatarClassName(status) {
                let className = "users-search--result__avatar-container";
                if (status === 'online') className += " users-search--person__online";
                else className += " users-search--person__offline";

                return className;
            }

            function handleLinkClick(username, e) {
                e.preventDefault();
                usersProfileWipeData();
                history.push(`/profile/${ username }`);
                if (setUsernameChange) setUsernameChange(username);
                setInput('');
            }

            return (
                <Link key={ username } onClick={ handleLinkClick.bind(null, username) } to={ `/profile/${ username }` } className="users-search--result__item">
                    <div className={ generateAvatarClassName(status) }>
                        <img src={ avatar || user } alt={ username } />
                    </div>
                    <div className="users-search--result__name-container users-search--result__double-info--container">
                        <p>{ username }</p>
                        <p>{ fullName }</p>
                    </div>
                    <div className="users-search--result__first-data--container users-search--result__double-info--container">
                        <p>Score: { numberFormatter(totalScore) }</p>
                        <p>Rank: { numberFormatter(rank) }</p>
                    </div>
                    <div className="users-search--result__second-data--container users-search--result__double-info--container">
                        <p>Level: { numberFormatter(level) }</p>
                        <p>Likes: { likesFormatter(likes || 1) }</p>
                    </div>
                </Link>
            );
        });
    }

    return (
        <div ref={ usersSearchContainer } className="users-search--container">
            <div className="users-search--input__container">
                <input
                    ref={ inputEl }
                    type="text"
                    placeholder="Search users by their username or full name"
                    onFocus={ handleInputFocus }
                    onChange={ handleInputChange }
                    value={ input }
                />
                {
                    showSpinner &&
                    <div className="spinner--container">
                        <Spinner />
                    </div>
                }
                {
                    !showSpinner && !!input.length &&
                    <div onClick={ handleCloseClick } className="close--container">
                        <img src={ close } alt="close" />
                    </div>
                }
            </div>
            <div ref={ resultContainer } className="users-search--result__container">
                <div className="users-search--result__group">
                    {
                        showSpinner && (!usersSearchData || !usersSearchData.length) &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                    {
                        usersSearchData && !usersSearchData.length && !showSpinner &&
                        <div className="no-result-found">
                            <img src={ noResult } alt="no result" />
                            <p>No result found</p>
                        </div>
                    }
                    {
                        showError &&
                        <div className="result--error">
                            <p>Operation failed. Try again</p>
                        </div>
                    }
                    { usersSearchData && !!usersSearchData.length && renderSearchItem() }
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        usersSearchData: state.usersProfile.search
    };
}

export default connect(mapStateToProps, {
    usersProfileFetchSearch,
    usersProfileWipeSearch,
    usersProfileWipeData
})(UsersSearch);