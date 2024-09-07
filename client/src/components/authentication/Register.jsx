import { useState, useContext } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

import {
    VStack,
    Button,
    Box,
    Link,
    Text,
    useToast,
} from '@chakra-ui/react';

import { Formik } from "formik";
import { RegisterFormKeys } from '../../formKeys/formKeys';
import { registerFormSchema } from '../../schemas/userSchema';

import CustomInput from '../input-fields/CustomInput';
import PasswordInput from '../input-fields/PasswordInput';


const Register = () => {

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { registerSubmitHandler } = useContext(AuthContext);

    //Controlled and validated form using Formik and Yup
    const handleFormSubmit = async (formValues) => {

        //Make request after client side validation
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
            if (error.status === 409) {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            } else {
                //Error connecting with server or other errors
                toast({
                    title: 'Нещо се обърка! Опитайте по-късно!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }

        }
    }

    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    return (
        <Formik
            initialValues={{
                [RegisterFormKeys.FirstName]: '',
                [RegisterFormKeys.LastName]: '',
                [RegisterFormKeys.Email]: '',
                [RegisterFormKeys.Password]: '',
                [RegisterFormKeys.RepeatPass]: ''
            }}
            validationSchema={registerFormSchema}
            onSubmit={handleFormSubmit}
        >

            {({ isSubmitting, handleSubmit }) => (
                <VStack as='form' spacing='5' onSubmit={handleSubmit} noValidate>
                    <CustomInput
                        type='text'
                        name={RegisterFormKeys.FirstName}
                        placeholder='Въведете име...'
                        label='Име'
                    />
                    <CustomInput
                        type='text'
                        name={RegisterFormKeys.LastName}
                        placeholder='Въведете фамилия...'
                        label='Фамилия'
                    />
                    <CustomInput
                        type='email'
                        name={RegisterFormKeys.Email}
                        placeholder='Въведете имейл...'
                        label='Имейл'
                    />

                    <PasswordInput
                        type={showPassword ? 'text' : 'password'}
                        name={RegisterFormKeys.Password}
                        placeholder='Въведете парола...'
                        label='Парола'
                        showPassword={showPassword}
                        handleClick={handleClick}
                    />

                    <PasswordInput
                        type={showPassword ? 'text' : 'password'}
                        name={RegisterFormKeys.RepeatPass}
                        placeholder='Потвърдете паролата...'
                        label='Потвърди парола'
                        showPassword={showPassword}
                        handleClick={handleClick}
                    />

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
                </VStack >)}

        </Formik>
    )
}

export default Register

