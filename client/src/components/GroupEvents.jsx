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
    const { logoutHandler } = useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [groupEvents, setGroupEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        eventService.getGroupEvents(groupId)
            .then(setGroupEvents)
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

    }, [groupId]);

    // Handler to update selected date and open modal
    const handleDateClick = (date) => {
        setSelectedDate(date);
        onOpen();
    };

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
