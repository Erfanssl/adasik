import React, { useState, useRef, useEffect, useMemo } from 'react';
import './MentalFlex.scss';
import Clock from "../Clock/Clock";
import Button from "../Button/Button";
import Result from "../Result/Result";
import Score from "../Score/Score";

// Colors
const BLUE = '#4949ff';
const PURPLE = '#cb1acb';

const data = [
    { id: 1, text: 'red', color: 'red', bool: true },
    { id: 2, text: 'red', color: BLUE, bool: false },
    { id: 3, text: 'blue', color: 'green', bool: false },
    { id: 4, text: 'blue', color: 'yellow', bool: false },
    { id: 5, text: 'purple', color: PURPLE, bool: true },
    { id: 6, text: 'blue', color: BLUE, bool: true },
    { id: 7, text: 'yellow', color: 'red', bool: false },
    { id: 8, text: 'green', color: 'green', bool: true },
    { id: 9, text: 'red', color: 'yellow', bool: false },
    { id: 10, text: 'green', color: 'yellow', bool: false },
    { id: 11, text: 'yellow', color: 'red', bool: false },
    { id: 12, text: 'blue', color: BLUE, bool: true },
    { id: 13, text: 'purple', color: 'yellow', bool: false },
    { id: 14, text: 'yellow', color: BLUE, bool: false }
];

const MentalFlex = ({ shouldStart, timer, handleResult, dataFromSocket, setMaxBooster, setScore, setGameName }) => {
    const [result, setResult] = useState(['']);
    const [randomNum, setRandomNum] = useState(randomNumFn());
    const [info, setInfo] = useState(data[randomNumFn()]);
    const [start, setStart] = useState(false);
    const [finish, setFinish] = useState(null);
    const [allowToChoose, setAllowToChoose] = useState(true);

    // Refs
    const container = useRef();
    const liText = useRef();
    const metaContainer = useRef();


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

        if (liText && liText.current) {
            liText.current.style.display = 'none';
            liText.current.style.opacity = '0';
            liText.current.style.transform = 'scale(0.5)';
        }

        setTimeout(() => {
            liText.current.style.display = 'block';
        }, 50);

         setTimeout(() => {
             liText.current.style.opacity = '1';
             liText.current.style.transform = 'scale(1)';
        }, 100);
    }, [randomNum]);

    useEffect(() => {
        if (timer <= 0) {
            // if (timerInterval) clearInterval(timerInterval);
            setFinish(true);
            setStart(false);
        }
    }, [timer]);

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

    function updateLi() {
        if (info) {
            const fn = () => <li ref={ liText } style={{ color: info.color, opacity: '0', transform: 'scale(0.5)' }}>{ info.text }</li>;
            return useMemo(fn, [info]);
        }
    }

    function update() {
        setRandomNum(randomNumFn());
    }

    function btnOnClick(e) {
        if (start && !finish) {
            const btnId = Number(e.target.dataset.id);
            let btnText;
            if (btnId === 1) btnText = 'no';
            else if (btnId === 2) btnText = 'yes';
            const res = checkTheAnswer(btnText);
            printResult(res);
            update();
        }
    }

    function onContainerKeyDown(e) {
        if (start && !finish) {
            let bool = false;

            if (e.keyCode === 37) bool = 'no';
            else if (e.keyCode === 39) bool = 'yes';

            if (bool && allowToChoose) {
                setAllowToChoose(false);
                const res = checkTheAnswer(bool);
                printResult(res);
                update();
            }
        }
    }

    function handleContainerKeyUp() {
        setAllowToChoose(true);
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
                    fast={ true }
                />
                <Clock
                    current={ 90 - timer }
                    ultimate={ 90 }
                />
            </div>
            <ul className="mental-flex--colors">
                { updateLi() }
            </ul>
            <Button
                btnOnClick={ btnOnClick }
                disabled={ !!finish }
            />
        </div>
    );
};

export default MentalFlex;