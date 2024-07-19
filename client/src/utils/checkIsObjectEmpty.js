const checkIsObjectEmpty = (obj) => {
    if (Object.keys(obj).length > 0) {
        return false;
    }
    return true;
}

export default checkIsObjectEmpty;