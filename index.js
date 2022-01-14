const http = require("http"), //require подключает файлы или библиотеки
      crud = require("./crud"),
      statics = require("node-static");

const staticFileDir = new statics.Server("./public"); // Размещение статики на сервере

const echo = (res, content) => {
    res.end(JSON.stringify(content)); //Закрывает поток и дописывает дополнительные данные
}

const student = (req, res) => {
    res.writeHead(200,{"Content-type": "application/json"}); // Создание заголовка запроса. Отправляет код состояния 200 (OK) и
                                                            //Записывает данные из json
    const url = req.url.substring(1).split("/"); //В url создаётся массив, начиная с 1 элемента (убирается лишний "/" вначале),

    switch (req.method) {  // Определяется метод запроса
        case "GET"://Получение данных обо всех студентах
            if (url.length > 1)//Если в url запроса после /student есть /id, получаем id и выводим по нему объект
                echo (res, crud.get(url[1]))
            else 
                echo (res, crud.getAll())//Если нет /id, выводим весь массив объектов, хранящийся в data
            break;
        case "POST": //Добавление
            getAsyncData (req, data => {
                echo(res, crud.create(JSON.parse(data)))
            })
            break;
        case "PUT": //Изменение
            getAsyncData (req, data => {
                echo(res, crud.update(JSON.parse(data)))
            })
            break;
        case "DELETE": //Удаление
            if(url.length > 1)
                echo(res, crud.delete(url[1])) //Удаляет объект по id
            else
                echo(res,{error:"Не передан id"}) //Если в url запроса отсутствует id при удалении выдаст ошибку
            break;
        default: echo(res,{error:"500"}) //указывает на то, что сервер столкнулся с неожиданной ошибкой, которая помешала ему выполнить запрос
    }
}

const getAsyncData = (req, callback) => {//ассинхронное получение данных
    let data = "";
    //.on связывает функцию chunk с датой, т.е. пока данные поступают на сервер
    req.on("data", chunk => {data += chunk})//В дату добавляются введенные строчки из json
    //событие data генерируется, когда на сервер поступают данные
    req.on("end", () => {callback(data)})//Когда все данные прибыли, мы вызываем data
    //событие end генерируется, когда все данные прибыли
}

const handler = function (req, res) {
    const url = req.url.substring(1).split("/")
    switch (url[0]) {   // Если первый url после localhost /student, то вызываем функцию
        case "student":
            student(req, res);
            return
    }
    staticFileDir.serve(req, res);
}

http.createServer(handler).listen(8090, () => {  // Создание сервера на порте с функцией handler
    console.log("Server listening on port 8090")
})