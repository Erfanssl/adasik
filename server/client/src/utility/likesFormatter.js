function likesFormatter(likes) {
    const likesLength = likes.toString().length;
    if (likesLength <= 3) return likes.toString();
    if (likesLength <= 5) return (Math.floor(likes / 100) / 10).toString() + 'k';
    if (likesLength <= 6) return Math.floor(likes / 1000).toString() + 'k';
    if (likesLength <= 8) return (Math.floor(likes / 100000) / 10).toString() + 'm';
    if (likesLength <= 9) return Math.floor(likes / 1000000).toString() + 'm';
    if (likesLength <= 11) return (Math.floor(likes / 100000000) / 10).toString() + 'b';
    if (likesLength <= 12) return Math.floor(likes / 1000000000).toString() + 'b';
}

export default likesFormatter;