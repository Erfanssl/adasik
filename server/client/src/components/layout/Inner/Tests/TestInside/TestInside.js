import React, { useState, useEffect, useRef } from 'react';
import './TestInside.scss';
import { connect } from 'react-redux';
import {
    testInsideFetchData,
    testInsideSendData,
    testInsideSendFeedback
} from "../../../../../actions/testAction";
import requireAuth from "../../../../../middlewares/requireAuth";
import Button from "../../../utils/Button/Button";
import Spinner from "../../../utils/Spinner/Spinner";
import Loading from "../../../utils/Loading/Loading";
import NotFound from "../../../utils/NotFound/NotFound";

import createRadar from "../../Statistics/Radar/createRadar";
import wordCapitalize from "../../../../../utility/wordCapitalize";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";

// icons
import check from '../../../../../assets/icons/check-check.svg';
import '../../../../../assets/personality-general.svg';

const TestInside = ({
                        testInsideData,
                        testInsideFetchData,
                        testInsideSendData,
                        testInsideSendFeedback,
                        match
                    }) => {
    // states
    const [notFound, setNotFound] = useState(false);
    const [length, setLength] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [changedTimes, setChangedTimes] = useState(0);
    const [head, setHead] = useState(1);
    const [current, setCurrent] = useState(1);
    const [prevCur, setPrevCur] = useState(0);
    const [answeredArr, setAnsweredArr] = useState([]);
    const [testOverlayConfig, setTestOverlayConfig] = useState({ show: true, type: 'start' });
    const [showTestResult, setShowTestResult] = useState(false);
    const [testResultFeedback, setTestResultFeedback] = useState({ accuracy: null });
    const [testResultFeedbackResponse, setTestResultFeedbackResponse] = useState({ show: false, type: '' });
    const [showFeedbackValidateError, setShowFeedbackValidateError] = useState(false);
    // const [showSpinner, setShowSpinner] = useState(false);
    // const [showError, setShowError] = useState(false);


    // refs
    const infoContainer = useRef();
    const questionGroup = useRef();
    const testOverlayEl = useRef();
    const testPanel = useRef();
    const resultDiagram = useRef();
    const feedbackTextArea = useRef();

    const allowToChoose = useRef(true);

    useEffect(() => {
        const testName = match.params.testName.split('-').join(' ');
        if (testName !== 'personality general') setNotFound(true);
        document.title = `Adasik - ${ wordCapitalize(testName) }`;
        testInsideFetchData(testName);
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (testInsideData && testInsideData.result) {
            if (testInsideData.result.Error) {
                setTestOverlayConfig({ show: true, type: 'success' });
                setTestOverlayConfig({ show: true, type: 'error' });
            }

            if (testInsideData && testInsideData.result.newTraitsData) {
                setTestOverlayConfig({ show: true, type: 'success' });
                if (!showTestResult) setShowTestResult(true);

                const personalityData = [[]];

                if (showTestResult) {
                    Object.keys(testInsideData.result.newTraitsData).forEach(dataKey => {
                        personalityData[0].push({ axis: wordCapitalize(dataKey), value: testInsideData.result.newTraitsData[dataKey] });
                    });

                    createRadar(resultDiagram, personalityData, 'medium', true);
                }
            }
        }

        if (testInsideData && testInsideData.questions) {
            setLength(testInsideData.questions.length);
        }

        if (testInsideData && testInsideData.feedback) {
            if (testInsideData.feedback.Error) {
                setTestResultFeedbackResponse({ show: true, type: 'error' });
            } else setTestResultFeedbackResponse({ show: false, type: '' });

            if (testInsideData.feedback.done) {
                setTestResultFeedbackResponse({ show: true, type: 'success' });
            } else setTestResultFeedbackResponse({ show: false, type: '' });
        }
    }, [testInsideData, showTestResult]);

    useEffect(() => {
        if (testOverlayConfig.show === false) {
            if (testOverlayEl && testOverlayEl.current) {
                testOverlayEl.current.classList.remove('active');
            }
        }

        if (testOverlayConfig.show === true) {
            if (testOverlayEl && testOverlayEl.current) {
                testOverlayEl.current.classList.add('active');
            }
        }
    }, [testOverlayConfig]);

    useEffect(() => {
        if (current) {
            if (length && current > length) {
                setCurrent(length);
                setTestOverlayConfig({ show: true, type: 'finish' });
            }
            if (questionGroup && questionGroup.current) {
                if (current > prevCur + 1) {
                    setTimeout(() => {
                        questionGroup.current.style.transform = `translateX(-${ ( current * 100 ) - 100 }%)`;
                        setPrevCur(current - 1);
                    }, 150);
                } else {
                    questionGroup.current.style.transform = `translateX(-${ ( current * 100 ) - 100 }%)`;
                    setPrevCur(current - 1);
                }
            }
        }
    }, [current, questionGroup]);

    function renderInfoBox() {
        if (!testInsideData.allowToTest) {
            return (
                <div style={ showTestResult ? { filter: 'blur(.5rem)' } : {} } className="test--info-container not--allowed">
                    <p>You've already completed this test, during the last 30 days</p>
                    <p>You can retake it after { testInsideData.availableIn } days</p>
                </div>
            );
        }

        function handleGotItClick() {
            if (infoContainer && infoContainer.current) {
                infoContainer.current.style.transform = 'scaleY(0)';
                infoContainer.current.style.opacity = 0;
                infoContainer.current.style.visibility = 'hidden';

                if (testPanel && testPanel.current) {
                    testPanel.current.style.transform = 'translateY(-50%)';
                }
            }
        }

        if (testInsideData.first) {
            return (
                <div style={ showTestResult ? { filter: 'blur(.5rem)' } : {} } ref={ infoContainer } className="test--info-container ready">
                    <p>You can complete this test for the first time!</p>
                    <h4>But please remember:</h4>
                    <p>You should complete the test in one try, because you need to be in the same mental state for all questions</p>
                    <p>So, if you close this page and attempt later. you should start from beginning again</p>
                    <p>Your test will only get completed if you finish the last question and hit the finish button</p>
                    <p>Please be completely yourself; yourself at this moment</p>
                    <button onClick={ handleGotItClick }>Got it</button>
                </div>
            );
        }


        return (
            <div style={ showTestResult ? { filter: 'blur(.5rem)' } : {} } ref={ infoContainer } className="test--info-container ready">
                <p>You retake this test now!</p>
                <h4>But please remember:</h4>
                <p>You should complete the test in one try, because you need to be in the same mental state for all questions</p>
                <p>So, if you close this page and attempt later. you should start from beginning again</p>
                <p>Your test will only get completed if you finish the last question and hit the finish button</p>
                <p>Please be completely yourself; yourself at this moment</p>
                <button onClick={ handleGotItClick }>Got it</button>
            </div>
        );
    }

    function renderTestItem() {
        return testInsideData.questions.map((question, i) => {
            function handleChoiceClick(e) {
                if (allowToChoose?.current) {
                    document.querySelectorAll(`.test--test-panel__main--item-container[data-id="${ i + 1 }"] .choices div`).forEach(el => el.classList.remove('active'));
                    if (e.target.tagName === 'IMG') {
                        e.target.parentNode.classList.add('active');
                    } else e.target.classList.add('active');
                    if (current === head) {
                        setCurrent(current => current + 1);
                        setHead(head => head + 1);
                    } else {
                        setCurrent(head);
                    }

                    setAnsweredArr(answeredArr => {
                        let newAnsweredArr;
                        if (answeredArr.find(answer => answer.element === current)) {
                            setChangedTimes(changedTimes => changedTimes + 1);
                            newAnsweredArr = answeredArr.map(answer => answer.element === current ? ({ ...answer, choice: parseInt(e.target.dataset.id) }) : answer);
                        } else {
                            newAnsweredArr = [ ...answeredArr ];
                            if (e.target.dataset.id) newAnsweredArr.push({ element: current, choice: parseInt(e.target.dataset.id) });
                            if (!e.target.dataset.id) {
                                setCurrent(current => current - 1);
                                setHead(head => head - 1);
                            }
                        }

                        return newAnsweredArr;
                    });

                    allowToChoose.current = false;

                    setTimeout(() => {
                        allowToChoose.current = true;
                    }, 500);
                }
            }

            return (
                <div key={ question } data-id={ i + 1 } className="test--test-panel__main--item-container">
                    <p className="question">
                        { question }
                    </p>
                    <div className="choices">
                        <p className="agree--text">Agree</p>
                        <div data-id="7" onClick={ handleChoiceClick } className="agree" data-choice="agree-1">
                            <img data-id="7" src={ check } alt="check" />
                        </div>
                        <div data-id="6" onClick={ handleChoiceClick } className="agree" data-choice="agree-2">
                            <img data-id="6" src={ check } alt="check" />
                        </div>
                        <div data-id="5" onClick={ handleChoiceClick } className="agree" data-choice="agree-3">
                            <img data-id="5" src={ check } alt="check" />
                        </div>
                        <div data-id="4" onClick={ handleChoiceClick } className="neutral" data-choice="neutral">
                            <img data-id="4" src={ check } alt="check" />
                        </div>
                        <div data-id="3" onClick={ handleChoiceClick } className="disagree" data-choice="disagree-3">
                            <img data-id="3" src={ check } alt="check" />
                        </div>
                        <div data-id="2" onClick={ handleChoiceClick } className="disagree" data-choice="disagree-2">
                            <img data-id="2" src={ check } alt="check" />
                        </div>
                        <div data-id="1" onClick={ handleChoiceClick } className="disagree" data-choice="disagree-1">
                            <img data-id="1" src={ check } alt="check" />
                        </div>
                        <p className="disagree--text">Disagree</p>
                    </div>
                </div>
            );
        });
    }

    function handlePreviousQuestionClick() {
        setCurrent(current => current - 1);
    }

    function handleGoToWhereIWas() {
        setCurrent(head);
    }

    function handleTestStartBtn() {
        setTestOverlayConfig({ show: false, type: '' });
        setStartTime(Date.now());
        window.onbeforeunload = (e) => {
            e.preventDefault();
            delete e['returnValue'];
        };
    }

    function handleTestFinishBtn() {
        // submit the data
        const data = {
            testId: testInsideData.testId,
            startAt: startTime,
            endAt: Date.now(),
            answeredArr,
            changedTimes
        }

        testInsideSendData(data);
        setTestOverlayConfig({ show: true, type: 'spinner' });
        window.onbeforeunload = () => {};
    }

    function renderTestSection() {
        return (
            <div style={ showTestResult ? { filter: 'blur(.5rem)' } : {} } ref={ testPanel } className="test--test-panel__container">
                <div ref={ testOverlayEl } className="test--test-panel__overlay-container active">
                    {
                        testOverlayConfig.show && testOverlayConfig.type === 'start' &&
                        <div>
                            <p>If you're ready, Start the Test</p>
                            <Button onClick={ handleTestStartBtn } form={ true } text="Start" />
                        </div>
                    }
                    {
                        testOverlayConfig.show && testOverlayConfig.type === 'finish' &&
                        <div>
                            <p>To Finish and submit the Test, hit the Finish button</p>
                            <Button onClick={ handleTestFinishBtn } form={ true } text="Finish" />
                        </div>
                    }
                    {
                        testOverlayConfig.show && testOverlayConfig.type === 'error' &&
                        <div className="error">
                            Unable to send data. Try again
                        </div>
                    }
                    {
                        testOverlayConfig.show && testOverlayConfig.type === 'success' &&
                        <div className="success">
                            Successfully submitted the data
                        </div>
                    }
                    {
                        testOverlayConfig.show && testOverlayConfig.type === 'spinner' &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                </div>
                <div className="test--test-panel__progress-bar--container">
                    <div className="progress--shape__completion" style={ { width: (((current > length ? length : current) / length) * 100).toString() + '%' } } />
                    <div className="progress--number__completion">{ current > length ? length : current } of { length }</div>
                </div>
                <div className="test--test-panel__main-container">
                    <div ref={ questionGroup } className="test--test-panel__main--item-group">
                        { renderTestItem() }
                    </div>
                </div>
                <div className="test--test-panel__footer-container">
                    {
                        current > 1 &&
                        <p className="previous" onClick={ handlePreviousQuestionClick }>Previous Question</p>
                    }
                    {
                        current !== head &&
                        <p className="move" onClick={ handleGoToWhereIWas }>Go to Where I was</p>
                    }
                </div>
            </div>
        )
    }

    function handleFeedbackChoiceClick(e) {
        document.querySelectorAll(`.feedback--container .choices div`).forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');
        setTestResultFeedback(feedback => ({ ...feedback, accuracy: parseInt(e.target.dataset.id) }));
    }

    function handleFeedbackSubmit() {
        if (!testResultFeedback.accuracy && !feedbackTextArea.current.value.trim()) return setShowFeedbackValidateError(true);

        const data = {
            currentTestId: testInsideData.result.currentTestId,
            accuracy: testResultFeedback.accuracy,
            text: feedbackTextArea.current.value.trim()
        };

        // we send it
        testInsideSendFeedback(data);
        setTestResultFeedbackResponse({ show: true, type: 'spinner' });
    }

    function renderFeedback() {
        if (testResultFeedbackResponse.show && testResultFeedbackResponse.type === 'error') {
            return (
                <p className="info error">Unable to Send the data. Try again</p>
            );
        }

        if (testResultFeedbackResponse.show && testResultFeedbackResponse.type === 'success') {
            return (
                <p className="info success">Your feedback was sent successfully</p>
            );
        }

        if (testResultFeedbackResponse.show && testResultFeedbackResponse.type === 'spinner') {
            return (
                <Spinner />
            );
        }

        return (
            <>
                <h2>Tell us about the test</h2>
                <h3>How accurate the result of the test was in your opinion?</h3>
                <div className="choices">
                    <p className="agree--text">Accurate</p>
                    <div data-id="7" onClick={ handleFeedbackChoiceClick } className="agree" data-choice="agree-1">
                        <img src={ check } alt="check" />
                    </div>
                    <div data-id="6" onClick={ handleFeedbackChoiceClick } className="agree" data-choice="agree-2">
                        <img src={ check } alt="check" />
                    </div>
                    <div data-id="5" onClick={ handleFeedbackChoiceClick } className="agree" data-choice="agree-3">
                        <img src={ check } alt="check" />
                    </div>
                    <div data-id="4" onClick={ handleFeedbackChoiceClick } className="neutral" data-choice="neutral">
                        <img src={ check } alt="check" />
                    </div>
                    <div data-id="3" onClick={ handleFeedbackChoiceClick } className="disagree" data-choice="disagree-3">
                        <img src={ check } alt="check" />
                    </div>
                    <div data-id="2" onClick={ handleFeedbackChoiceClick } className="disagree" data-choice="disagree-2">
                        <img src={ check } alt="check" />
                    </div>
                    <div data-id="1" onClick={ handleFeedbackChoiceClick } className="disagree" data-choice="disagree-1">
                        <img src={ check } alt="check" />
                    </div>
                    <p className="disagree--text">Inaccurate</p>
                </div>
                <div className="input--container">
                    <h3>You can tell us about the result and the test</h3>
                    <textarea ref={ feedbackTextArea } rows={ 3 } placeholder="Write your comment here..." />
                    { showFeedbackValidateError && !testResultFeedback.accuracy && <p>Please complete one of the questions above</p> }
                    <Button onClick={ handleFeedbackSubmit } text="Submit" form={ true } />
                </div>
            </>
        );
    }

    function renderPersonalityDifferences() {
        return testInsideData.result.comparison.split('\n').map(comparison => {
            return <p key={ comparison }>{ comparison }</p>
        });
    }

    return (
        <div className="test--container">
            {
                showTestResult &&
                <div className="tests--overlay" />
            }
            { !testInsideData && <Loading /> }
            { notFound && <NotFound text="Test Not Found!" /> }
            { !notFound && testInsideData && renderInfoBox() }
            { testInsideData && testInsideData.allowToTest && renderTestSection() }
            {/*{ !notFound && testInsideData && renderTestSection() }*/}
            {
                showTestResult &&
                <div className="test--result-container">
                    <h2 className="result--header">
                        Analysis base on { testInsideData.result.result.testsSoFar } personality test{ testInsideData.result.result.testsSoFar > 1 ? 's' : '' } you've taken so far
                    </h2>
                    <div ref={ resultDiagram } className="diagram--container" />
                    <div className="analysis--container">
                        { !!testInsideData.result.result.text.length && <h2>Your personality in some words</h2> }
                        { !!testInsideData.result.result.text.length && <h2 className="head--two">In some words</h2> }
                        <h3>{ testInsideData.result.result.text.split('\n')[0] }</h3>
                        { testInsideData.result.result.text.split('\n')[1] && <p>{ testInsideData.result.result.text.split('\n')[1] }</p> }
                    </div>
                    <div className="comparison--container">
                        <h2>Your current personality compares to before</h2>
                        <h2 className="head--two">Comparison to before</h2>
                        {
                            testInsideData.result.result.testsSoFar > 1 ?
                                <div>
                                    { testInsideData.result.comparison !== 'No difference' ? renderPersonalityDifferences() : <p>'No significant differences compare to previous tests.'</p> }
                                </div> :
                                <p>Since it's your first test, we can't provide you any data now</p>
                        }
                    </div>
                    <div className="feedback--container">
                        { renderFeedback() }
                    </div>
                </div>
            }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        testInsideData: state.tests.inside
    };
}

export default requireAuth(
    connect(mapStateToProps, {
        testInsideFetchData,
        testInsideSendData,
        testInsideSendFeedback
    })(TestInside)
);
