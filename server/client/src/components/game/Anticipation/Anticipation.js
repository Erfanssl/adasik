import React, { useState, useEffect, useRef } from 'react';
import './Anticipation.scss';
import Button from "../Button/Button";
import Clock from "../Clock/Clock";
import Result from "../Result/Result";
import Score from "../Score/Score";
import { blueCircle, blueRect, cyanSquare, diamond, greenCircle, simpleCircle1, simpleCircle2, violetSquare } from './shapes';

const data = [
    { id: 'one' },
    { id: 'two'},
    { id: 'three' },
    { id: 'four' },
    { id: 'five' },
    { id: 'six' },
    { id: 'seven' },
    { id: 'eight' },
];

const NUM = 7;

const Anticipation = ({ shouldStart, handleResult, dataFromSocket, setMaxBooster, setScore, setGameName, finish, setFinish, gameSocket, isFromSocket }) => {
    const [result, setResult] = useState(['']);
    const [start, setStart] = useState(false);
    const [bucketHolder, setBucketHolder] = useState({
        one: null,
        two: null,
        three: null,
        four: null,
        five: null,
        six: null,
        seven: null
    });
    const allowToChoose = useRef(true);

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
            if (window.innerWidth > 600) {
                shapeOne.current.style.transition = 'all .05s';
                shapeOne.current.style.transform = 'translateY(60%)';
                shapeOne.current.style.opacity = '0';

                setTimeout(() => {
                    updateBucket();
                }, 50);
            } else updateBucket();
        }
    }

    useEffect(() => {
        if (bucketHolder.one && shapeOne?.current) {
            shapeOne.current.classList.remove(shapeOne.current.classList[1]);
            shapeOne.current.classList.add(`shape--${ bucketHolder.one.id }`);

            shapeTwo.current.classList.remove(shapeTwo.current.classList[1]);
            shapeTwo.current.classList.add(`shape--${ bucketHolder.two.id }`);

            shapeThree.current.classList.remove(shapeThree.current.classList[1]);
            shapeThree.current.classList.add(`shape--${ bucketHolder.three.id }`);

            shapeFour.current.classList.remove(shapeFour.current.classList[1]);
            shapeFour.current.classList.add(`shape--${ bucketHolder.four.id }`);

            shapeFive.current.classList.remove(shapeFive.current.classList[1]);
            shapeFive.current.classList.add(`shape--${ bucketHolder.five.id }`);

            shapeSix.current.classList.remove(shapeSix.current.classList[1]);
            shapeSix.current.classList.add(`shape--${ bucketHolder.six.id }`);

            shapeSeven.current.classList.remove(shapeSeven.current.classList[1]);
            shapeSeven.current.classList.add(`shape--${ bucketHolder.seven.id }`);
        }

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

    function renderShapes() {
        return (
            <>
                { blueRect }
                { blueCircle}
                { greenCircle }
                { diamond }
                { simpleCircle1 }
                { cyanSquare }
                { violetSquare }
                { simpleCircle2 }
            </>
        );
    }

    function renderBuckets() {
        return (
            <>
                <div ref={ shapeOne } className="anticipation--shape-container">
                    { renderShapes() }
                </div>
                <div ref={ shapeTwo } className="anticipation--shape-container">
                    { renderShapes() }
                </div>
                <div ref={ shapeThree } className="anticipation--shape-container">
                    { renderShapes() }
                </div>
                <div ref={ shapeFour } className="anticipation--shape-container">
                    { renderShapes() }
                </div>
                <div ref={ shapeFive } className="anticipation--shape-container">
                    { renderShapes() }
                </div>
                <div ref={ shapeSix } className="anticipation--shape-container">
                    { renderShapes() }
                </div>
                <div ref={ shapeSeven } className="anticipation--shape-container">
                    { renderShapes() }
                </div>
            </>
        );
    }

    function onContainerKeyDown(e) {
        if (start && !finish) {
            let bool = false;

            if (e.keyCode === 37) bool = 'no';
            else if (e.keyCode === 39) bool = 'yes';

            if (bool && allowToChoose.current) {
                allowToChoose.current = false;
                const res = checkTheAnswer(bool);
                printResult(res);
                beforeUpdateBucket();
            }
        }
    }

    function handleContainerKeyUp() {
        allowToChoose.current = true;
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
                    ultimate={ 90 }
                    shouldStart={ shouldStart }
                    setFinish={ setFinish }
                    gameSocket={ gameSocket }
                    isFromSocket={ isFromSocket }
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

export default React.memo(Anticipation);
