import io from "socket.io-client";
import getDeviceType from "./getDeviceType";
import getUserIP from "./getUserIP";

function pageViewSocketConnection() {
    const pageViewSocket = io.connect('/pageview', {transports: ['websocket'], upgrade: false});

    pageViewSocket.on('connect', () => {

    });

    pageViewSocket.on('visitorConnected', () => {
        // constructing data to send to pageview router for handling the visits statistics
        const data = {
            pageviewUrl: window.location.pathname,
            httpReferer: document.referrer,
            deviceType: getDeviceType()
        };

        getUserIP(ip => {
            if (!data.ip) {
                data.ip = ip;

                fetch('/api/pageview', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                    .then(res => res.json())
                    .then(res => {
                        pageViewSocket.emit('viewData', res.data);
                    });
            }
        });
    });

    return pageViewSocket;
}

export default pageViewSocketConnection;
