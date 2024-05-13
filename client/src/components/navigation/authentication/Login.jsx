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

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    return (
        <VStack spacing='5'>
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
            {/* <FormControl id='date' isRequired>
                <FormLabel>дата</FormLabel>
                <Input type='date' />
            </FormControl> */}
            <Button
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
