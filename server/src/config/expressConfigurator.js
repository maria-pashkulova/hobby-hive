//конфигурация на инстанция на експрес сървър

const express = require('express');
const cookieParser = require('cookie-parser');


function expressConfig(app) {

    //CORS related
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.setHeader('Access-Control-Allow-Methods',
            'GET, OPTIONS, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers',
            'Content-Type,Authorization');

        res.header('Access-Control-Allow-Credentials', 'true');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.sendStatus(200); // Preflight requests should return 200 status
        } else {
            next();
        }
    })

    //обработва данни от форми с метод POST и querystrings също
    //в случай на SPA не мисля че се ползва - всъщност се ползва ако искаме
    //да имаме querystrings в req.query
    //в случай на SPA НЕ служи за да парсва form-urlencoded данни идващи от форма с action - 
    //endpoint на сървъра и метод POST, а само за парсване на querystrings -> req.query
    app.use(express.urlencoded({ extended: false }));
    //Обработва данни от форма идващи в json формат - клиентът
    //трябва да ги оформи под формата на json (Реакт ще се грижи за това)
    app.use(express.json({ limit: '10mb' })); // To parse JSON data in the req.body

    //Working with cookies
    app.use(cookieParser());

    //logger middleware
    app.use((req, res, next) => {
        console.log(req.method, req.path);
        next();
    });

    //Error handling middleware for PayloadTooLargeError that can be thrown by 
    //express.urlEncoded() and express.json() middlewares
    app.use((err, req, res, next) => {
        if (err.status === 413) {
            //явно req.json() и req.urlEncoded() си закачат именно статус 413 като хвърлят грешка
            res.status(413).json({ message: 'Payload too large' })
        } else {
            next(err)
        }
    })
}

module.exports = expressConfig;