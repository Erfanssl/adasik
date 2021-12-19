function textCutter(text, length = 20) {
    if (text?.length >= length) return text.substr(0, length - 3) + '...';
    return text;
}

export default textCutter;
