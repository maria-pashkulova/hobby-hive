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
    const response = await fetch(url, {
        ...buildOptions(data),
        method,
        credentials: 'include' //this ensures cookies are sent and received
    });

    //204 - no content -> logout server response
    if (response.status === 204) {
        return {};
    }

    //TODO: check other satus codes

    const result = await response.json();

    if (!response.ok) {
        throw result;
    }

    return result;

}


//partial application; създаваме си интерфейс подобен на този на axios
//с тази разлика че сами си пишем фетч заявките и знаем какво точно се случва
export const get = request.bind(null, 'GET');
export const post = request.bind(null, 'POST');
export const put = request.bind(null, 'PUT');
export const remove = request.bind(null, 'DELETE');
