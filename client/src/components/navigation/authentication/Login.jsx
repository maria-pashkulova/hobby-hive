import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button
} from '@chakra-ui/react';

import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../../services/authService';


const formInitialState = {
    email: '',
    password: ''
}

const Login = () => {

    const navigate = useNavigate();

    //Basic controlled components:
    //TODO make it abstract
    const [userData, setUserData] = useState(formInitialState);
    const handleInputChange = (e) => {
        setUserData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }

    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);


    const handleFormSubmit = (e) => {
        e.preventDefault();


        // TODO: validate before making a request -> client side validation
        authService.login(userData)
            .then(() => navigate('/'));
    }

    return (
        <VStack as='form' spacing='5' onSubmit={handleFormSubmit}>
            <FormControl id='email' isRequired>
                <FormLabel>Имейл</FormLabel>
                <Input
                    type='email'
                    name='email'
                    onChange={handleInputChange}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Парола</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        onChange={handleInputChange}
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
            {/* <FormControl id='date' isRequired>
                <FormLabel>дата</FormLabel>
                <Input type='date' />
            </FormControl> */}
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
