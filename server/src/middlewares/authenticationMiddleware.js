const jwt = require('../lib/jwt');

//в момента не работи, защото не сетвам бисквитка при логин! (засега при register не генерирам token)


//служи за да автентикира потребителя
exports.auth = async (req, res, next) => {
    //TODO - клиентът да закача в хедърс с определено име токена (custom header name)
    //сървъра да не го търси в кукитата, а в req.headers('име на хедъра:пр: X-Authorization')
    //бисквитка или хедърс?
    const token = req.cookies[process.env.COOKIE_NAME];

    if (token) {

        try {
            //validate token
            //връща декодирания токен, който в случая е обект с информация 
            //за user-a
            const decodedToken = await jwt.verify(token, process.env.SECRET);

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
            res.status(401).json({ msg: 'Unautorized!' }); //TODO
        }

    } else {
        next();

    }

}

//route guards
//служи за проверка дали потребителят е автентикиран
exports.isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'Unautorized!' });
    }
    next();
}