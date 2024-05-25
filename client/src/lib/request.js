const buildOptions = (data) => {
    const options = {};

    if (data) {
        options.body = JSON.stringify(data);
        options.headers = {
            'Content-Type': 'application/json'
        }
    }

    return options;
}

const request = async (method, url, data) => {

    try {
        // Perform the fetch operation
        const response = await fetch(url, {
            ...buildOptions(data),
            method,
            credentials: 'include' //this ensures cookies are sent and received
        });

        // Check if the response status is not ok (status code not in the range 200-299)
        if (response.ok == false) {
            // Parse the response body as JSON to get the error message
            const error = await response.json();
            // Throw an error with the message from the server
            throw new Error(error.message);
        }

        //204 - no content -> logout server response
        if (response.status === 204) {
            return {};
        }

        //TODO: check other satus codes?

        try {
            // Try to parse the response body as JSON
            const result = await response.json();
            // Return the parsed JSON data
            return result;

        } catch (error) {
            // If parsing as JSON fails, return the raw response
            return response;
        }

    } catch (error) {
        // If any error occurs during fetch or JSON parsing
        // re-throw the error so it can be handled by the caller of this function
        throw error;
    }


}


//partial application; създаваме си интерфейс подобен на този на axios
//с тази разлика че сами си пишем фетч заявките и знаем какво точно се случва
export const get = request.bind(null, 'GET');
export const post = request.bind(null, 'POST');
export const put = request.bind(null, 'PUT');
export const remove = request.bind(null, 'DELETE');
