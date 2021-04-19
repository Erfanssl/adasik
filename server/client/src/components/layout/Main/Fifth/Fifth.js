import React, { useState, useEffect, useRef } from 'react';
import './Fifth.scss';
import brain from '../../../../assets/brain-char.svg';

const Fifth = () => {
    // state
    const [shouldChange, setShouldChange] = useState(false);
    const [shouldChangeTwo, setShouldChangeTwo] = useState(false);

    // refs
    const shape1 = useRef();
    const shape2 = useRef();
    const shape3 = useRef();
    const shape4 = useRef();
    const shape5 = useRef();
    const shape6 = useRef();
    const shape7 = useRef();

    const shape2_1 = useRef();
    const shape2_2 = useRef();
    const shape2_3 = useRef();
    const shape2_4 = useRef();
    const shape2_5 = useRef();
    const shape2_6 = useRef();
    const shape2_7 = useRef();

    window.onscroll = () => {
        if ((window.innerHeight > 500 && scrollY >= 2050 && scrollY <= 3105) || (window.innerHeight <= 500 && scrollY >= 4050 && scrollY <= 4105)) {
            if (!shouldChange) setShouldChange(true);
        } else {
            if (shouldChange) setShouldChange(false);
        }

        if ((window.innerHeight > 500 && scrollY >= 2384 && scrollY <= 3400) || (window.innerHeight <= 500 && scrollY >= 3357 && scrollY <= 3857)) {
            if (!shouldChangeTwo) setShouldChangeTwo(true);
        } else {
            if (shouldChangeTwo) setShouldChangeTwo(false);
        }
    };

    useEffect(() => {
        if (shouldChange) {
            shape1.current.style.transform = 'scale(1)';
            shape2.current.style.transform = 'scale(1)';
            shape3.current.style.transform = 'scale(1)';
            shape4.current.style.transform = 'scale(1)';
            shape5.current.style.transform = 'scale(1)';
            shape6.current.style.transform = 'scale(1)';
            shape7.current.style.transform = 'scale(1)';
        } else {
            shape1.current.style.transform = 'scale(0)';
            shape2.current.style.transform = 'scale(0)';
            shape3.current.style.transform = 'scale(0)';
            shape4.current.style.transform = 'scale(0)';
            shape5.current.style.transform = 'scale(0)';
            shape6.current.style.transform = 'scale(0)';
            shape7.current.style.transform = 'scale(0)';
        }
    }, [shouldChange]);

    useEffect(() => {
        if (shouldChangeTwo) {
            shape2_1.current.style.transform = 'scale(1)';
            shape2_2.current.style.transform = 'scale(1)';
            shape2_3.current.style.transform = 'scale(1)';
            shape2_4.current.style.transform = 'scale(1)';
            shape2_5.current.style.transform = 'scale(1)';
            shape2_6.current.style.transform = 'scale(1)';
            shape2_7.current.style.transform = 'scale(1)';
        } else {
            shape2_1.current.style.transform = 'scale(0)';
            shape2_2.current.style.transform = 'scale(0)';
            shape2_3.current.style.transform = 'scale(0)';
            shape2_4.current.style.transform = 'scale(0)';
            shape2_5.current.style.transform = 'scale(0)';
            shape2_6.current.style.transform = 'scale(0)';
            shape2_7.current.style.transform = 'scale(0)';
        }
    }, [shouldChangeTwo]);

    return (
        <div className="fifth--container">
            <h2>Different Categories, Different Strengths</h2>
            <div className="fifth--shape-container">
                <div className="fifth--shape__outside">
                    <div ref={ shape1 } className="fifth--shape__first-container">
                        <div className="fifth--shape__first-item">
                            <p>Calculation</p>
                        </div>
                    </div>
                    <div ref={ shape2 } className="fifth--shape__second-container">
                        <div className="fifth--shape__second-item">
                            <p>Analysis</p>
                        </div>
                    </div>
                    <div ref={ shape3 } className="fifth--shape__third-container">
                        <div className="fifth--shape__third-item">
                            <p>Logic</p>
                        </div>
                    </div>
                    <div ref={ shape4 } className="fifth--shape__fourth-container">
                        <div className="fifth--shape__fourth-item">
                            <p>Communication</p>
                        </div>
                    </div>
                    <div ref={ shape5 } className="fifth--shape__fifth-container">
                        <div className="fifth--shape__fifth-item">
                            <p>Emotions</p>
                        </div>
                    </div>
                    <div ref={ shape6 } className="fifth--shape__sixth-container">
                        <div className="fifth--shape__sixth-item">
                            <p>Intuition</p>
                        </div>
                    </div>
                    <div ref={ shape7 } className="fifth--shape__seventh-container">
                        <div className="fifth--shape__seventh-item">
                            <p>Creativity</p>
                        </div>
                    </div>
                </div>
                <div className="fifth--shape__inside">
                    <div className="fifth--inside__circle">
                        <img src={ brain } alt="brain"/>
                        <div className="fifth--inside__image-shadow" />
                    </div>
                </div>
            </div>
            <div className="fifth--shape__outside--two">
                <div ref={ shape2_1 } className="outside--shape__item">
                    <p>Calculation</p>
                </div>
                <div ref={ shape2_2 } className="outside--shape__item">
                    <p>Analysis</p>
                </div>
                <div ref={ shape2_3 } className="outside--shape__item">
                    <p>Logic</p>
                </div>
                <div ref={ shape2_4 } className="outside--shape__item">
                    <p>Communication</p>
                </div>
                <div ref={ shape2_5 } className="outside--shape__item">
                    <p>Emotions</p>
                </div>
                <div ref={ shape2_6 } className="outside--shape__item">
                    <p>Intuition</p>
                </div>
                <div ref={ shape2_7 } className="outside--shape__item">
                    <p>Creativity</p>
                </div>
            </div>
        </div>
    );
};

export default Fifth;