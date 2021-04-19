// constants
const ONE_DAY = 1000 * 60 * 60 * 24;

function groupMessageDateFormatter(date) {
    const dateDiff = new Date() - new Date(date);
    if (dateDiff <= ONE_DAY) return 'TODAY';
    if (dateDiff <= (2 * ONE_DAY)) return 'YESTERDAY';
    return date.split(' ').slice(-3).join(' ');
}

export default groupMessageDateFormatter;