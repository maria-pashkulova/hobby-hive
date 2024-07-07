import { FormControl, FormErrorMessage, FormLabel, Select } from "@chakra-ui/react"
import { Field, useField } from "formik"


const CustomSelect = ({ label, mt, ...props }) => {
    const [field, meta] = useField(props);

    return (
        <FormControl mt={mt} id={props.name} isInvalid={meta.error && meta.touched}>
            <FormLabel>{label}</FormLabel>
            <Field
                as={Select}
                {...props}
            />
            <FormErrorMessage>
                {meta.error}
            </FormErrorMessage>
        </FormControl>
    )
}

export default CustomSelect;
