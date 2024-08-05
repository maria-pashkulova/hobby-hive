import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react"
import { Field, useField } from "formik"


const CustomInput = ({ label, mt = 0, ...props }) => {

    const [field, meta] = useField(props);

    return (
        <FormControl mt={mt} id={props.name} isInvalid={meta.error && meta.touched}>
            <FormLabel>{label}</FormLabel>

            {/* Field component:
            Formik will automagically inject onChange, onBlur, name, and value props of the field designated by the name prop 
            to the (custom) component. */}
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

export default CustomInput;
