import io from "socket.io-client";
import getDeviceType from "./getDeviceType";

function pageViewSocketConnection() {
    const pageViewSocket = io.connect('http://127.0.0.1:4500/pageview', {transports: ['websocket'], upgrade: false});

    pageViewSocket.on('connect', () => {

    });

    pageViewSocket.on('visitorConnected', () => {
        // constructing data to send to pageview router for handling the visits statistics
        const data = {
            pageviewUrl: window.location.pathname,
            httpReferer: document.referrer,
            deviceType: getDeviceType()
        };

        fetch('/api/pageview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
            .then(res => {
                pageViewSocket.emit('viewData', res.data);
            });
    });

    return pageViewSocket;
}

export default pageViewSocketConnection;