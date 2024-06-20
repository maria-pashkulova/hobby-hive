//Make jsonwebtoken library work with promises instead of callbacks for asynchronous operations
//Extend jsonwebtoken library

const jsonwebtoken = require('jsonwebtoken');

const sign = (payload, secret, options) => {

    //new Promise (executor function - която приема 2 параметъра - 2 функции,
    //   resolve и reject)
    const promise = new Promise((resolve, reject) => {
        jsonwebtoken.sign(payload, secret, options, (err, token) => {
            if (err) {
                return reject(err);
            }

            resolve(token);
        });
    });

    return promise;
}

const verify = (token, secret) => {
    const promise = new Promise((resolve, reject) => {
        jsonwebtoken.verify(token, secret, (err, decodedToken) => {
            if (err) {
                return reject(err);
            }

            resolve(decodedToken);
        });
    });

    return promise;
}

const jwtPromises = {
    sign,
    verify,
};

module.exports = jwtPromises;
