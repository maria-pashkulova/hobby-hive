//Factory function for input validation middlewares

function validateUserInputData(schema) {
    return async (req, res, next) => {

        try {
            const validatedUserInputData = await schema.validate(req.body);
            //yup does not modify the original object (req.body), it returs a new one
            req.body = { ...req.body, ...validatedUserInputData };
            next(); // if input data is valid, pass control to the next router in the line

        } catch (error) {
            return res.status(400).json({ message: error.errors.join(', ') });
        }
    }
}

exports.validateUserInputData = validateUserInputData;