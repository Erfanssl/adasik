import React, { useRef } from 'react';
import './Second.scss';
import Connections from "../../utils/Connections/Connections";
import Circle from "./Circle/Circle";
import laptop from '../../../../assets/laptop-new.png';

import anticipation from '../../../../assets/anticipation.svg';
import memoryRacer from '../../../../assets/memory-racer.svg';
import mentalFlex from '../../../../assets/mental-flex.svg';

const Second = () => {
    const container = useRef();
    const container2 = useRef();

    return (
        <div className="second-container" id="second-container">
            <div className="second--image-container">
                <div ref={ container } className="second--image-bg">
                    <Connections
                        cont={ container }
                        small={ true }
                    />
                </div>
                <div className="second--circle-container">
                    <Circle>
                        <img src={ anticipation } alt="Anticipation" />
                    </Circle>
                    <Circle>
                        <img src={ memoryRacer } alt="Memory Racer" />
                    </Circle>
                    <Circle>
                        <img src={ mentalFlex } alt="Mental Flex" />
                    </Circle>
                </div>
                <img src={ laptop } alt="laptop" />
            </div>
            <div className="second--text-container">
                <h2 className="second--text__header">
                    Games Backed by Science
                </h2>
                <div className="second--image-container--two">
                    <div ref={ container2 } className="second--image-bg">
                        <Connections
                            cont={ container2 }
                            small={ true }
                        />
                    </div>
                    <div className="second--circle-container">
                        <Circle>
                            <img src={ anticipation } alt="Anticipation" />
                        </Circle>
                        <Circle>
                            <img src={ memoryRacer } alt="Memory Racer" />
                        </Circle>
                        <Circle>
                            <img src={ mentalFlex } alt="Mental Flex" />
                        </Circle>
                    </div>
                    <img src={ laptop } alt="laptop" />
                </div>
                <div className="second--text__main">
                    <p>
                        We won't waste your time!
                    </p>
                    <p>
                        We have two teams: Scientific and Technological.
                    </p>
                    <p>
                        Our scientific team uses the leading researches and works with our technological team to make games
                        that are backed by science
                        and give you tool to know yourself better.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Second;
