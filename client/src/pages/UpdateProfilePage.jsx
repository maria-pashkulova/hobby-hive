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
    Spinner,
    AvatarBadge,
    IconButton,
} from "@chakra-ui/react";


import useForm from "../hooks/useForm";
import AuthContext from "../contexts/authContext";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePreviewImage from "../hooks/usePreviewImage";

import * as userService from "../services/userService";

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

    const { userId, updateProfileSubmitHandler, logoutHandler } = useContext(AuthContext);

    const [loadingUserData, setLoadingUserData] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    //Form values + profilePicture and fullName (used for Avatar component) separate states
    const { formValues: userData, onChange, resetForm } = useForm({
        [UpdateProfileFormKeys.FirstName]: '',
        [UpdateProfileFormKeys.LastName]: '',
        [UpdateProfileFormKeys.Email]: '',
        [UpdateProfileFormKeys.Password]: '',
        [UpdateProfileFormKeys.RepeatPass]: ''
    });
    const [userFullName, setUserFullName] = useState('');
    const [currentProfilePic, setCurrentProfilePic] = useState('');

    //Show/Hide password
    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword((showPassword) => !showPassword);

    const toast = useToast();
    const navigate = useNavigate();

    const imageRef = useRef(null);

    const { handleImageChange, handleImageDecline, imageUrl } = usePreviewImage();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoadingUpdate(true);

        // TODO: validate before making a request -> client side validation
        //check if password and repeat password match
        try {
            const updatedUserData = await updateProfileSubmitHandler(userId, userData, imageUrl, currentProfilePic);

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


            //Reset state with updated data from request response!
            setUserFullName(updatedUserData.fullName);
            setCurrentProfilePic(updatedUserData.profilePic);

        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            } else {

                //TODO: handle other types of errors when you create validation
                toast({
                    title: "Възникна грешка при свързване!",
                    description: "Не успяхме да обновим данните Ви!",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });

            }

        } finally {
            setLoadingUpdate(false);
        }
    }

    useEffect(() => {

        userService.getMyDetails()
            .then((currentUserData) => {

                //split firstName and lastName
                const [firstName, lastName] = currentUserData.fullName.split(' ');
                resetForm({
                    [UpdateProfileFormKeys.FirstName]: firstName,
                    [UpdateProfileFormKeys.LastName]: lastName,
                    [UpdateProfileFormKeys.Email]: currentUserData.email
                });

                setUserFullName(currentUserData.fullName);
                setCurrentProfilePic(currentUserData.profilePic);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    //case изключвам си сървъра - грешка при свързването със сървъра
                    toast({
                        title: 'Възникна грешка при свързване!',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });

                    navigate('/');
                }
            })
            .finally(() => {
                setLoadingUserData(false);
            })

    }, []);


    // Generate a key that changes when imageUrl or currentProfilePic changes
    const avatarKey = imageUrl || currentProfilePic ? 'withImage' : 'withoutImage';

    if (loadingUserData) {
        return (
            <Flex justifyContent={'center'} my={5}>
                <Spinner size='xl' />
            </Flex>
        )
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
                            <Center >
                                <Avatar key={avatarKey} size='xl' boxShadow={"md"} name={userFullName} src={imageUrl || currentProfilePic} >
                                    {(imageUrl || currentProfilePic) && (<AvatarBadge
                                        as={IconButton}
                                        size="sm"
                                        rounded="full"
                                        top="-10px"
                                        colorScheme="red"
                                        aria-label="remove Image"
                                        icon={<FiX />}
                                        onClick={() => {
                                            if (imageUrl) {
                                                handleImageDecline();
                                            } else {
                                                setCurrentProfilePic('');
                                            }
                                        }}
                                    />)}
                                </Avatar>
                            </Center>
                            <Center w='full'>
                                <Button w='full' onClick={() => imageRef.current.click()}>
                                    Промени профилна снимка
                                </Button>
                                <Input type='file' hidden ref={imageRef} onChange={(e) => {
                                    handleImageChange(e);
                                    if (currentProfilePic) {
                                        setCurrentProfilePic('');
                                    }
                                }} />
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
                            isLoading={loadingUpdate}
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
