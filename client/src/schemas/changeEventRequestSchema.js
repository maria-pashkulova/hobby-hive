import * as yup from "yup";
import { EventChangeRequestKeys } from "../formKeys/formKeys";

export const changeEventRequestSchema = () => yup.object().shape({
    [EventChangeRequestKeys.Description]: yup.string().trim().required('Опишете промяната в събитието!').max(500, 'Описанието е твърде дълго!')
})
