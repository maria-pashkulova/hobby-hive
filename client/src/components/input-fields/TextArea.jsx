import { FormControl, FormErrorMessage, FormLabel, Textarea } from "@chakra-ui/react"
import { Field, useField } from "formik"


const TextArea = ({ label, mt = 0, ...props }) => {
    const [field, meta] = useField(props);
    return (
        <FormControl mt={mt} id={props.name} isInvalid={meta.error && meta.touched}>
            <FormLabel>{label}</FormLabel>
            <Field
                as={Textarea}
                {...props}
            />
            <FormErrorMessage>
                {meta.error}
            </FormErrorMessage>
        </FormControl>
    )
}

export default TextArea;
