import { Button, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputRightElement } from "@chakra-ui/react"
import { Field, useField } from "formik"
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = ({ label, showPassword, handleClick, ...props }) => {
    const [field, meta] = useField(props);
    return (
        <FormControl id={props.name} isInvalid={meta.error && meta.touched}>
            <FormLabel>{label}</FormLabel>
            <InputGroup>
                <Field
                    as={Input}
                    {...props}
                />
                <InputRightElement h={'full'}>
                    <Button
                        variant={'ghost'}
                        size='xl'
                        onClick={handleClick}>
                        {showPassword ? <FiEye /> : <FiEyeOff />}
                    </Button>
                </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
                {meta.error}
            </FormErrorMessage>
        </FormControl>
    )
}

export default PasswordInput;
