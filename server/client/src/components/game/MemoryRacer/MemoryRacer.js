import React, { useState, useEffect, useRef } from 'react';
import './MemoryRacer.scss';
import Button from "../Button/Button";
import Clock from "../Clock/Clock";
import Result from "../Result/Result";
import Score from "../Score/Score";


const circle = (
    <svg className="shape--one" width="512" height="512">
        <path fill='#2EA2EF' d="M256,0v512c141.385,0,256-114.615,256-256S397.385,0,256,0z"/>
        <path fill='#54BBFF' d="M470.793,256C470.793,114.615,374.626,0,256,0C114.615,0,0,114.615,0,256s114.615,256,256,256 C374.626,512,470.793,397.385,470.793,256z"/>
    </svg>
);

const triangle = (
    <svg className="shape--two" height="512" width="512">
        <g>
            <path d="m248.753 45.31-247.537 412.692c-3.376 5.629.68 12.788 7.247 12.788h495.074c6.566 0 10.623-7.159 7.247-12.788l-247.538-412.692c-3.281-5.47-11.212-5.47-14.493 0z" fill="#c2bce0"/>
            <path d="m510.891 466.507-123.665-70.014-131.227-226.985v-128.298c2.788 0 5.587 1.351 7.235 4.075l247.647 412.882c1.584 2.776 1.394 5.89.01 8.34z" fill="#8379c1"/>
            <path d="m510.881 458.167-247.647-412.882c-1.648-2.724-4.446-4.075-7.235-4.075v43.539l215.654 359.543 39.238 22.215c1.384-2.45 1.574-5.564-.01-8.34z" fill="#6e61b6"/>
            <path d="m510.891 466.507c-1.415 2.491-4.066 4.286-7.351 4.286h-495.082c-3.285 0-5.936-1.795-7.351-4.286l124.077-70.246 262.042.232z" fill="#978ecb"/>
            <path d="m467.029 441.674c-.001.001-40.142 29.119-43.427 29.119h79.938c3.285 0 5.935-1.795 7.351-4.286z" fill="#8379c1"/>
            <path d="m109.259 401.055 143.117-238.603c1.641-2.735 5.606-2.735 7.247 0l143.117 238.603c1.688 2.815-.34 6.394-3.623 6.394h-286.235c-3.283 0-5.311-3.58-3.623-6.394z" fill="#aca6d6"/>
        </g>
    </svg>
);

const cir = (
    <svg className="shape--three" height="512" width="512">
        <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="255.994" x2="255.994" y1="511.988" y2="0">
            <stop offset="0" stopColor="#a93aff"/>
            <stop offset="1" stopColor="#ff81ff"/>
        </linearGradient>
        <path d="m480.546 141.58c-48.325-108.3-169.167-164.412-285.748-132.83-118.021 32.692-197.669 145.434-182.003 270.863 14.818 129.099 124.692 228.082 255.113 232.367.163.005.327.008.491.008.003 0 3.8-.002 3.8-.002.208 0 .416-.004.624-.013 33.076-1.394 58.852-29.437 57.458-62.513-1.396-33.156-29.353-58.848-62.512-57.459-75.752 3.188-143.933-51.485-158.622-127.181-.011-.054-.021-.108-.032-.162-16.095-78.305 29.406-155.841 108.192-184.386 82.946-29.329 173.852 6.211 216.17 84.518.019.034.037.068.056.102 44.404 80.67 21.635 180.538-54.143 237.464-6.446 4.843-7.911 13.917-3.315 20.542s13.604 8.433 20.402 4.091c46.342-29.612 80.297-74.731 95.612-127.047 15.259-52.125 11.161-108.362-11.543-158.362z" fill="url(#SVGID_1_)"/>
    </svg>
);

const rect = (
    <svg className="shape--four" height="512" width="512">
        <path fill="#615AD3" d="M407,76H105C47.109,76,0,123.109,0,181v150c0,57.891,47.109,105,105,105h302c57.891,0,105-47.109,105-105V181C512,123.109,464.891,76,407,76z"/>
        <path fill="#615AD3" d="M407,76H255v360h152c57.891,0,105-47.109,105-105V181C512,123.109,464.891,76,407,76z"/>
    </svg>
);

const cirTw = (
    <svg className="shape--five" height="512" width="512">
        <linearGradient id="a" gradientTransform="matrix(1 0 0 -1 0 -14446)" gradientUnits="userSpaceOnUse" x1="0" x2="512" y1="-14702" y2="-14702">
            <stop offset="0" stopColor="#00f38d"/>
            <stop offset="1" stopColor="#009eff"/>
        </linearGradient>
        <path d="m512 256c0 141.386719-114.613281 256-256 256s-256-114.613281-256-256 114.613281-256 256-256 256 114.613281 256 256zm0 0" fill="url(#a)"/>
        <g fill="#fff">
            <path d="m256 56c-110.28125 0-200 89.542969-200 199.609375v.78125c0 110.066406 89.71875 199.609375 200 199.609375s200-89.542969 200-199.609375v-.78125c0-110.066406-89.71875-199.609375-200-199.609375zm170 200.390625c0 93.523437-76.261719 169.609375-170 169.609375s-170-76.085938-170-169.609375v-.78125c0-93.523437 76.261719-169.609375 170-169.609375s170 76.085938 170 169.609375zm0 0"/>
            <path d="m256 157.90625c-53.65625 0-97.308594 43.652344-97.308594 97.3125 0 53.652344 43.652344 97.308594 97.308594 97.308594s97.308594-43.65625 97.308594-97.3125-43.652344-97.308594-97.308594-97.308594zm0 164.617188c-37.113281 0-67.308594-30.195313-67.308594-67.308594 0-37.113282 30.195313-67.308594 67.308594-67.308594s67.308594 30.195312 67.308594 67.308594c0 37.117187-30.195313 67.308594-67.308594 67.308594zm0 0"/>
        </g>
    </svg>
);

const poly = (
    <svg className="shape--six" height="512" width="512">
        <path fill="#615AD3" d="M121.978,473.441C124.644,478.114,129.624,481,135,481h242c5.376,0,10.356-2.886,13.022-7.559 l120-210c2.637-4.614,2.637-10.269,0-14.883l-120-210C387.356,33.886,382.376,31,377,31H135c-5.376,0-10.356,2.886-13.022,7.559 l-120,210c-2.637,4.614-2.637,10.269,0,14.883L121.978,473.441z"/>
    </svg>
);

const data = [
    { id: 'one' },
    { id: 'two' },
    { id: 'three' },
    { id: 'four' },
    { id: 'five' },
    { id: 'six' },
];

const MemoryRacer = ({ shouldStart, handleResult, dataFromSocket, setMaxBooster, setScore, setGameName, finish, setFinish, gameSocket, isFromSocket }) => {
    // State
    const [result, setResult] = useState(['']);
    const [info, setInfo] = useState(() => [undefined, data[randomNum()]]);
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [start, setStart] = useState(false);

    // Refs
    const container = useRef();
    const shape = useRef();
    const metaContainer = useRef();

    const allowToChoose = useRef(true);
    const allowToChooseInterval = useRef(true);

    // generate a random number based on the length of the data
    function randomNum() {
        return Math.floor(Math.random() * data.length);
    }

    useEffect(() => {
        if (shouldStart) {
            setStart(true);
            setTimeout(() => {
                beforeUpdate();
                setBtnDisabled(false);
            }, 1500);

            // To focus on the main container to make the keydown listener working
            if (container && container.current) container.current.focus();
        }
    }, [shouldStart]);

    useEffect(() => {
        document.title = 'Adasik - Memory Racer';
        if (setGameName) setGameName('MemoryRacer');
    }, []);

    useEffect(() => {
        if (finish) setBtnDisabled(true);
    }, [finish]);

    // to perform entering animation whenever our info array changes
    useEffect(() => {
        beforeRender();
    }, [info]);

    function renderShape() {
        return (
            <div ref={ shape } className="memory-racer--shape-container">
                { circle }
                { triangle }
                { cir }
                { cirTw }
                { rect }
                { poly }
            </div>
        );
    }

    // update function for updating the main place for showing shapes
    function update() {
        const newShape = data[randomNum()];
        const newInfo = [info[1], newShape];
        if (shape && shape.current) {
            if (shape.current.classList[1]) shape.current.classList.remove(shape.current.classList[1]);
            shape.current.classList.add(`shape--${ newShape.id }`);
        }
        setInfo(newInfo);
    }

    // to preform exiting animation
    function beforeUpdate() {
        if (shape && shape.current) {
            shape.current.style.transform = 'translateX(-30%)';
            shape.current.style.opacity = '0';
        }

        setTimeout(() => {
            shape.current.style.transform = 'translateX(30%)';
        }, 50);

        setTimeout(() => {
            update();
        }, 100);
    }

    // to perform entering animation
    function beforeRender() {
        if (shape && shape.current) {
            shape.current.style.transform = 'translateX(0)';
            shape.current.style.opacity = '1';
            if (!info[0]) shape.current.classList.add(`shape--${ info[1].id }`);
        }
    }

    function checkTheAnswer(answer) {
        if (info[0]) {
            return answer === 'yes' ? info[0].id === info[1].id : info[0].id !== info[1].id;
        }
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

    // button click handler
    function btnOnClick(e) {
        if (start && !finish && allowToChooseInterval?.current) {
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
            }, 150);
        }
    }

    // key down handler
    function onContainerKeyDown(e) {
        if (!btnDisabled) {
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
                }, 150);
            }
        }
    }

    function handleContainerKeyUp() {
        allowToChoose.current = true;
    }

    return (
        <div ref={ container } tabIndex="0" onKeyDown={ onContainerKeyDown } onKeyUp={ handleContainerKeyUp } className="memory-racer--container">
            <div ref={ metaContainer } className="meta">
                <Score
                    type={ result }
                    finalScore={ !!finish }
                    dataFromSocket={ dataFromSocket }
                    setMaxBooster={ setMaxBooster }
                    setScore={ setScore }
                    gameName="MemoryRacer"
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
            { renderShape() }
            <Button
                btnOnClick={ btnOnClick }
                disabled={ btnDisabled }
                delay={ 1500 }
            />
        </div>
    );
};

export default React.memo(MemoryRacer);
