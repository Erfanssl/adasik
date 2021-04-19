function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (userAgent.match(/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i)) return "tablet";
    if (userAgent.match(/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/)) return "mobile";
    return "desktop";
}

export default getDeviceType;