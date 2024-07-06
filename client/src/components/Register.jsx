import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    Box,
    Link,
    Text,
    useToast,
    FormErrorMessage
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from "react-icons/fi";

import { useState, useContext } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';

import { RegisterFormKeys } from '../formKeys/formKeys';
import { useFormik } from "formik";

import AuthContext from '../contexts/authContext';
import { registerFormSchema } from '../schemas/userAuthenticationSchema';


const Register = () => {

    const navigate = useNavigate();
    const toast = useToast();
    const { registerSubmitHandler } = useContext(AuthContext);


    const handleFormSubmit = async (formValues) => {

        //make request after client side validation
        try {

            await registerSubmitHandler(formValues);
            toast({
                title: "Успешна регистрация!",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "bottom",
            });

            navigate('/');

        } catch (error) {
            //409 - user with the same email exists
            //400- непопълнени полета - въпреки че мисля че е излишно
            //защото сложих клиентска валидация за това
            //а тази сървърната си остава за заявки от клиенти като постман (освен ако клиентската не може да се прескочи)
            if (error.status === 409 || error.status === 400) {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            } else {
                //case изключвам си сървъра - грешка при свързването със сървъра
                toast({
                    title: 'Възникна грешка при свързване!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }

        }
    }

    //Controlled and validated form using Formik and Yup
    const { values, errors, touched, isSubmitting, handleBlur, handleChange, handleSubmit } = useFormik({
        initialValues: {
            [RegisterFormKeys.FirstName]: '',
            [RegisterFormKeys.LastName]: '',
            [RegisterFormKeys.Email]: '',
            [RegisterFormKeys.Password]: '',
            [RegisterFormKeys.RepeatPass]: ''
        },
        validationSchema: registerFormSchema,
        onSubmit: handleFormSubmit

    });
    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    return (
        <VStack as='form' spacing='5' onSubmit={handleSubmit} noValidate >
            <FormControl id='firstName' isInvalid={errors[RegisterFormKeys.FirstName] && touched[RegisterFormKeys.FirstName]} isRequired>
                <FormLabel>Име</FormLabel>
                <Input
                    type='text'
                    name={RegisterFormKeys.FirstName}
                    value={values[RegisterFormKeys.FirstName]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                <FormErrorMessage>
                    {errors[RegisterFormKeys.FirstName]}
                </FormErrorMessage>
            </FormControl>
            <FormControl id='lastName' isInvalid={errors[RegisterFormKeys.LastName] && touched[RegisterFormKeys.LastName]} isRequired>
                <FormLabel>Фамилия</FormLabel>
                <Input
                    type='text'
                    name={RegisterFormKeys.LastName}
                    value={values[RegisterFormKeys.LastName]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                <FormErrorMessage>
                    {errors[RegisterFormKeys.LastName]}
                </FormErrorMessage>
            </FormControl>
            <FormControl id='email' isInvalid={errors[RegisterFormKeys.Email] && touched[RegisterFormKeys.Email]} isRequired>
                <FormLabel>Имейл</FormLabel>
                <Input
                    type='email'
                    name={RegisterFormKeys.Email}
                    value={values[RegisterFormKeys.Email]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                <FormErrorMessage>
                    {errors[RegisterFormKeys.Email]}
                </FormErrorMessage>
            </FormControl>
            <FormControl id='password' isInvalid={errors[RegisterFormKeys.Password] && touched[RegisterFormKeys.Password]} isRequired>
                <FormLabel>Парола</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name={RegisterFormKeys.Password}
                        value={values[RegisterFormKeys.Password]}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                    {errors[RegisterFormKeys.Password]}
                </FormErrorMessage>
            </FormControl>
            <FormControl id='repeatPass' isInvalid={errors[RegisterFormKeys.RepeatPass] && touched[RegisterFormKeys.RepeatPass]} isRequired>
                <FormLabel>Потвърди парола</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name={RegisterFormKeys.RepeatPass}
                        value={values[RegisterFormKeys.RepeatPass]}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                    {errors[RegisterFormKeys.RepeatPass]}
                </FormErrorMessage>
            </FormControl>
            <Button
                type='submit'
                bg={'blue.400'}
                w='100%'
                color={'white'}
                isLoading={isSubmitting}
                loadingText='Регистрация'
                _hover={{
                    bg: 'blue.500',
                }}
            >
                Регистрация
            </Button>

            <Box pt={6}>
                <Text align={'center'}>
                    Вече имате акаунт? <Link as={ReactRouterLink} to='/login' color={'blue.400'}>Вход</Link>
                </Text>
            </Box>
        </VStack >
    )
}

export default Register

