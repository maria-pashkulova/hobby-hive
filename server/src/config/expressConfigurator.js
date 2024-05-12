//конфигурация на инстанция на експрес сървър

const express = require('express');

function expressConfig(app) {
    //обработва данни от форми с метод POST и querystrings също
    //в случай на SPA не мисля че се ползва - всъщност се ползва ако искаме
    //да имаме querystrings в req.query
    //в случай на SPA служи да парсва form-urlencoded данни идващи от форма с action - 
    //endpoint на сървъра и метод POST, а само за парсване на querystrings -> req.query
    app.use(express.urlencoded({ extended: false }));
    //Обработва данни от форма идващи в json формат - клиентът
    //трябва да ги оформи под формата на json (Реакт ще се грижи за това)
    app.use(express.json());

    //CORS related
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods',
            '*');
        res.setHeader('Access-Control-Allow-Headers',
            '*');
        next();
    })

    //logger middleware
    app.use((req, res, next) => {
        console.log(req.method, req.path);
        next();
    })
}

module.exports = expressConfig;