function textCutter(text, length = 20) {
    if (text?.length > 20) return text.substr(0, length) + '...';
    return text;
}

export default textCutter;