const http = require('http');
const https = require('https');

function makeRequest(url, method = 'GET', config = {}) {
    let p = url.split('://')[0];
    let protocol = p === 'https' ? https : http;

    if (typeof method !== 'string') {
        config = method;
        method = 'GET';
    }

    config.method = method.toUpperCase();

    return new Promise((resolve, reject) => {
        const req = protocol.request(url, config, res => {
            let data = '';

            res.on('data', d => {
                data += d;
            });

            res.on('end', () => {
                resolve(data.toString());
            });
        });

        req.on('error', err => {
            reject(err);
        });

        if (config.body) req.write(config.body);

        req.end();
    });
}

module.exports = makeRequest;