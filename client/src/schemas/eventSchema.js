import * as yup from "yup";
import { EventKeys } from "../formKeys/formKeys";

export const eventSchema = yup.object().shape({
    [EventKeys.Name]: yup.string().trim().required('Името на събитието е задължително!'),
    [EventKeys.Description]: yup.string().trim().required('Опишете дейността на събитието!').max(300, 'Описанието е твърде дълго!'),
    [EventKeys.Time]: yup
        .date()
        .required('Датата и часа на събитието са задължителни')
        .min(new Date(), 'Събитието може да се проведе най-рано днес, задължително след текущия час!')
        .test(
            'validate-time',
            'Часът на събитието трябва да бъде поне 2 часа след текущия час!',
            (dateAndTime) => {
                // Get the current time
                const now = new Date();

                // Add 2 hours to the current time
                const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

                // Return true if the date is at least two hours from now, false otherwise
                return dateAndTime.getTime() >= twoHoursFromNow;
            }
        ),

    [EventKeys.SpecificLocation]: yup
        .object()
        .required()
        .test(
            'is-not-empty-object',
            'Потърсете и задължително изберете място на провеждане на събитието от получените резултати!',
            (locationObject) => Object.keys(locationObject).length > 0
        )
});

