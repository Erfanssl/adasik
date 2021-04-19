import React, { useState, useEffect, useRef } from 'react';
import './Score.scss';
import numberFormatter from "../../../utility/numberFormatter";

const increasedBoostIcon = (
    <svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
        <g id="Flat">
            <shape cx="256" cy="447.729" fill="#ffb302" r="40"/>
            <path d="m256 24.271a24 24 0 0 1 24 24v24a0 0 0 0 1 0 0h-48a0 0 0 0 1 0 0v-24a24 24 0 0 1 24-24z"
                  fill="#ffb302"/>
            <path d="m432 440.271h-352v-12.187a104.575 104.575 0 0 1 20.246-61.659 184.675 184.675 0 0 0 35.754-108.887v-86.067c0-63.623 53.726-115.2 120-115.2 66.274 0 120 51.577 120 115.2v86.067a184.675 184.675 0 0 0 35.754 108.887 104.575 104.575 0 0 1 20.246 61.659z"
                  fill="#1f88e5"/>
            <path d="m88 400.271h336a24 24 0 0 1 24 24v16a8 8 0 0 1 -8 8h-368a8 8 0 0 1 -8-8v-16a24 24 0 0 1 24-24z"
                  fill="#1a76d2"/>
            <g fill="#ffc108">
                <path d="m408 208.271h88v16h-88z"/>
                <path d="m401.352 144.271h93.295v16h-93.295z" transform="matrix(.857 -.515 .515 .857 -14.497 252.208)"/>
                <path d="m440 233.624h16.001v93.295h-16.001z" transform="matrix(.514 -.857 .857 .514 -22.825 520.23)"/>
                <path d="m16 208.271h88v16h-88z"/>
                <path d="m56 105.623h16v93.295h-16z" transform="matrix(.514 -.857 .857 .514 -99.499 128.808)"/>
                <path d="m17.352 272.271h93.295v16.001h-93.295z" transform="matrix(.857 -.514 .514 .857 -135.078 72.868)"/>
            </g>
            <path d="m224 128.271h80l-40 72h64l-120 152 32-112h-56z" fill="#ffb302"/>
        </g>
    </svg>
);

const decreasedBoostIcon = (
    <svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
        <g id="Flat">
            <shape cx="256" cy="447.729" fill="red" r="40"/>
            <path d="m256 24.271a24 24 0 0 1 24 24v24a0 0 0 0 1 0 0h-48a0 0 0 0 1 0 0v-24a24 24 0 0 1 24-24z"
                  fill="red"/>
            <path d="m432 440.271h-352v-12.187a104.575 104.575 0 0 1 20.246-61.659 184.675 184.675 0 0 0 35.754-108.887v-86.067c0-63.623 53.726-115.2 120-115.2 66.274 0 120 51.577 120 115.2v86.067a184.675 184.675 0 0 0 35.754 108.887 104.575 104.575 0 0 1 20.246 61.659z"
                  fill="#1f88e5"/>
            <path d="m88 400.271h336a24 24 0 0 1 24 24v16a8 8 0 0 1 -8 8h-368a8 8 0 0 1 -8-8v-16a24 24 0 0 1 24-24z"
                  fill="#1a76d2"/>
            <g fill="red">
                <path d="m408 208.271h88v16h-88z"/>
                <path d="m401.352 144.271h93.295v16h-93.295z" transform="matrix(.857 -.515 .515 .857 -14.497 252.208)"/>
                <path d="m440 233.624h16.001v93.295h-16.001z" transform="matrix(.514 -.857 .857 .514 -22.825 520.23)"/>
                <path d="m16 208.271h88v16h-88z"/>
                <path d="m56 105.623h16v93.295h-16z" transform="matrix(.514 -.857 .857 .514 -99.499 128.808)"/>
                <path d="m17.352 272.271h93.295v16.001h-93.295z" transform="matrix(.857 -.514 .514 .857 -135.078 72.868)"/>
            </g>
            <path d="m224 128.271h80l-40 72h64l-120 152 32-112h-56z" fill="red"/>
        </g>
    </svg>
);

const Score = ({ type, finalScore = false, dataFromSocket, setMaxBooster, setScore, gameName }) => {
    // state
    const [booster, setBooster] = useState(1);
    const [totalScore, setTotalScore] = useState(2);
    const [showDecreaseStatus, setShowDecreaseStatus] = useState(false);
    const [showIncreaseStatus, setShowIncreaseStatus] = useState(false);
    const [consecutiveTrue, setConsecutiveTrue] = useState(0);

    // Refs
    const shapeContainer = useRef();
    const scoreContainer = useRef();

    useEffect(() => {
        return () => {
            setConsecutiveTrue(0);
            setBooster(1);
        };
    }, []);

    useEffect(() => {
        if (dataFromSocket && dataFromSocket.score) {
            setBooster(Number(dataFromSocket.booster));
            setConsecutiveTrue(Number(dataFromSocket.consecutiveTrue));
            setTotalScore(Number(dataFromSocket.score));
        }
    }, [dataFromSocket]);

    useEffect(() => {
        renderTrueCircle();
    }, [consecutiveTrue]);

    useEffect(() => {
        if (type[0] === 'right') {
            setConsecutiveTrue(t => t + 1);
            let newScore;
            if (gameName === 'Anticipation') newScore = totalScore + (booster ** 2);
            if (gameName === 'MentalFlex') newScore = totalScore + parseInt((booster ** 2.5).toFixed(0));
            if (gameName === 'MemoryRacer') newScore = totalScore + parseInt((booster ** 2.7).toFixed(0));
            if (newScore) setTotalScore(newScore);
            if (setScore && newScore) setScore(newScore);
        }

        if (type[0] === 'wrong') {
            setConsecutiveTrue(0);
            if (booster !== 1) setBooster(1);
        }
    }, [type]);

    useEffect(() => {
        if (consecutiveTrue >= 4) {
            setBooster(booster => booster + 1);
            // setConsecutiveTrue(0);
        }
    }, [consecutiveTrue]);

    useEffect(() => {
        if (setMaxBooster) setMaxBooster(booster);

        if (booster > 1) {
            setShowIncreaseStatus(true);
            setTimeout(() => {
                setShowIncreaseStatus(false);
            }, 1500);
        }

        else if (booster <= 1 && totalScore !== 2) {
            setShowDecreaseStatus(true);
            setTimeout(() => {
                setShowDecreaseStatus(false);
            }, 1500);
        }
    }, [booster]);

    function renderTrueCircle() {
        if (shapeContainer && shapeContainer.current) {
            shapeContainer.current.childNodes.forEach(node => {
                const id = Number(node.dataset.id);

                function renderYellowCircle(node) {
                    node.style.backgroundImage = 'linear-gradient(315deg, #fbb034 0%, #ffdd00 74%)';
                    node.style.opacity = '0';
                    node.style.transition = 'all .2s';

                    setTimeout(() => {
                        node.style.opacity = '1';
                    }, 200);
                }

                if (consecutiveTrue === 0 && id) {
                    node.style.backgroundImage = 'linear-gradient(135deg, #0a2514 0%, #233329 74%)';
                    return;
                }

                if (consecutiveTrue >= 4 && id) {
                    renderYellowCircle(node);

                    setTimeout(() => {
                        node.style.backgroundImage = 'linear-gradient(135deg, #0a2514 0%, #233329 74%)';
                    }, 400);

                    setTimeout(() => {
                        setConsecutiveTrue(0);
                    }, 100);
                    return;
                }

                if (id === consecutiveTrue) {
                    return renderYellowCircle(node);
                }

                if (id && id < consecutiveTrue) node.style.backgroundImage = 'linear-gradient(315deg, #fbb034 0%, #ffdd00 74%)';
            });
        }
    }

    // rendering final result
    function renderFinalScore() {
        return (
            <div>
                Your score is: { totalScore }
            </div>
        );
    }

    // rendering booster status
    function renderIncreaseBoosterStatus() {
        return (
            <div className="score--booster-status increase">
                <div className="score--booster-status__shape">
                    { increasedBoostIcon }
                </div>
                <div className="score--booster-status__text">
                    <p>Increased to { booster }X booster!</p>
                </div>
            </div>
        );
    }

    function renderDecreaseBoosterStatus() {
        return (
            <div className="score--booster-status decrease">
                <div className="score--booster-status__shape">
                    { decreasedBoostIcon }
                </div>
                <div className="score--booster-status__text">
                    <p>Decreased to { booster }X booster!</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div ref={ scoreContainer } className="score--container">
                <p className="score--total-score">Score: { numberFormatter(totalScore) }</p>
                <div ref={ shapeContainer } className="score--shape-container">
                    <div data-id={ 4 } className="score--shape__item" />
                    <div data-id={ 3 } className="score--shape__item" />
                    <div data-id={ 2 } className="score--shape__item" />
                    <div data-id={ 1 } className="score--shape__item" />
                    <div className="score--shape__text">
                        <p>x{ booster }</p>
                    </div>
                </div>
            </div>
            { showDecreaseStatus && renderDecreaseBoosterStatus() }
            { showIncreaseStatus && renderIncreaseBoosterStatus() }
        </>

    );
};

export default Score;