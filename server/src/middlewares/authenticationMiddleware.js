const jwt = require('../lib/jwt');
const userService = require('../services/userService');


//използвам го за protected routes, а не е глобален midlleware, тъй като само login и  register са публични
//служи за да автентикира потребителя
const auth = async (req, res, next) => {
    //TODO - клиентът да закача в хедърс с определено име токена (custom header name)
    //сървъра да не го търси в кукитата, а в req.headers('име на хедъра:пр: X-Authorization')
    //бисквитка или хедърс?
    const token = req.cookies[process.env.COOKIE_NAME];

    //headers
    //const token = req.header('X-Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Действията изискват вписване в системата!' });
    }

    try {
        //validate token
        //връща декодирания токен, който в случая е обект с информация 
        //за user-a (_id)
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        //Check if user still exists in DB after login
        //TODO: handle user not found ?
        const user = await userService.getById(decodedToken._id);

        //записваме информацията от токена в req обекта + допълнителна информация за потребителят
        // (firstName, lastName, profilePic)
        //за да имат достъп до нея всички останали middlewares и action-a
        //тоест да знаят кой е user-a request-a; кой е произхода на всеки един request
        //имат достъп до контекста на заявката
        req.user = {
            _id: decodedToken._id,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            profilePic: user.profilePic
        }

        next();

    } catch (error) {
        res.clearCookie(process.env.COOKIE_NAME)
        //сървърът връща статус код 401 и клиента да проверява
        //какъв е статус кода и самия клиент да редиректва
        res.status(401).json({ message: 'Действията изискват вписване в системата!' });
        console.log(error.message);
    }


}


module.exports = auth;
