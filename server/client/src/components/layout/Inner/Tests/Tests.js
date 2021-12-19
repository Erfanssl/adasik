import React, { useState, useEffect, useRef } from 'react';
import './Tests.scss';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import {
    testFetchData,
    testInsideFetchWhoAmI,
    testInsideWipeWhoAmI
} from "../../../../actions/testAction";
import requireAuth from "../../../../middlewares/requireAuth";
import Spinner from "../../utils/Spinner/Spinner";
import createRadar from "../Statistics/Radar/createRadar";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";
import Loading from "../../utils/Loading/Loading";

// helpers
import wordCapitalize from "../../../../utility/wordCapitalize";

// icons
import close from '../../../../assets/icons/close.svg';

const Tests = ({
                   testData,
                   testFetchData,
                   testInsideFetchWhoAmI,
                   testInsideWipeWhoAmI
}) => {
    // states
    const [whoAmIFetchType, setWhoAmIFetchType] = useState({ type: '' });

    // refs
    const whoAmIDiagram = useRef();
    const whoAmIContainer = useRef();

    useEffect(() => {
        testFetchData();
        document.title = 'Adasik - Tests';
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
            testInsideWipeWhoAmI();
        };
    }, []);

    useEffect(() => {
        if (testData && testData.whoAmI) {
            if (testData.whoAmI.Error) {
                setWhoAmIFetchType({ type: 'error' });
            } else {
                if (whoAmIFetchType.type !== 'success') setWhoAmIFetchType({ type: 'success' });

                if (whoAmIFetchType.type === 'success') {
                    const personalityData = [[]];

                    Object.keys(testData.whoAmI.personality.items).forEach(dataKey => {
                        personalityData[0].push({ axis: wordCapitalize(dataKey), value: testData.whoAmI.personality.items[dataKey] });
                    });

                    createRadar(whoAmIDiagram, personalityData, 'medium', true);
                }
            }
        }
    }, [testData, whoAmIFetchType]);

    function renderItemBottom({ name, first, retake, availableIn }) {
        if (first) {
            return (
                <Link to={ `/tests/${ name.split(' ').join('-') }` } className="tests--type__item--bottom-container first">
                    <p>Take the Test</p>
                </Link>
            );
        }

        if (retake) {
            return (
                <Link to={ `/tests/${ name.split(' ').join('-') }` } className="tests--type__item--bottom-container retake">
                    <p>Retake the Test</p>
                </Link>
            );
        }

        if (availableIn) {
            return (
                <div className="tests--type__item--bottom-container available-in">
                    <p>{ availableIn } day{ availableIn > 1 ? 's' : '' } to retake...</p>
                </div>
            );
        }
    }

    function renderTests() {
        // we first classify them by their types
        const types = testData.main.map(test => test.type);

        function renderTypeInside(type) {
            return testData.main.filter(test => test.type === type).map(({ name, icon, first, retake, availableIn }) => {
                return (
                    <li className="tests--type__item">
                        <div className="tests--type__item--image-container">
                            <img src={ icon } alt={ name } />
                            <div>
                                <p>{ name.split(' ').map(word => wordCapitalize(word)).join(' ') }</p>
                            </div>
                        </div>
                        { renderItemBottom({ name, first, retake, availableIn }) }
                    </li>
                );
            });
        }

        return types.map(type => {
            return (
                <div style={ whoAmIFetchType.type !== '' ? { filter: 'blur(.5rem)' } : {} } className="tests--type-container">
                    <div className="tests--type__head-container">
                        <h2>{ type }</h2>
                    </div>
                    <ul className="tests--type__group">
                        { renderTypeInside(type) }
                    </ul>
                </div>
            );
        });
    }

    function handleWhoAmIBtnClick() {
        if (whoAmIContainer && whoAmIContainer.current) {
            whoAmIContainer.current.classList.add('active');
        }

        testInsideFetchWhoAmI();
        setWhoAmIFetchType({ type: 'spinner' });
    }

    function handleWhoAmiCloseClick() {
        if (whoAmIContainer && whoAmIContainer.current) {
            whoAmIContainer.current.classList.remove('active');
        }

        setWhoAmIFetchType({ type: '' });
        testInsideWipeWhoAmI();
    }

    function renderPersonalityInWordsTitle() {
        if (window.innerWidth < 500) {
            return <h2>In some words</h2>;
        }

        return <h2>Your personality in some words</h2>;
    }

    return (
        <div className="tests--container">
            { (!testData || !testData.main) && <Loading /> }
            <div ref={ whoAmIContainer } className="tests--who-am-i__container">
                <div onClick={ handleWhoAmiCloseClick } className="close--container">
                    <img src={ close } alt="close" />
                </div>
                <div className="holder">
                    {
                        whoAmIFetchType.type === 'spinner' &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                    {
                        whoAmIFetchType.type === 'error' &&
                        <div className="error">
                            <p>Unable to fetch the data. Try again</p>
                        </div>
                    }
                    {
                        whoAmIFetchType.type === 'success' && testData.whoAmI.personality.result.text &&
                        <>
                            <h2 className="result--header">
                                Analysis base on { testData.whoAmI.personality.result.testsSoFar } personality test{  testData.whoAmI.personality.result.testsSoFar > 1 ? 's' : '' } you've taken so far
                            </h2>
                            <div ref={ whoAmIDiagram } className="diagram--container" />
                            <div className="analysis--container">
                                { !! testData.whoAmI.personality.result.text.length && renderPersonalityInWordsTitle() }
                                <h3>{  testData.whoAmI.personality.result.text.split('\n')[0] }</h3>
                                {  testData.whoAmI.personality.result.text.split('\n')[1] && <p>{  testData.whoAmI.personality.result.text.split('\n')[1] }</p> }
                            </div>
                        </>
                    }
                    {
                        whoAmIFetchType.type === 'success' && testData.whoAmI.personality.result.testsSoFar === 0 &&
                        <div className="info">
                            <p>You haven't completed any test. Please take one and then come here</p>
                        </div>
                    }
                </div>
            </div>
            {
                whoAmIFetchType.type !== '' &&
                <div className="tests--overlay" />
            }
            <div className="tests--who-am-i__btn--container">
                <button onClick={ handleWhoAmIBtnClick }>Who Am I?</button>
            </div>
            { testData && testData.main && Object.keys(testData.main).filter(t => t !== 'inside').length && renderTests() }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        testData: state.tests
    };
}

export default requireAuth(
    connect(mapStateToProps, {
        testFetchData,
        testInsideFetchWhoAmI,
        testInsideWipeWhoAmI
    })(Tests)
);
