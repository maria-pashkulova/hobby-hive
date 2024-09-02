const yup = require('yup');

// min 5 characters, 1 upper case letter, 1 lower case letter, 1 numeric digit.
const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

exports.loginInputSchema = yup.object().shape({
    email: yup.string().trim().required('Въведете имейл').email("Моля въведете валиден имейл адрес!"),
    password: yup.string().trim().required('Въведете парола!')
});

exports.registerInputSchema = yup.object().shape({
    firstName: yup.string().trim().required('Въвеждането на име е задължително!'),
    lastName: yup.string().trim().required('Въвеждането на фамилия е задължително!'),
    email: yup.string().trim().required('Въвеждането на имейл е задължително!').email("Невалиден имейл адрес!"),
    password: yup
        .string()
        .trim()
        .required('Въвеждането на парола е задъжително!')
        .min(5, 'Паролата трябва да съдържа поне 5 символа')
        .matches(passwordRules, { message: "Паролата трябва да съдържа поне 1 главна буква, поне 1 малка буква, поне 1 цифра" })
})

exports.updateUserInputSchema = yup.object().shape({
    firstName: yup.string().trim().required('Въведете име!'),
    lastName: yup.string().trim().required('Въведете фамилия!'),
    email: yup.string().trim().required('Въведете имейл').email("Моля въведете валиден имейл адрес"),
    password: yup
        .string()
        .trim()
        .when('password', {
            is: (passwordValue) => passwordValue?.length > 0, //If password is provided
            then: (rules) => rules
                .min(5, 'Паролата трябва да съдържа поне 5 символа')
                .matches(passwordRules, { message: "Въведете поне 1 главна буква, поне 1 малка буква, поне 1 цифра" }),
            otherwise: (rules) => rules.notRequired() //If password is not provided (user does not want a change in password)
        })
}, ['password', 'password'])