import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react"
import { Field, useField } from "formik"


const TextInput = ({ label, ...props }) => {
    const [field, meta] = useField(props);
    return (
        <FormControl id={props.name} isInvalid={meta.error && meta.touched}>
            <FormLabel>{label}</FormLabel>
            <Field
                as={Input}
                {...props}
            />
            <FormErrorMessage>
                {meta.error}
            </FormErrorMessage>
        </FormControl>
    )
}

export default TextInput;
