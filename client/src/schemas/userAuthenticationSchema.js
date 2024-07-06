import * as yup from "yup";
import { RegisterFormKeys } from "../formKeys/formKeys";

// min 5 characters, 1 upper case letter, 1 lower case letter, 1 numeric digit.
const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

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