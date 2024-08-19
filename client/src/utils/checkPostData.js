const checkForRequiredFields = (postInputData, postFormFields) => {
    const hasTextOrImg = postFormFields.some((fieldName) => postInputData[fieldName].trim() !== '');

    if (hasTextOrImg) {
        return '';
    }
    return 'Изисква се публикацията да съдържа поне или снимка, или описание!'
}

export default checkForRequiredFields;