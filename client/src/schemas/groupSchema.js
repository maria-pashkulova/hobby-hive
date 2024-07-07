import * as yup from "yup";
import { GroupKeys } from "../formKeys/formKeys";


export const groupSchema = yup.object().shape({
    [GroupKeys.Name]: yup.string().trim().required('Въведете име на групата!'),
    [GroupKeys.Category]: yup.string().trim().required('Изберете категория групови занимания!'),
    [GroupKeys.Location]: yup.string().trim().required('Изберете основна локация!'),
    [GroupKeys.Description]: yup.string().max(300, 'Описанието е твърде дълго')
})