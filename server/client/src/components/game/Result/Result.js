import React, { useState, useRef, useEffect } from 'react';
import rightAudio from '../../../assets/audio/true.mp3';
import wrongAudio from '../../../assets/audio/false.mp3';
import { rightIcon, wrongIcon } from './shapes';
import './Result.scss';

const Result = ({ type }) => {
    const [rightAudioTrack, setRightAudioTrack] = useState('');
    const [wrongAudioTrack, setWrongAudioTrack] = useState('');

    useEffect(() => {
        const rightAudioTrackMain = new Audio();
        rightAudioTrackMain.src = rightAudio;
        rightAudioTrackMain.volume = .065;

        rightAudioTrackMain.addEventListener('canplaythrough', async () => {
            setRightAudioTrack(rightAudioTrackMain);
        });

        const wrongAudioTrackMain = new Audio();
        wrongAudioTrackMain.src = wrongAudio;
        wrongAudioTrackMain.volume = .18;

        wrongAudioTrackMain.addEventListener('canplaythrough', async () => {
            setWrongAudioTrack(wrongAudioTrackMain);
        });
    }, []);

    const shape = useRef();

    useEffect( async () => {
        if (type[0] === 'right') {
            if (rightAudioTrack) {
                await rightAudioTrack.pause();
                rightAudioTrack.currentTime = 0;
                await rightAudioTrack.play();
            }

            if (shape && shape.current) {
                shape.current.classList.remove('wrong');
                shape.current.classList.add('right');
                setTimeout(() => {
                    shape.current.classList.remove('right');
                }, 200);
            }
        }

        if (type[0] === 'wrong') {
            if (wrongAudioTrack) {
                await wrongAudioTrack.pause();
                wrongAudioTrack.currentTime = 0;
                await wrongAudioTrack.play();
            }

            if (shape && shape.current) {
                shape.current.classList.remove('right');
                shape.current.classList.add('wrong');
                setTimeout(() => {
                    shape.current.classList.remove('wrong');
                }, 200);
            }
        }
    }, [type]);

    return (
        <div className="result">
            <div ref={ shape } className="result--icon-container">
                { rightIcon }
                { wrongIcon }
            </div>
        </div>
    );
};

export default React.memo(Result);
