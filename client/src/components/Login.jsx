import { useContext, useState } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/authContext';

import {
    VStack,
    Button,
    useToast,
    Box,
    Text,
    Link
} from '@chakra-ui/react';

import { Formik } from 'formik';
import { LoginFormKeys } from '../formKeys/formKeys';
import { loginFormSchema } from '../schemas/userAuthenticationSchema';

import CustomInput from './input-fields/CustomInput';
import PasswordInput from './input-fields/PasswordInput';


const Login = () => {

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { loginSubmitHandler } = useContext(AuthContext);


    //Controlled and validated form using Formik and Yup
    const handleFormSubmit = async (formValues) => {

        //Make request after client side validation
        try {

            await loginSubmitHandler(formValues);

            toast({
                title: "Успешно вписване!",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "bottom",
            });

            navigate('/')

        } catch (error) {
            //401 - incorrect email or password
            if (error.status === 401) {
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
                [LoginFormKeys.Email]: '',
                [LoginFormKeys.Password]: ''
            }}
            validationSchema={loginFormSchema}
            onSubmit={handleFormSubmit}
        >
            {({ isSubmitting, handleSubmit }) => (
                <VStack as='form' spacing='5' onSubmit={handleSubmit} noValidate>
                    <CustomInput
                        type='email'
                        name={LoginFormKeys.Email}
                        placeholder='Въведете имейл...'
                        label='Имейл'
                    />
                    <PasswordInput
                        type={showPassword ? 'text' : 'password'}
                        name={LoginFormKeys.Password}
                        placeholder='Въведете парола...'
                        label='Парола'
                        showPassword={showPassword}
                        handleClick={handleClick}
                    />
                    <Button
                        type='submit'
                        bg={'blue.400'}
                        w='100%'
                        color={'white'}
                        isLoading={isSubmitting}
                        loadingText='Вписване...'
                        _hover={{
                            bg: 'blue.500',
                        }}>
                        Вход
                    </Button>
                    <Box pt={6}>
                        <Text align={'center'}>
                            Все още нямате акаунт? <Link as={ReactRouterLink} to='/register' color={'blue.400'}>Регистрация</Link>
                        </Text>
                    </Box>

                </VStack >
            )}


        </Formik>
    )
}

export default Login
