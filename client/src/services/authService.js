const baseUrl = 'http://localhost:5000/users';


export const register = ({ firstName, lastName, email, password, repeatPass }) =>
    fetch(`${baseUrl}/register`, {
        method: 'POST',
        body: JSON.stringify(
            {
                firstName,
                lastName,
                email,
                password,
                repeatPass
            }
        ),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

    });

export const login = ({ email, password }) =>
    fetch(`${baseUrl}/login`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(
            {
                email,
                password
            }
        ),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

    });
