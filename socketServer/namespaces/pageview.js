const makeRequest = require('../utils/makeRequest');

async function onPageviewSocketConnect(socket) {
    let socketData;

    socket.emit('visitorConnected');

    socket.on('viewData', data => {
        socketData = data;
    });

    socket.on('disconnect', () => {
        if (socketData) {
            // constructing data
            const data = {
                isDisconnected: true,
                sessionJwt: socketData.pageViewSessionDataJwt,
                pageViewJwt: socketData.pageViewStayDataJwt
            };

            makeRequest('http://127.0.0.1:3000/api/pageview', 'post', {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
    });
}

module.exports = {
    onPageviewSocketConnect
};
