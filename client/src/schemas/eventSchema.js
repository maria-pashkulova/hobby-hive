import * as yup from "yup";
import { EventKeys } from "../formKeys/formKeys";
import { isSameDay } from "date-fns";
import checkIsObjectEmpty from "../utils/checkIsObjectEmpty";
import normalizeRegionName from "../utils/normalizeRegionName";

const MINIMUM_EVENT_DURATION_MINUTES = 30;

export const eventSchema = (groupRegionCity, isUpdateAction) => yup.object().shape({
    [EventKeys.Title]: yup.string().trim().required('Името на събитието е задължително!'),
    [EventKeys.Description]: yup.string().trim().required('Опишете дейността на събитието!').max(500, 'Описанието е твърде дълго!'),
    [EventKeys.StartDateTime]: yup
        .date()
        .required('Въведете валидни начална дата и час') //invalid month duration case is also handled; invalid year and date case is also handled
        .min(new Date(), 'Събитието може да се проведе най-рано днес, задължително след текущия час!')
        .test(
            'validate-time',
            'Часът на започване на събитието трябва да бъде поне 2 часа след текущия час!',
            (startDateTime) => {
                //startDateTime is parsed to Date object by Yup
                if (isUpdateAction) {
                    return true;
                }
                // Get the current time
                const now = new Date();

                // Add 2 hours to the current time (added in ms)
                const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

                // Return true if the date is at least two hours from now, false otherwise
                return startDateTime.getTime() >= twoHoursFromNow;
            }
        ),
    [EventKeys.EndDateTime]: yup
        .date()
        .required('Въведете валидни крайна дата и час') //invalid month duration case is also handled ; invalid year and date case is also handled
        .min(yup.ref(EventKeys.StartDateTime), 'Крайната дата и час трябва да са след началните дата и час')
        .test(
            'min-duration',
            `Събитието трябва да продължи минимум ${MINIMUM_EVENT_DURATION_MINUTES} минути`,
            function (endDateTime) {
                const startDateTime = this.parent[EventKeys.StartDateTime];

                if (!startDateTime || !endDateTime) return true;

                const startDate = new Date(startDateTime);
                const endDate = new Date(endDateTime);

                const isOneDayEvent = isSameDay(startDate, endDate);

                //if the event will end the same day that it starts on, check timing
                if (isOneDayEvent) {
                    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60) //duration in minutes
                    return duration >= MINIMUM_EVENT_DURATION_MINUTES;
                }

                return true; //if the event will take multiple days return true
            }
        ),
    [EventKeys.SpecificLocation]: yup
        .object()
        .test(
            'validate-location-region-city',
            `Локацията трябва да бъде в област ${groupRegionCity}`,
            function (specificLocation) {
                //specificLocation.coordinates.length === 0 (Update event case) - 
                //if location was not selected upon event creation a default value for specificLocation object in DB 
                //is set with coordinates = [];
                if (checkIsObjectEmpty(specificLocation) || specificLocation.coordinates.length === 0) return true;

                return normalizeRegionName(specificLocation.locationRegionCity) === groupRegionCity;
            }
        )
});

