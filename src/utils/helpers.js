export const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

export const throttle = (fn, delay) => {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last > delay) {
            fn(...args);
            last = now;
        }
    };
};

export const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
};

export const openExternalLink = (url) => {
    window.electron?.shell?.openExternal(url) || window.open(url, '_blank');
};
