export default function partOfDay(hour) {
    let moment = '';

    if (hour >= 0) moment = 'Night';
    if (hour >= 5) moment = 'Morning';
    if (hour >= 12) moment = 'Noon';
    if (hour >= 16) moment = 'Afternoon';
    if (hour >= 19) moment = 'Evening';
    if (hour >= 21) moment = 'Night';

    return moment;
}