const jwt = require('../lib/jwt');


//използвам го за protected routes, а не е глобален midlleware, тъй като само login и  register са публични
//служи за да автентикира потребителя
exports.auth = async (req, res, next) => {
    //TODO - клиентът да закача в хедърс с определено име токена (custom header name)
    //сървъра да не го търси в кукитата, а в req.headers('име на хедъра:пр: X-Authorization')
    //бисквитка или хедърс?
    const token = req.cookies[process.env.COOKIE_NAME];

    //headers
    //const token = req.header('X-Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unautorized, no token' });
    }

    try {
        //validate token
        //връща декодирания токен, който в случая е обект с информация 
        //за user-a
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        //записваме информацията от токена в req обекта
        //за да имат достъп до нея всички останали middlewares и action-a
        //тоест да знаят кой е user-a request-a; кой е произхода на всеки един request
        //имат достъп до контекста на заявката
        req.user = decodedToken;

        next();

    } catch (err) {
        res.clearCookie(process.env.COOKIE_NAME)
        //може би сървъра трябва да върне статус код 401 и примерно клиента да проверява
        //какъв е статус кода и самия клиент да редиректва
        res.status(401).json({ message: 'Unautorized, invalid token!' }); //TODO
    }


}

//route guards - за всички пътища освен login и register
//служи за проверка дали потребителят е автентикиран
// exports.isAuthenticated = (req, res, next) => {
//     if (!req.user) {
//         return res.status(401).json({ message: 'Protected route - Unautorized!' });
//     }
//     next();
// }