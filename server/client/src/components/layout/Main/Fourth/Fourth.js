import React from 'react';
import './Fourth.scss';
import messenger from '../../../../assets/messenger.svg';

const Fourth = () => {
    return (
        <div className="fourth--container">
            <div className="fourth--left-side">
                <svg style={{ transform: 'scale(.9) translateX(5.5%)' }} version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 1000 1470">
                    <linearGradient id="fourth--svg__gr" gradientUnits="userSpaceOnUse" x1="499.7742" y1="1396.9193" x2="499.7742" y2="11.8453">
                        {/*<stop  offset="0" style={{ stopColor: '#000000' }} />*/}
                        {/*<stop  offset="0.2412" style={{ stopColor: '#000000' }} />*/}
                        {/*<stop  offset="0.3742" style={{ stopColor: '#000000' }} />*/}
                        {/*<stop  offset="0.5326" style={{ stopColor: '#000000' }} />*/}
                        {/*<stop  offset="0.7893" style={{ stopColor: '#000000' }} />*/}
                        {/*<stop  offset="1" style={{ stopColor: '#000000' }} />*/}
                        {/*<stop  offset="0" style={{ stopColor: '#FF3F00' }} />*!/*/}
                        {/*<stop  offset="0.2412" style={{ stopColor: '#CF3601' }} />*/}
                        {/*<stop  offset="0.3742" style={{ stopColor: '#B93201' }} />*/}
                        {/*<stop  offset="0.5326" style={{ stopColor: '#AC2F01' }} />*/}
                        {/*<stop  offset="0.7893" style={{ stopColor: '#9D2C00' }} />*/}
                        {/*<stop  offset="1" style={{ stopColor: '#982B00' }} />*/}

                        <stop  offset="0" style={{ stopColor: '#55EFC4' }} />
                        <stop  offset="0.2412" style={{ stopColor: '#288069' }} />
                        <stop  offset="0.3742" style={{ stopColor: '#136e54' }} />
                        <stop  offset="0.5326" style={{ stopColor: '#064130' }} />
                        <stop  offset="1" style={{ stopColor: '#000000' }} />

                    </linearGradient>
                    <path
                        fill="url(#fourth--svg__gr)"
                        d="M0,49l946,542l1.43,0.86c5.71,3.43,11.25,7.15,16.57,11.14l0,0l1.72,1.34c4.84,3.76,9.29,8.01,13.28,12.66l0,0
	                    l0,0c2.66,3.33,5.06,6.86,7.18,10.56L987,629l4,9l0.45,1.35c1.7,5.09,2.88,10.33,3.55,15.65l0,0c0,0,2,15,0,24s-23,88-23,88l-50,190
	                    l-35,133l0,0c-1.33,5.99-3.19,11.85-5.55,17.51L880,1111l-8,15l-5,8l-6,8l-0.44,0.48c-6.37,7-13.24,13.52-20.56,19.52l0,0l-6,4l0,0
	                    c-5.99,3.99-12.28,7.53-18.8,10.57L810,1179l-249,76l-185,55l-194,59L0,1423"
                    />
                </svg>
                <div className="fourth--left__message-img">
                    <img src={ messenger } alt="communication"/>
                </div>
            </div>
            <div className="fourth--right-side">
                <h2 className="fourth--right__header">Interact with Other Players</h2>
                <div className="fourth--left__message-img--two">
                    <img src={ messenger } alt="communication"/>
                </div>
                <div className="fourth--right__text">
                    <p>The true sense of playing games, comes when you challenge the others and get in touch with them; When sharing your results with your friends and encourage each other to become better.</p>
                    <p>Here you can challenge other players, chat with them, follow them and see their results and of course, make friends.</p>
                </div>
            </div>
        </div>
    );
};

export default Fourth;