import { Box, Button, Heading, Text, useToast } from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc';
import React from 'react'
import MyCalendar from '../components/MyCalendar'
import { useGoogleLogin } from '@react-oauth/google';
import { sendAuthorizationCode } from '../services/googleCalendarService';
import { SCOPE, FLOW } from '../constants/google-calendar';


const MyCalendarPage = () => {

    const toast = useToast();

    const googleLoginAndAuthorization = useGoogleLogin({
        scope: SCOPE,
        flow: FLOW,
        onSuccess: async (codeResponse) => {

            try {
                const googleAuthorizationSuccessMsg = await sendAuthorizationCode(codeResponse.code);

                toast({
                    title: googleAuthorizationSuccessMsg.message,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            } catch (error) {
                console.log(error);

            }

        },
        onError: (errorResponse) => {
            toast({
                title: 'Не осигурихте достъп до Вашия Гугъл календар!',
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    });

    // const handleGoogleCalendar = async () => {

    //     try {

    //         const { authorizationUrl } = await initiateGoogleLoginAndAuthorization();

    //         window.location.href = authorizationUrl; // Server responds with the Google OAuth URL

    //     } catch (error) {
    //         console.log(error);

    //     }


    // }

    return (
        <>
            <Heading my='6' size='lg'>Събития, за които сте отбелязали присъствие</Heading>
            {/* Google */}
            <Box maxW={'60vw'}>
                <Button maxW='full' variant={'outline'} leftIcon={<FcGoogle />} onClick={googleLoginAndAuthorization}>
                    <Text>Позволи достъп до Google календар</Text>
                </Button>
            </Box>

            <MyCalendar />
        </>
    )
}

export default MyCalendarPage
