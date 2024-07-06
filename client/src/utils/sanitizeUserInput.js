const trimInputValues = (formValues) => {
    return Object.keys(formValues).reduce((acc, currValue) => {
        acc[currValue] = typeof formValues[currValue] == 'string' ? formValues[currValue].trim() : formValues[currValue];
        return acc;
    }, {});
}

export default trimInputValues;