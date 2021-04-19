import React, { useRef, useEffect } from 'react';
import wrongIcon from '../../../assets/cross.svg';
import rightIcon from '../../../assets/check.svg';
import rightAudio from '../../../assets/audio/true.mp3';
import wrongAudio from '../../../assets/audio/false.mp3';
import './Result.scss';


const Result = ({ type, fast = false }) => {

    const rightAudioTrack = new Audio();
    rightAudioTrack.src = rightAudio;
    rightAudioTrack.volume = .065;

    const wrongAudioTrack = new Audio();
    wrongAudioTrack.src = wrongAudio;
    wrongAudioTrack.volume = .18;

    const rightRef = useRef();
    const wrongRef = useRef();
    const shape = useRef();

    useEffect( () => {
        if (type[0] === 'right') {
            rightAudioTrack.addEventListener('canplaythrough', async () => {
                await rightAudioTrack.play();
            });
        }

        if (shape && shape.current) {
            shape.current.style.opacity = '1';
            shape.current.style.transform = 'scale(1) translateY(-70%)';

            if (fast) {
                setTimeout(() => {
                    shape.current.style.opacity = '0';
                    shape.current.style.transform = 'scale(.8) translateY(-70%)';
                }, 100);
            } else {
                setTimeout(() => {
                    shape.current.style.opacity = '0';
                    shape.current.style.transform = 'scale(.8) translateY(-70%)';
                }, 200);
            }
        }

        if (type[0] === 'wrong') {
            wrongAudioTrack.addEventListener('canplaythrough', async () => {
                await wrongAudioTrack.play();
            });
        }
    }, [type]);

    function renderResult() {
        if (type[0] === 'right') {
            return (
                <>
                    <div ref={ shape } className="result--icon-container result--icon-container__right">
                        <img ref={ rightRef } src={ rightIcon } alt="correct" />
                    </div>
                </>
            );
        } else if (type[0] === 'wrong') {
            return (
                <>
                    <div ref={ shape } className="result--icon-container result--icon-container__wrong">
                        <img ref={ wrongRef } src={ wrongIcon } alt="wrong" />
                    </div>
                </>
            );
        }

        return <div ref={ shape } className="result--icon-container" />;
    }

    return (
        <div className="result">
            { renderResult() }
        </div>
    );
};

export default Result;