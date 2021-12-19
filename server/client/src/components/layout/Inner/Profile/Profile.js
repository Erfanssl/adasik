import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Profile.scss';
import requireAuth from "../../../../middlewares/requireAuth";
import UsersSearch from "./UsersSearch/UsersSearch";
// action
import { fetchProfile } from "../../../../actions/profileAction";
import { usersProfileWipeData } from "../../../../actions/usersProfileAction";
// chart generators
import createRadar from "../Statistics/Radar/createRadar";
import renderPieChart from "../Statistics/createPieChart";
// helper functions
import numberFormatter from "../../../../utility/numberFormatter";
import likesFormatter from "../../../../utility/likesFormatter";
import timePastFormatter from "../../../../utility/timePastFormatter";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";
import Loading from "../../utils/Loading/Loading";
import textCutter from "../../../../utility/textCutter";
import wordCapitalize from "../../../../utility/wordCapitalize";

// assets
// social icons
import twitter from '../../../../assets/icons/twitter.svg';
import instagram from '../../../../assets/icons/instagram.svg';
import facebook from '../../../../assets/icons/facebook.svg';
import youtube from '../../../../assets/icons/youtube.svg';


const pieDims = { height: 280, width: 280, radius: 140 };

const Profile = ({ profileData, fetchProfile, usersProfileWipeData }) => {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [brainData, setBrainData] = useState([[]]);
    const [personalityData, setPersonalityData] = useState([[]]);
    const [gamesData, setGamesData] = useState([]);

    const canvas = useRef();
    const canvas2 = useRef();
    const canvas3 = useRef();

    function handleRadarDiagramData(data, type) {
        const outerArr = [];
        const innerArr = [];
        for (let key in data) {
            innerArr.push({
                axis: key.replace(/[A-Z]/, w => ' ' + w).replace(/^.+?/, w => w.toUpperCase()),
                value: data[key]
            })
        }

        outerArr.push(innerArr);

        if (type === 'brain') return setBrainData(outerArr);
        setPersonalityData(outerArr);
    }

    function handlePieChartData(data) {
        const arr = [];
        for (let key in data) {
            if (key !== 'total') {
                arr.push({
                    name: key.replace(/^.+?/, w => w.toUpperCase()),
                    orders: data[key]
                })
            }
        }

        setGamesData(arr);
    }

    useEffect(() => {
        if (dataLoaded) {
            handleRadarDiagramData(profileData.info.specific.detailed.brain, 'brain');
            handleRadarDiagramData(profileData.info.specific.detailed.personality, 'personality');
            handlePieChartData(profileData.info.specific.whole.games);
        }
    }, [dataLoaded]);

    useEffect(() => {
        if (profileData && Object.keys(profileData).length) setDataLoaded(true);
    }, [profileData])

    useEffect(() => {
        document.title = 'Adasik - Profile';

        fetchProfile();

        const pageViewSocket = pageViewSocketConnection();

        return () => {
            usersProfileWipeData();
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (dataLoaded) {
            createRadar(canvas, brainData, 'small');
        }
    }, [canvas, brainData]);

    useEffect(() => {
        if (dataLoaded) {
            createRadar(canvas2, personalityData, 'small');
        }
    }, [canvas2, personalityData]);

    useEffect(() => {
        if (dataLoaded) {
            renderPieChart(canvas3, gamesData, pieDims);
        }
    }, [canvas3, gamesData]);

    function renderStatus() {
        if (dataLoaded && profileData.status.text === 'online') {
            return <p className="online">{ profileData.status.text }</p>;
        } else if (dataLoaded && profileData.status.text === 'offline') {
            return <p className="offline">last seen { timePastFormatter(profileData.status.date) }</p>;
        }
    }

    function renderSocial() {
        if (dataLoaded) {
            return profileData.info.general.social.map(el => {
                switch (el.name) {
                    case 'Twitter':
                        return (
                            <div key={ el._id } className="profile--right__social-icon twitter">
                                <a href={ el.link }>
                                    <img src={ twitter } alt="twitter" />
                                </a>
                            </div>
                        );
                    case 'Instagram':
                        return (
                            <div key={ el._id } className="profile--right__social-icon instagram">
                                <a href={ el.link }>
                                    <img src={ instagram } alt="instagram" />
                                </a>
                            </div>
                        );
                    case 'Facebook':
                        return (
                            <div key={ el._id } className="profile--right__social-icon facebook">
                                <a href={ el.link }>
                                    <img src={ facebook } alt="facebook" />
                                </a>
                            </div>
                        );
                    case 'Youtube':
                        return (
                            <div key={ el._id } className="profile--right__social-icon youtube">
                                <a href={ el.link }>
                                    <img src={ youtube } alt="youtube" />
                                </a>
                            </div>
                        );
                }
            });
        }
    }

    function renderFriends() {
        if (dataLoaded) {
            return profileData.friends.map(({ username, status, avatar }) => {
                return (
                    <li key={ username } className={ "profile--friends__item" }>
                        <Link to={ `/profile/${ username }` } className={ (status === 'online' ? "profile--person__online" : "profile--person__offline") }>
                            <img src={ avatar } title={ username } alt={ username } />
                            <div className="username">
                                <p>{ textCutter(username, 10) }</p>
                            </div>
                        </Link>
                    </li>
                );
            });
        }
    }

    function renderEducationText(text) {
        if (text.toLowerCase().includes('professional degree')) return 'Professional degree';
        return text;
    }

    return (
        <div className="profile--container" style={ !dataLoaded ? { height: '100%' } : {} }>
            {
                !dataLoaded && <Loading text="Fetching Data..." />
            }
            <UsersSearch />
            <div className="profile--verbal-container">
                <div className="profile--verbal__left">
                    <div className="profile--verbal__avatar-container">
                        <div className={ "profile--verbal__avatar " + (profileData.status?.text === 'online' ? "profile--person__online" : "profile--person__offline") }>
                            { dataLoaded && <img src={ profileData.info.general.avatar } alt="user" /> }
                        </div>
                    </div>
                    <div className="profile--verbal__user-info">
                        <div className="profile--user__name">
                            <p>{ dataLoaded && profileData.username }</p>
                        </div>
                        <div className="profile--user__last-seen">
                            { dataLoaded && renderStatus() }
                        </div>
                    </div>
                </div>
                <div className="profile--verbal__right">
                    <div className="profile--right__row">
                        <p><span>Name:</span> { dataLoaded && textCutter(profileData.info.general.name.split(' ').map(w => wordCapitalize(w)).join(' '), 20) }</p>
                        <p><span>Total Score:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.totalScore) }</p>
                        <p><span>Universal Rank:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.rank) }</p>
                    </div>
                    <div className="profile--right__row">
                        <p><span>Level:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.level.level) }</p>
                        <p><span>Training Score:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.trainingScore) }</p>
                        <p><span>Member Since:</span> { dataLoaded && new Date(profileData.info.general.memberSince).toDateString().split(' ').map((el, i) => i % 2 !== 0 ? el : ' ') }</p>
                    </div>
                    <div className="profile--right__row">
                        {/*<p><span>Group:</span> { dataLoaded && profileData.info.specific.whole.group.name }</p>*/}
                        <p><span>Age:</span> { dataLoaded && profileData.info.general.age || 'Not Completed' }</p>
                        <p><span>Job:</span> { dataLoaded && textCutter(profileData.info.general.job.split(' ').map(w => wordCapitalize(w)).join(' '), 20) || 'Not Completed' }</p>
                        <p><span>Friends:</span> { dataLoaded && numberFormatter(profileData.friends.length) }</p>
                    </div>
                    <div className="profile--right__row">
                        <p><span>Challenges:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.games.total) }</p>
                        <p><span>Trainings:</span> { dataLoaded && likesFormatter(profileData.info.specific.whole.trainings) }</p>
                        <p><span>Education:</span> { dataLoaded && renderEducationText(profileData.info.general.education) || 'Not Completed' }</p>
                    </div>
                    <div className="profile--right__row">
                        <p><span>Likes:</span> { dataLoaded && likesFormatter(profileData.info.general.likes) }</p>
                        <p><span>Country:</span> { dataLoaded && profileData.info.general.location.country ? textCutter(profileData.info.general.location.country.split(',')[0], 20) : 'Not Completed' }</p>
                    </div>
                    <div className="profile--line-separator" />
                    <div className="profile--right__bottom-container">
                        <div className="profile--right__data-container">
                            <div className="profile--right__philosophy-container">
                                <h3><span>Philosophy:</span></h3>
                                <p>{ dataLoaded && profileData.info.general.philosophy || 'Not Completed' }</p>
                            </div>
                            <div className="profile--right__bio-container">
                                <h3><span>Bio:</span></h3>
                                <p>{ dataLoaded && profileData.info.general.bio || 'Not Completed' }</p>
                            </div>
                        </div>
                        <div className="profile--right__social-container">
                            { renderSocial() }
                        </div>
                    </div>
                </div>
                <div className="profile--verbal__right--two">
                    <div className="items--container">
                        <p><span>Name:</span> { dataLoaded && textCutter(profileData.info.general.name.split(' ').map(w => wordCapitalize(w)).join(' '), 20) }</p>
                        <p><span>Total Score:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.totalScore) }</p>
                        <p><span>Universal Rank:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.rank) }</p>
                        <p><span>Level:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.level.level) }</p>
                        <p><span>Training Score:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.trainingScore) }</p>
                        <p><span>Member Since:</span> { dataLoaded && new Date(profileData.info.general.memberSince).toDateString().split(' ').map((el, i) => i % 2 !== 0 ? el : ' ') }</p>
                        {/*<p><span>Group:</span> { dataLoaded && profileData.info.specific.whole.group.name }</p>*/}
                        <p><span>Age:</span> { dataLoaded && profileData.info.general.age || 'Not Completed' }</p>
                        <p><span>Job:</span> { dataLoaded && textCutter(profileData.info.general.job.split(' ').map(w => wordCapitalize(w)).join(' '), 20) || 'Not Completed' }</p>
                        <p><span>Friends:</span> { dataLoaded && numberFormatter(profileData.friends.length) }</p>
                        <p><span>Challenges:</span> { dataLoaded && numberFormatter(profileData.info.specific.whole.games.total) }</p>
                        <p><span>Trainings:</span> { dataLoaded && likesFormatter(profileData.info.specific.whole.trainings) }</p>
                        <p><span>Education:</span> { dataLoaded && renderEducationText(profileData.info.general.education) || 'Not Completed' }</p>
                        <p><span>Likes:</span> { dataLoaded && likesFormatter(profileData.info.general.likes) }</p>
                        <p><span>Country:</span> { dataLoaded && profileData.info.general.location.country ? textCutter(profileData.info.general.location.country.split(',')[0], 20) : 'Not Completed' }</p>
                    </div>
                    <div className="profile--line-separator" />
                    <div className="profile--right__bottom-container">
                        <div className="profile--right__data-container">
                            <div className="profile--right__philosophy-container">
                                <h3><span>Philosophy:</span></h3>
                                <p>{ dataLoaded && profileData.info.general.philosophy || 'Not Completed' }</p>
                            </div>
                            <div className="profile--right__bio-container">
                                <h3><span>Bio:</span></h3>
                                <p>{ dataLoaded && profileData.info.general.bio || 'Not Completed' }</p>
                            </div>
                        </div>
                        <div className="profile--right__social-container">
                            { renderSocial() }
                        </div>
                    </div>
                </div>
            </div>
            <div className="profile--visual-container">
                <h2 className="profile--h2">Statistics</h2>
                <div className="profile--link">
                    <Link to="/statistics">View All -></Link>
                </div>
                <div className="profile--visual__chart-group">
                    <div className="profile--visual__chart-container">
                        <h3>Brain</h3>
                        <div ref={ canvas } className="profile--visual__first-radar" />
                    </div>
                    <div className="profile--visual__chart-container">
                        <h3>Personality</h3>
                        <div ref={ canvas2 } className="profile--visual__second-radar" />
                    </div>
                    <div className="profile--visual__chart-container">
                        {
                             dataLoaded &&  !gamesData.reduce((acc, gData) => gData.orders + acc, 0) &&
                                 <div className="no--games">
                                     <p>You've Completed no Challenges!</p>
                                 </div>
                        }
                        <h3>Challenges</h3>
                        <div ref={ canvas3 } className="profile--visual__first-pie" />
                    </div>
                </div>
            </div>
            <div className="profile--friends-container">
                <h2 className="profile--h2">Friends</h2>
                {
                    dataLoaded && !!profileData.friends.length &&
                    <div className="profile--link">
                        <Link to="/friends">View All -></Link>
                    </div>
                }
                <div className="profile--friends__body-container">
                    {
                        dataLoaded &&  !profileData.friends.length &&
                        <div className="no--friends">
                            <p>Seems like you have no friends!</p>
                        </div>
                    }
                    <ul className="profile--friends__items">
                        { renderFriends() }
                    </ul>
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        profileData: state.profile
    };
}

export default requireAuth(connect(mapStateToProps, { fetchProfile, usersProfileWipeData })(Profile));
