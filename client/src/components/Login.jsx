import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    useToast,
    Box,
    Text,
    Link
} from '@chakra-ui/react';

import { FiEye, FiEyeOff } from "react-icons/fi";
import { useContext, useState } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';

import useForm from "../hooks/useForm";
import AuthContext from '../contexts/authContext';

const LoginFormKeys = {
    Email: 'email',
    Password: 'password'
}

const Login = () => {

    const navigate = useNavigate();
    const toast = useToast();
    const { loginSubmitHandler } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);


    //Make Login form controlled
    const { formValues: userData, onChange } = useForm({
        [LoginFormKeys.Email]: '',
        [LoginFormKeys.Password]: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);


    const handleFormSubmit = async (e) => {
        e.preventDefault();


        // validate before making a request -> client side validation
        //TODO - abstract client side validation

        if (userData[LoginFormKeys.Email] === '' || userData[LoginFormKeys.Password] === '') {
            toast({
                title: "Попълнете всички полета!",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            await loginSubmitHandler(userData);

            toast({
                title: "Успешно вписване!",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "bottom",
            });

            navigate('/')
        } catch (error) {

            //incorrect email or password
            //TODO: ??? - просто така съм си написала сървъра в userController 
            //да ми връща 400 ако има липсващи полета
            //case: непопълнени полета - въпреки че мисля че е излишно
            //защото сложих клиентска валидация за това
            //а тази сървърната си остава за заявки от клиенти като постман

            if (error.status === 401 || error.status === 400) {
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

        } finally {
            setLoading(false);
        }

    }

    return (
        <VStack as='form' spacing='5' onSubmit={handleFormSubmit} noValidate>
            <FormControl id='email' isRequired>
                <FormLabel>Имейл</FormLabel>
                <Input
                    type='email'
                    name='email'
                    value={userData[LoginFormKeys.Email]}
                    onChange={onChange}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Парола</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        value={userData[LoginFormKeys.Password]}
                        onChange={onChange}
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
            </FormControl>
            <Button
                type='submit'
                bg={'blue.400'}
                w='100%'
                color={'white'}
                isLoading={loading}
                loadingText='Вход'
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
    )
}

export default Login
