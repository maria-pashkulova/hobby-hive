import { useState, useContext } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/authContext';

import {
    VStack,
    Button,
    Box,
    Link,
    Text,
    useToast,
} from '@chakra-ui/react';

import { Formik } from "formik";
import { RegisterFormKeys } from '../formKeys/formKeys';
import { registerFormSchema } from '../schemas/userAuthenticationSchema';

import TextInput from './input-fields/TextInput';
import PasswordInput from './input-fields/PasswordInput';


const Register = () => {

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { registerSubmitHandler } = useContext(AuthContext);

    //Controlled and validated form using Formik and Yup
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
                <VStack as='form' spacing='5' onSubmit={handleSubmit}>
                    <TextInput
                        type='text'
                        name={RegisterFormKeys.FirstName}
                        placeholder='Въведете име...'
                        label='Име'
                    />
                    <TextInput
                        type='text'
                        name={RegisterFormKeys.LastName}
                        placeholder='Въведете фамилия...'
                        label='Фамилия'
                    />
                    <TextInput
                        type='text'
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

