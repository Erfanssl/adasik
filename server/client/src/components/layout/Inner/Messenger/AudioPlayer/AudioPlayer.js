import React, { useState, useEffect, useRef } from 'react';
import './AudioPlayer.scss';
import Spinner from "../../../utils/Spinner/Spinner";

import play from '../../../../../assets/icons/play-audio.svg';
import pause from '../../../../../assets/icons/pause-audio.svg';

const AudioPlayer = ({ source, shouldStop }) => {
    // requestAnimationFrame();
    const [isFinish, setIsFinish] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audio, setAudio] = useState(null);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mousePosition, setMousePosition] = useState(-2);
    const [isMouseUp, setIsMouseUp] = useState(false);

    useEffect(() => {
        if (source) {
            let currentAudio = document.createElement('audio');
            currentAudio.preload = 'auto';
            currentAudio.src = source;

            currentAudio.oncanplaythrough = () => {
                setIsAudioReady(true);
                setAudio(currentAudio);
                setDuration(currentAudio.duration);
            };
        }
    }, []);

    useEffect(() => {
        if (shouldStop && shouldStop.length) {
            if (shouldStop[0] && audio) audio.pause();
        }
    }, [shouldStop]);

    useEffect(() => {
        let interval;
        if (!isAudioReady && source) {
            const currentAudio = new Audio();
            currentAudio.oncanplaythrough = () => {
                setIsAudioReady(true);
                setDuration(currentAudio.duration);
                setAudio(currentAudio);
            }
            interval = setInterval(() => {
                currentAudio.src = source;
            }, 1000);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isAudioReady]);

    // refs
    const progressBar = useRef();


    function handlePlayClick() {
        if (audio && !isPlaying) {
            audio.play();
            setIsPlaying(true);
        }
    }

    function handlePauseClick() {
        if (audio) audio.pause();
        setIsPlaying(false);
    }

    useEffect(() => {
        let loop;
        if (isPlaying) {
            const loopFn = () => {
                setTime(Number(audio.currentTime));
                if (audio.currentTime >= audio.duration) {
                    setIsFinish(true);
                    setIsPlaying(false);
                } else {
                    loop = requestAnimationFrame(loopFn);
                }
            };

            loop = requestAnimationFrame(loopFn);
        }

        return () => {
            cancelAnimationFrame(loop);
        };
    }, [isPlaying]);

    useEffect(() => {
        if (isFinish) {

        }
    }, [isFinish]);

    /* Helpers */
    function audioTimeFormatter(seconds) {
        const minute = ("00" + (Math.floor(seconds / 60).toString())).substr(-2);
        const second = ("00" + (seconds % 60).toString()).substr(-2);

        return `${ minute }:${ second }`;
    }

    /* End */

    function handleProgressBarMouseDown() {
        setIsMouseDown(true);
        setIsMouseUp(false);
    }

    function handleProgressBarMouseMove(e) {
        const mousePosition = e.clientX - progressBar.current.getClientRects()[0].x;
        setMousePosition(mousePosition);
    }

    function handleProgressBarMouseUp() {
        setIsMouseDown(false);
        setIsMouseUp(true);
    }

    useEffect(() => {
        if (isMouseDown) {
            setIsPlaying(false);
            audio.pause();
        }
    }, [isMouseDown]);

    useEffect(() => {
        if (isMouseDown && !isPlaying) {
            let elementWidth;
            if (progressBar?.current) elementWidth = progressBar.current.offsetWidth;
            const newTime = ((mousePosition / elementWidth) * duration);
            audio.currentTime = Number(newTime);
            setTime(Number(newTime));
        }
    }, [isMouseDown, isPlaying, mousePosition]);

    useEffect(() => {
        if (isMouseUp) {
            audio.play();
            setIsPlaying(true);
        }
    }, [isMouseUp]);

    return (
        <div
            className="messenger--audio-player__container"
        >
            {
                isAudioReady ?
                    <div className="messenger--audio-player__ready"
                    >
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                            <div className="audio--buttons">
                                {
                                    isPlaying ?
                                        <div className="pause--btn" onClick={ handlePauseClick }>
                                            <img src={ pause } alt="pause" />
                                        </div>
                                        :
                                        <div className="play--btn" onClick={ handlePlayClick }>
                                            <img src={ play } alt="play" />
                                        </div>
                                }
                            </div>
                            <div
                                className="progress-bar--container"
                                onMouseDown={ handleProgressBarMouseDown }
                                onMouseMove={ handleProgressBarMouseMove }
                                onMouseUp={ handleProgressBarMouseUp }
                                ref={ progressBar }
                            >
                                <div
                                    className="progress-bar--bg"
                                    style={{ width: `${ (time / duration) * 100 }%` }}
                                />
                                <div className="progress-bar--btn" style={{ left: `${ (time / duration) * 100 }%` }} />
                            </div>
                        </div>
                        <div className="time--container">
                            <p>{ audioTimeFormatter(time.toFixed(0)) } / { audioTimeFormatter(duration.toFixed(0)) }</p>
                        </div>
                    </div>
                    :
                    <div className="messenger--audio-player__not-ready">
                        <Spinner />
                    </div>
            }
        </div>
    );
};

export default React.memo(AudioPlayer);
