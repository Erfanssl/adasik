import React, { useState, useRef, useEffect } from 'react';
import './MentalFlex.scss';
import Clock from "../Clock/Clock";
import Button from "../Button/Button";
import Result from "../Result/Result";
import Score from "../Score/Score";

// Colors
const BLUE = '#0086fc';
const PURPLE = '#f107f1';
const RED = '#ff0000';
const YELLOW = '#f2f600';
const GREEN = '#19fd00'

const data = [
    { id: 1, text: 'red', color: RED, bool: true },
    { id: 2, text: 'red', color: BLUE, bool: false },
    { id: 3, text: 'blue', color: GREEN, bool: false },
    { id: 4, text: 'blue', color: YELLOW, bool: false },
    { id: 5, text: 'purple', color: PURPLE, bool: true },
    { id: 6, text: 'blue', color: BLUE, bool: true },
    { id: 7, text: 'yellow', color: RED, bool: false },
    { id: 8, text: 'green', color: GREEN, bool: true },
    { id: 9, text: 'red', color: YELLOW, bool: false },
    { id: 10, text: 'green', color: YELLOW, bool: false },
    { id: 11, text: 'yellow', color: RED, bool: false },
    { id: 12, text: 'blue', color: BLUE, bool: true },
    { id: 13, text: 'purple', color: YELLOW, bool: false },
    { id: 14, text: 'yellow', color: BLUE, bool: false }
];

const MentalFlex = ({ shouldStart, handleResult, dataFromSocket, setMaxBooster, setScore, setGameName, finish, setFinish, gameSocket, isFromSocket }) => {
    const [result, setResult] = useState(['']);
    const [randomNum, setRandomNum] = useState(() => randomNumFn());
    const [info, setInfo] = useState(() => data[randomNumFn()]);
    const [start, setStart] = useState(false);

    // Refs
    const container = useRef();
    const liText = useRef();
    const metaContainer = useRef();

    const allowToChoose = useRef(true);
    const allowToChooseInterval = useRef(true);

    useEffect(() => {
        document.title = 'Adasik - Mental Flex';
        if (container && container.current) container.current.focus();
        if (setGameName) setGameName('MentalFlex');
    }, []);

    useEffect(() => {
        if (shouldStart) {
            setStart(true);
            if (container && container.current) container.current.focus();
        }
    }, [shouldStart]);

    useEffect(() => {
        const info = data.find(val => val.id === randomNum);
        setInfo(info);
    }, [randomNum]);

    useEffect(() => {
        if (liText?.current) {
            setTimeout(() => {
                liText.current.style.opacity = '1';
                liText.current.style.transform = 'scale(1)';
            }, 50);
        }
    }, [info]);

    function checkTheAnswer(answer) {
        answer = answer === 'yes';
        if (info) return info.bool === answer;
    }

    function randomNumFn() {
        let rand = Math.floor(Math.random() * 14) + 1;
        while (rand === randomNum) {
            rand = Math.floor(Math.random() * 14) + 1;
        }
        return rand;
    }

    function printResult(bool) {
        if (bool) {
            setResult(['right']);
            handleResult({ res: 'right' });
            metaContainer.current.style.boxShadow = '0 0 4.2rem 0.2rem #00ff00';
        } else {
            setResult(['wrong']);
            handleResult({ res: 'wrong' });
            metaContainer.current.style.boxShadow = '0 0 4.2rem 0.2rem #ff0000';
        }
    }

    function beforeUpdate() {
        if (liText && liText.current) {
            liText.current.style.display = 'none';
            liText.current.style.opacity = '0';
            liText.current.style.transform = 'scale(0.5)';

            setTimeout(() => {
                liText.current.style.display = 'block';
                update();
            }, 50);
        }

    }

    function update() {
        setRandomNum(randomNumFn());
    }

    function btnOnClick(e) {
        if (start && !finish && allowToChooseInterval?.current) {
            allowToChoose.current = false;
            allowToChooseInterval.current = false;
            const btnId = Number(e.target.dataset.id);
            let btnText;
            if (btnId === 1) btnText = 'no';
            else if (btnId === 2) btnText = 'yes';
            const res = checkTheAnswer(btnText);
            printResult(res);
            beforeUpdate();
            setTimeout(() => {
                allowToChooseInterval.current = true;
            }, 230);
        }
    }

    function onContainerKeyDown(e) {
        if (start && !finish) {
            let bool = false;

            if (e.keyCode === 37) bool = 'no';
            else if (e.keyCode === 39) bool = 'yes';

            if (bool && allowToChoose?.current && allowToChooseInterval?.current) {
                allowToChoose.current = false;
                allowToChooseInterval.current = false;
                const res = checkTheAnswer(bool);
                printResult(res);
                beforeUpdate();
                setTimeout(() => {
                    allowToChooseInterval.current = true;
                }, 230);
            }
        }
    }

    function handleContainerKeyUp() {
        allowToChoose.current = true;
    }

    return (
        <div ref={ container } onKeyDown={ onContainerKeyDown } onKeyUp={ handleContainerKeyUp } tabIndex="0" className="mental-flex--container">
            <div ref={ metaContainer } className="meta">
                <Score
                    type={ result }
                    finalScore={ !!finish }
                    dataFromSocket={ dataFromSocket }
                    setMaxBooster={ setMaxBooster }
                    setScore={ setScore }
                    gameName="MentalFlex"
                />
                <Result
                    type={ result }
                />
                <Clock
                    ultimate={ 90 }
                    shouldStart={ shouldStart }
                    setFinish={ setFinish }
                    gameSocket={ gameSocket }
                    isFromSocket={ isFromSocket }
                />
            </div>
            <ul className="mental-flex--colors">
                { info && <li ref={ liText } style={{ color: info.color }}>{ info.text }</li> }
            </ul>
            <Button
                btnOnClick={ btnOnClick }
                disabled={ !!finish }
            />
        </div>
    );
};

export default React.memo(MentalFlex);
