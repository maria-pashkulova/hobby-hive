import { useState } from "react"


export default function useForm(initialValues) {
    const [formValues, setFormValues] = useState(initialValues);

    const onChange = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value
        }))

    }

    return {
        formValues,
        onChange,

    }
}