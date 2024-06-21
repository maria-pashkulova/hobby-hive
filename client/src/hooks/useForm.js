import { useState } from "react"


export default function useForm(initialValues) {
    const [formValues, setFormValues] = useState(initialValues);

    const onChange = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value
        }))

    }

    const resetForm = (resetValues) => {
        //може да се занулят всички полета във формата- ако resetValues съдържа всички ключове в обекта с полетата
        //може да се занулят само някои полета от формата - например използвано при UpdateProfilePage.jsx - където
        //част от полетата се ъпдейтват от контекста, а тези които не използват стойности от контекста и не се пререндерират
        // - password and repeat password се заменят ръчно с resetValues обект - логиката е подобна на onChange, само дето
        //няма да се подменят стойностите на 1 input поле (1 ключ в обекта), а може да се заментят стойностите на няколко полета
        setFormValues(prevState => ({
            ...prevState,
            ...resetValues
        }));
    }


    return {
        formValues,
        onChange,
        resetForm
    }
}