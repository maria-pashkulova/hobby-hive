import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Avatar,
    Center,
    InputGroup,
    InputRightElement,
    useToast,
} from "@chakra-ui/react";

import useForm from "../hooks/useForm";
import AuthContext from "../contexts/authContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import usePreviewImage from "../hooks/usePreviewImage";

const UpdateProfileFormKeys = {
    FirstName: 'firstName',
    LastName: 'lastName',
    Email: 'email',
    Password: 'password',
    RepeatPass: 'repeatPass',
    ProfilePic: 'profilePic'
}

const UpdateProfilePage = () => {

    // console.log('update pre render');

    const { userId, fullName, email, updateProfileSubmitHandler, logoutHandler } = useContext(AuthContext);
    let { profilePic } = useContext(AuthContext);

    //split firstName and lastName
    const [firstName, lastName] = fullName.split(' ');

    const { formValues: userData, onChange, resetForm } = useForm({
        [UpdateProfileFormKeys.FirstName]: firstName,
        [UpdateProfileFormKeys.LastName]: lastName,
        [UpdateProfileFormKeys.Email]: email,
        [UpdateProfileFormKeys.Password]: '',
        [UpdateProfileFormKeys.RepeatPass]: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fileRef = useRef(null);

    const { handleImageChange, imageUrl } = usePreviewImage();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // TODO: validate before making a request -> client side validation
        //check if password and repeat password match
        try {
            await updateProfileSubmitHandler(userId, userData, profilePic = imageUrl);

            toast({
                title: "Успешна редакция на профила!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            resetForm({
                [UpdateProfileFormKeys.Password]: '',
                [UpdateProfileFormKeys.RepeatPass]: ''
            });

        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            } else {
                toast({
                    title: "Възникна грешка!",
                    description: "Не успяхме да обновим данните Ви!",
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
        <form onSubmit={handleFormSubmit}>
            <Flex align={"center"} justify={"center"} my={6}>
                <Stack
                    spacing={4}
                    w={"full"}
                    maxW={"md"}
                    rounded={"xl"}
                    boxShadow={"lg"}
                    p={6}
                >
                    <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
                        Редакция на профила
                    </Heading>
                    <FormControl>
                        <Stack direction={["column", "row"]} spacing={6}>
                            <Center>
                                <Avatar size='xl' boxShadow={"md"} name={fullName} src={imageUrl || profilePic} />
                            </Center>
                            <Center w='full'>
                                <Button w='full' onClick={() => fileRef.current.click()}>
                                    Промени профилна снимка
                                </Button>
                                <Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
                            </Center>
                        </Stack>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Име</FormLabel>
                        <Input
                            type='text'
                            name='firstName'
                            placeholder="Име"
                            _placeholder={{ color: "gray.500" }}
                            value={userData[UpdateProfileFormKeys.FirstName]}
                            onChange={onChange}
                        />
                    </FormControl>
                    <FormControl id='lastName'>
                        <FormLabel>Фамилия</FormLabel>
                        <Input
                            type='text'
                            name='lastName'
                            placeholder="Фамилия"
                            _placeholder={{ color: "gray.500" }}
                            value={userData[UpdateProfileFormKeys.LastName]}
                            onChange={onChange}
                        />
                    </FormControl>
                    <FormControl id='email'>
                        <FormLabel>Имейл</FormLabel>
                        <Input
                            type='email'
                            name='email'
                            placeholder="Нов имейл"
                            _placeholder={{ color: "gray.500" }}
                            value={userData[UpdateProfileFormKeys.Email]}
                            onChange={onChange}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Парола</FormLabel>
                        <InputGroup>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder="Нова парола"
                                _placeholder={{ color: "gray.500" }}
                                value={userData[UpdateProfileFormKeys.Password]}
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
                    <FormControl>
                        <FormLabel>Потвърди парола</FormLabel>
                        <InputGroup>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Потвърди новата парола"
                                _placeholder={{ color: "gray.500" }}
                                name='repeatPass'
                                value={userData[UpdateProfileFormKeys.RepeatPass]}
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

                    <Stack spacing={[4, 6]} direction={["column", "row"]}>
                        <Button
                            bg={"blue.400"}
                            color={"white"}
                            w='full'
                            _hover={{
                                bg: "blue.500",
                            }}
                            isLoading={loading}
                            loadingText='Запис'
                            type='submit'
                        >
                            Запис
                        </Button>
                        <Button
                            variant='ghost'
                            w='full'
                            as={Link}
                            to={'/'}
                        >
                            Отмяна
                        </Button>

                    </Stack>
                </Stack>
            </Flex>
        </form>
    )
}

export default UpdateProfilePage;
