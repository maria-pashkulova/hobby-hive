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


const Register = () => {

    // const [fname, setFname] = useState('');
    // const [lname, setLname] = useState('');
    // const [password, setPassword] = useState('');
    // const [repeatPass, setRepeatPass] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    return (
        <VStack spacing='5'>
            <FormControl id='first-name' isRequired>
                <FormLabel>Име</FormLabel>
                <Input type='text' />
            </FormControl>
            <FormControl id='last-name' isRequired>
                <FormLabel>Фамилия</FormLabel>
                <Input type='text' />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Имейл</FormLabel>
                <Input type='email' />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Парола</FormLabel>
                <InputGroup>
                    <Input type={showPassword ? 'text' : 'password'} />
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
            <FormControl id='rePassword' isRequired>
                <FormLabel>Потвърди парола</FormLabel>
                <InputGroup>
                    <Input type={showPassword ? 'text' : 'password'} />
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
                bg={'blue.400'}
                w='100%'
                color={'white'}
                _hover={{
                    bg: 'blue.500',
                }}>
                Регистрация
            </Button>

        </VStack >
    )
}

export default Register

