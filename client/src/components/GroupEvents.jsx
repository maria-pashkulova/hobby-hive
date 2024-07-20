import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as eventService from '../services/eventService';
import AuthContext from '../contexts/authContext';
import { useDisclosure } from '@chakra-ui/react';
import CreateEventModal from './CreateEventModal';
import GroupEventsCalendar from './eventCalendar/GroupEventsCalendar';

const GroupEvents = () => {

    const navigate = useNavigate();
    const [groupId, isMember, activityTags, groupRegionCity] = useOutletContext();
    const { logoutHandler, socket } = useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [groupEvents, setGroupEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        eventService.getGroupEvents(groupId)
            .then((groupEvents) => {
                setGroupEvents(groupEvents);
                socket?.emit('visit event calendar', groupId);
            })
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    console.log(error.message);
                }
            });

        return () => {
            socket.emit('leave event calendar', groupId);
        }

    }, [groupId]);

    // Handler to update selected date and open modal
    const handleDateClick = (date) => {
        setSelectedDate(date);
        onOpen();
    };

    //Add new event to the local state of the event creator
    const handleAddNewEvent = (newEvent) => {
        setGroupEvents((prevGroupEvents) => [...prevGroupEvents, newEvent]);
    }

    //Update group event states
    //for the users currently viewing the calendar in which a new event was created so that
    //they can see it immediately (no re-fetch needed)
    useEffect(() => {
        const handleUpdateEvents = (newEvent) => {
            setGroupEvents((prevGroupEvents) => [...prevGroupEvents, newEvent]);
        };

        socket?.on('update event calendar', handleUpdateEvents);

        //Cleanup the event listener on component unmount or when groupId / socket changes and use effect is triggered again
        return () => {
            socket?.off('update event calendar', handleUpdateEvents);
        }
    }, [socket, groupId]);


    //може би тази заявка трябва да се изпълни чак след като се намери успешно група
    //ако това е възможно изобщо да хвърли грешка, то ще се хване от catch?
    return (
        <>


            {
                isOpen && <CreateEventModal
                    isOpen={isOpen}
                    onClose={onClose}
                    groupId={groupId}
                    groupRegionCity={groupRegionCity}
                    activityTags={activityTags}
                    selectedDate={selectedDate}
                    handleAddNewEvent={handleAddNewEvent}
                />
            }

            <GroupEventsCalendar
                groupEvents={groupEvents}
                onDateClick={handleDateClick}
            />
        </>

    )
}

export default GroupEvents
