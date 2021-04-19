// constants
const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_MINUTE = 1000 * 60;

function timePastFormatter(date) {
    const dateDiff = new Date() - new Date(date);
    // One day
    if (dateDiff <= ONE_MINUTE / 2) return 'just now';
    if (dateDiff <= ONE_MINUTE) return 'moment ago';
    if (dateDiff <= (2 * ONE_MINUTE)) return 'a minute ago';
    if (dateDiff <= (60 * ONE_MINUTE)) return `${ (dateDiff / ONE_MINUTE).toFixed(0) } minutes ago`;
    if (dateDiff <= (24 * 60 * ONE_MINUTE)) return `${ (dateDiff / (60 * ONE_MINUTE)).toFixed(0) } hours ago`;
    // Two days aka yesterday
    if (dateDiff <= (2 * ONE_DAY)) return 'yesterday';
    // more aka the actual date
    return new Date(date).toDateString().split(' ').slice(-3).join(' ');
}

export default timePastFormatter;