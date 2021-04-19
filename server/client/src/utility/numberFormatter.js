function numberFormatter(num) {
    let negative = false;
    if (Number(num) < 0) negative = true;
    let arr;

    if (negative) arr = Number(num).toString().split('').slice(1);
    else arr = Number(num).toString().split('');

    const holder = [];
    let counter = 0;

    while (arr.length) {
        holder.unshift(arr.pop());
        counter++;
        if (counter >= 3) {
            holder.unshift(',');
            counter = 0;
        }
    }

    const result = holder.join('').replace(/(^,|,$)/g, '');

    if (negative) return '-' + result;

    return result;
}

export default numberFormatter;