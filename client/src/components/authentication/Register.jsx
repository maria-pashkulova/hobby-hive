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

import * as authService from '../../services/authService';
import useForm from "../../hooks/useForm";


const RegisterFormKeys = {
    FirstName: 'firstName',
    LastName: 'lastName',
    Email: 'email',
    Password: 'password',
    RepeatPass: 'repeatPass'
};

const Register = () => {

    const navigate = useNavigate();

    const { formValues: userData, onChange } = useForm({
        [RegisterFormKeys.FirstName]: '',
        [RegisterFormKeys.LastName]: '',
        [RegisterFormKeys.Email]: '',
        [RegisterFormKeys.Password]: '',
        [RegisterFormKeys.RepeatPass]: '',

    })

    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // TODO: validate before making a request -> client side validation
        //check if password and repeat password match

        authService.register(userData)
            .then(() => navigate('/'));
    }

    return (
        <VStack as='form' spacing='5' onSubmit={handleFormSubmit} noValidate >
            <FormControl id='fname' isRequired>
                <FormLabel>Име</FormLabel>
                <Input
                    type='text'
                    name='firstName'
                    value={userData[RegisterFormKeys.FirstName]}
                    onChange={onChange}
                />
            </FormControl>
            <FormControl id='lname' isRequired>
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
                _hover={{
                    bg: 'blue.500',
                }}
            >
                Регистрация
            </Button>
        </VStack >
    )
}

export default Register

