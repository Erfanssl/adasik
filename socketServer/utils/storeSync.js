const store = require('./store');

function storeSync(property, fn) {
    let interval;

    if (!store[property]) {
        interval = setInterval(() => {
            if (store[property] && store[property] !== 'none') {
                fn();
                clearInterval(interval);
            } else if (store[property] && store[property] === 'none') {
                clearInterval(interval);
            }
        }, 100);
    } else if (store[property] && store[property] !== 'none') {
        fn();
    }
}

module.exports = storeSync;