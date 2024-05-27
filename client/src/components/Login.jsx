import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    useToast
} from '@chakra-ui/react';

import { FiEye, FiEyeOff } from "react-icons/fi";
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// import * as authService from '../../services/authService';
import useForm from "../hooks/useForm";
import AuthContext from '../contexts/authContext';

const LoginFormKeys = {
    Email: 'email',
    Password: 'password'
}

const Login = () => {

    // const navigate = useNavigate();
    const { loginSubmitHandler } = useContext(AuthContext);
    const toast = useToast();

    //Make Login form controlled
    const { formValues: userData, onChange } = useForm({
        [LoginFormKeys.Email]: '',
        [LoginFormKeys.Password]: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);


    const handleFormSubmit = (e) => {
        e.preventDefault();


        // TODO: validate before making a request -> client side validation
        //TODO - abstract

        if (userData[LoginFormKeys.Email] === '' || userData[LoginFormKeys.Password] === '') {
            toast({
                title: "Попълнете данните си!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        loginSubmitHandler(userData);
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
                _hover={{
                    bg: 'blue.500',
                }}>
                Вход
            </Button>

        </VStack >
    )
}

export default Login
