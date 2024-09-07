import * as yup from "yup";
import { LoginFormKeys, RegisterFormKeys } from "../formKeys/formKeys";

// min 5 characters, 1 upper case letter, 1 lower case letter, 1 numeric digit.
const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

export const loginFormSchema = yup.object().shape({
    [LoginFormKeys.Email]: yup.string().trim().required('Въведете имейл').email("Моля въведете валиден имейл адрес"),
    [LoginFormKeys.Password]: yup.string().trim().required('Въведете парола!')
});

export const registerFormSchema = yup.object().shape({
    [RegisterFormKeys.FirstName]: yup.string().trim().required('Въведете име!'),
    [RegisterFormKeys.LastName]: yup.string().trim().required('Въведете фамилия!'),
    [RegisterFormKeys.Email]: yup.string().trim().required('Въведете имейл').email("Моля въведете валиден имейл адрес"),
    [RegisterFormKeys.Password]: yup
        .string()
        .trim()
        .required('Въведете парола!')
        .min(5, 'Паролата трябва да съдържа поне 5 символа')
        .matches(passwordRules, { message: "Въведете поне 1 главна буква, поне 1 малка буква, поне 1 цифра" })
    ,
    [RegisterFormKeys.RepeatPass]: yup
        .string()
        .required('Потвърдете паролата!')
        .oneOf([yup.ref(RegisterFormKeys.Password), null], 'Паролите трябва да съвпадат!')

});

export const updateUserDataSchema = yup.object().shape({
    [RegisterFormKeys.FirstName]: yup.string().trim().required('Въведете име!'),
    [RegisterFormKeys.LastName]: yup.string().trim().required('Въведете фамилия!'),
    [RegisterFormKeys.Email]: yup.string().trim().required('Въведете имейл').email("Моля въведете валиден имейл адрес"),
    [RegisterFormKeys.Password]: yup
        .string()
        .trim()
        .when([RegisterFormKeys.Password], {
            is: (passwordValue) => passwordValue?.length > 0, //If password is provided
            then: (rules) => rules
                .min(5, 'Паролата трябва да съдържа поне 5 символа')
                .matches(passwordRules, { message: "Въведете поне 1 главна буква, поне 1 малка буква, поне 1 цифра" }),
            otherwise: (rules) => rules.notRequired() //If password is not provided (user does not want a change in password)
        })
    ,
    [RegisterFormKeys.RepeatPass]: yup
        .string()
        .trim()
        .when([RegisterFormKeys.Password], {
            is: (passwordValue) => passwordValue?.length > 0, // Only validate repeatPass if password is provided
            then: (rules) => rules
                .required('Потвърдете паролата!')
                .oneOf([yup.ref(RegisterFormKeys.Password)], 'Паролите трябва да съвпадат!'),
            otherwise: (rules) => rules.notRequired() //If password is not provided (user does not want a change in password), repeatPass is not required
        })
}, [
    [RegisterFormKeys.Password, RegisterFormKeys.Password],
    [RegisterFormKeys.RepeatPass, RegisterFormKeys.Password]
]);