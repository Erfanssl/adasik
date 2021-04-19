import React, { useRef } from 'react';
import './Clock.scss';

const Clock = ({ current, ultimate }) => {
    let now = (current / ultimate);
    if (current === 0) now = 0.00005;
    if (now >= 1) now = 1;
    let fill = (-90 * Math.PI / 180) - (Math.PI * 2 * now);
    let time = 90;
    let message = '';

    const canvas = useRef();
    let context;
    if (canvas && canvas.current) context = canvas.current.getContext('2d');

    if (context) {
        context.fillStyle = '#202039';
        context.lineWidth = 4;
        context.strokeStyle = 'white';
        context.beginPath();
        context.arc(130, 130, 120, 0, Math.PI * 2);
        // context.stroke();
        context.closePath();
        context.fill();

        context.beginPath();
        const gr = context.createRadialGradient(130, 130, 90, 130, 130, 50);

        if (current >= 80) {
            gr.addColorStop(0, '#6b021a');
            gr.addColorStop(1, '#a20c37');

        } else {
            gr.addColorStop(0, '#3d026b');
            gr.addColorStop(1, '#650ca2');
        }

        // gr.addColorStop(1, '#3d026b');
        context.fillStyle = gr;
        context.arc(130, 130, 90, 0, Math.PI * 2);
        // context.stroke();
        context.closePath();
        context.fill();

        context.beginPath();
        const gr2 = context.createRadialGradient(130, 130, 90, 130, 130, 160);
        gr2.addColorStop(0, '#067373');
        gr2.addColorStop(.1, '#0fe7e7');
        gr2.addColorStop(1, '#067373');
        context.strokeStyle = gr2;
        context.lineWidth = 28;
        context.arc(130, 130, 103.5, -90 * Math.PI / 180, fill);
        context.stroke();
        context.closePath();

        context.fillStyle = '#e7e7e7';
        context.font = '60px Roboto-Bold';
        time = ultimate - current;
        if (time <= 0) time = 0;
        message = time.toFixed(0);
        const textData = context.measureText(message);
        context.fillText(message, canvas.current.width / 2 - textData.width / 2 - 3, 150);
    }

    return (
        <div className="clock--container">
            <canvas width="270" height="270" ref={ canvas } id="clock--canvas"/>
        </div>
    );
};

export default Clock;