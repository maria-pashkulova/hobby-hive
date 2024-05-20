const jwt = require('../lib/jwt');


exports.auth = async (req, res, next) => {
    const token = req.cookies[process.env.COOKIE_NAME];

    if (token) {

        try {
            //validate token
            //връща декодирания токен, който в случая е обект с информация 
            //за user-a
            const user = await jwt.verify(token, process.env.SECRET);

            //записваме информацията от токена в req обекта
            //за да имат достъп до нея всички останали middlewares и action-a
            //тоест да знаят кой е user-a request-a; кой е произхода на всеки един request
            //имат достъп до контекста на заявката
            req.user = user;

            next();

        } catch (err) {
            res.clearCookie(process.env.COOKIE_NAME)
            //може би сървъра трябва да върне статус код 401 и примерно клиента да проверява
            //какъв е статус кода и самия клиент да редиректва
            res.json('Unauthorized'); //TODO
        }

    } else {
        next();

    }

}