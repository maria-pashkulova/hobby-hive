const responseErrorMiddleware = (error, req, res, next) => {

    //Business logic related thrown errors have custom statusCode property
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }

    //Server errors, Mongo DB Server errors; Cloudinary errors
    return res.status(500).json({ message: 'Нещо се обърка! Опитайте по-късно!' });
}

module.exports = responseErrorMiddleware;