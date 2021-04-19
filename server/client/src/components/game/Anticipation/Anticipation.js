import React, { useState, useEffect, useRef } from 'react';
import './Anticipation.scss';
import Button from "../Button/Button";
import Clock from "../Clock/Clock";
import Result from "../Result/Result";
import Score from "../Score/Score";

import blueRect from '../../../assets/blue-3D-rectangle.svg';
import blueCircle from '../../../assets/blue-circle.svg';
import greenCircle from '../../../assets/Button-Green.svg';
import colorfulCircle from '../../../assets/Colorful-lines.svg';
import diamond from '../../../assets/Diamond-card-sign.svg';
import cyanSquare from '../../../assets/Gloss-cyan-square.svg';
import violetSquare from '../../../assets/Gloss-violet-square.svg';


const data = [
    { id: 1, shape: blueRect },
    { id: 2, shape: blueCircle },
    { id: 3, shape: greenCircle },
    { id: 4, shape: diamond },
    { id: 5, shape: colorfulCircle },
    { id: 6, shape: cyanSquare },
    { id: 7, shape: violetSquare },
];

const NUM = 7;

const Anticipation = ({ shouldStart, timer, handleResult, dataFromSocket, setMaxBooster, setScore, setGameName }) => {
    const [result, setResult] = useState(['']);
    // const [resId, setResId] = useState(1);
    const [start, setStart] = useState(false);
    const [finish, setFinish] = useState(null);
    const [bucketHolder, setBucketHolder] = useState({
        one: null,
        two: null,
        three: null,
        four: null,
        five: null,
        six: null,
        seven: null
    });
    const [allowToChoose, setAllowToChoose] = useState(true);

    // Refs
    const container = useRef();
    const shapeOne = useRef();
    const shapeTwo = useRef();
    const shapeThree = useRef();
    const shapeFour = useRef();
    const shapeFive = useRef();
    const shapeSix = useRef();
    const shapeSeven = useRef();
    const bucketContainer = useRef();
    const metaContainer = useRef();

    useEffect(() => {
        document.title = 'Adasik - Anticipation';
       shapeBucket(NUM);
        if (setGameName) setGameName('Anticipation');
    }, []);

    useEffect(() => {
        if (shouldStart) {
            setStart(true);
            if (container && container.current) container.current.focus();
        }
    }, [shouldStart]);

    useEffect(() => {
        if (timer <= 0) {
            setFinish(true);
            setStart(false);
        }
    }, [timer]);

    function randomNum() {
        return Math.floor(Math.random() * data.length);
    }

    function shapeBucket(num) {
        const bucket = [];

        for (let i = 0; i < num; i++) {
            bucket.push(data[randomNum()]);
        }

        setBucketHolder({
            one: bucket[0],
            two: bucket[1],
            three: bucket[2],
            four: bucket[3],
            five: bucket[4],
            six: bucket[5],
            seven: bucket[6],
        });
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

    function checkTheAnswer(answer) {
        answer = answer === 'yes';
        const doesMatch = bucketHolder.one.id === bucketHolder.two.id;

        return doesMatch === answer;
    }

    function beforeUpdateBucket() {
        if (shapeOne?.current) {
            shapeOne.current.style.transition = 'all .1s';
            shapeOne.current.style.transform = 'translateY(120%)';
            shapeOne.current.style.opacity = '0';

            setTimeout(() => {
                updateBucket();
            }, 100);
        }
    }

    useEffect(() => {
        // if (bucketHolder.seven) {
        //     setTimeout(() => {
        //         shapeSeven.current.style.transition = 'all .1s';
        //         shapeSeven.current.style.transform = 'translateY(0)';
        //         shapeSeven.current.style.opacity = '1';
        //     }, 10);
        // }

        return () => {
            if (bucketHolder.one && shapeOne?.current) {
                shapeOne.current.style.transition = 'none';
                shapeOne.current.style.transform = 'translateY(0)';
                shapeOne.current.style.opacity = '1';
            }
        };
    }, [bucketHolder]);

    function updateBucket() {
        const tail = data[randomNum()];

        setBucketHolder(b => {
            return {
                one: b.two,
                two: b.three,
                three: b.four,
                four: b.five,
                five: b.six,
                six: b.seven,
                seven: tail
            }
        });
    }

    function btnOnClick(e) {
        if (start && !finish) {
            const btnId = Number(e.target.dataset.id);
            let btnText;
            if (btnId === 1) btnText = 'no';
            else if (btnId === 2) btnText = 'yes';
            const res = checkTheAnswer(btnText);
            printResult(res);
            beforeUpdateBucket();
        }
    }

    function renderBuckets() {
        return (
            <>
                <div ref={ shapeOne } className="anticipation--shape-container">
                    <img src={ bucketHolder.one.shape } alt="shape" />
                </div>
                <div ref={ shapeTwo } className="anticipation--shape-container">
                    <img src={ bucketHolder.two.shape } alt="shape" />
                </div>
                <div ref={ shapeThree } className="anticipation--shape-container">
                    <img src={ bucketHolder.three.shape } alt="shape" />
                </div>
                <div ref={ shapeFour } className="anticipation--shape-container">
                    <img src={ bucketHolder.four.shape } alt="shape" />
                </div>
                <div ref={ shapeFive } className="anticipation--shape-container">
                    <img src={ bucketHolder.five.shape } alt="shape" />
                </div>
                <div ref={ shapeSix } className="anticipation--shape-container">
                    <img src={ bucketHolder.six.shape } alt="shape" />
                </div>
                <div ref={ shapeSeven } className="anticipation--shape-container">
                    <img src={ bucketHolder.seven.shape } alt="shape" />
                </div>
            </>
        );
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
                beforeUpdateBucket();
            }
        }
    }

    function handleContainerKeyUp() {
        setAllowToChoose(true);
    }

    return (
        <div ref={ container } onKeyDown={ onContainerKeyDown } onKeyUp={ handleContainerKeyUp } tabIndex="0" className="anticipation--container">
            <div ref={ metaContainer } className="meta">
                <Score
                    type={ result }
                    finalScore={ !!finish }
                    dataFromSocket={ dataFromSocket }
                    setMaxBooster={setMaxBooster }
                    setScore={ setScore }
                    gameName="Anticipation"
                />
                <Result
                    type={ result }
                />
                <Clock
                    current={ 90 - timer }
                    ultimate={ 90 }
                />
            </div>
            <div ref={ bucketContainer } className="anticipation--bucket-container">
                { bucketHolder.one && renderBuckets() }
            </div>
            <Button
                btnOnClick={ btnOnClick }
                disabled={ !!finish }
            />
        </div>
    );
};

export default Anticipation;