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
    useToast
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from "react-icons/fi";

import { useState, useContext } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';

import useForm from "../hooks/useForm";

import AuthContext from '../contexts/authContext';


const RegisterFormKeys = {
    FirstName: 'firstName',
    LastName: 'lastName',
    Email: 'email',
    Password: 'password',
    RepeatPass: 'repeatPass'
};

const Register = () => {

    const navigate = useNavigate();
    const toast = useToast();
    const { registerSubmitHandler } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);


    const { formValues: userData, onChange } = useForm({
        [RegisterFormKeys.FirstName]: '',
        [RegisterFormKeys.LastName]: '',
        [RegisterFormKeys.Email]: '',
        [RegisterFormKeys.Password]: '',
        [RegisterFormKeys.RepeatPass]: '',

    })

    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // validate before making a request -> client side validation
        //check for required fields
        //check if password and repeat password match
        //TODO: check for valid email format

        if (userData[RegisterFormKeys.FirstName] === '' ||
            userData[RegisterFormKeys.LastName] === '' ||
            userData[RegisterFormKeys.Email] === '' ||
            userData[RegisterFormKeys.Password] === '' ||
            userData[RegisterFormKeys.RepeatPass] === ''
        ) {
            toast({
                title: "Попълнете всички полета!",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (userData[RegisterFormKeys.Password] !== userData[RegisterFormKeys.RepeatPass]) {
            toast({
                title: "Паролите не съвпадат",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }


        //make request after client side validation
        try {
            setLoading(true);

            await registerSubmitHandler(userData);
            toast({
                title: "Успешна регистрация!",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "bottom",
            });

            navigate('/');

        } catch (error) {
            //duplicate user error
            //TODO: ??? - просто така съм си написала сървъра в userController 
            //да ми връща 400 ако има липсващи полета
            //case: непопълнени полета - въпреки че мисля че е излишно
            //защото сложих клиентска валидация за това
            //а тази сървърната си остава за заявки от клиенти като постман
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

        } finally {
            setLoading(false);
        }
    }

    return (
        <VStack as='form' spacing='5' onSubmit={handleFormSubmit} noValidate >
            <FormControl id='firstName' isRequired>
                <FormLabel>Име</FormLabel>
                <Input
                    type='text'
                    name='firstName'
                    value={userData[RegisterFormKeys.FirstName]}
                    onChange={onChange}
                />
            </FormControl>
            <FormControl id='lastName' isRequired>
                <FormLabel>Фамилия</FormLabel>
                <Input
                    type='text'
                    name='lastName'
                    value={userData[RegisterFormKeys.LastName]}
                    onChange={onChange}
                />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Имейл</FormLabel>
                <Input
                    type='email'
                    name='email'
                    value={userData[RegisterFormKeys.Email]}
                    onChange={onChange}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Парола</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        value={userData[RegisterFormKeys.Password]}
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
            <FormControl id='repeatPass' isRequired>
                <FormLabel>Потвърди парола</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name='repeatPass'
                        value={userData[RegisterFormKeys.RepeatPass]}
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

