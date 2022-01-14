const { readFileSync, stat, writeFileSync, writeFile } = require('fs') //подключение библиотеки fs для работы с файлами

module.exports = new function () {
    const fileName = "./data.json";//имя файла
    let inc = 0
    let data = {}
    this.create = dt => {
        dt.Id = inc++;
        data[dt.Id] = dt;
        writeFile(fileName, JSON.stringify(data), err => {if (err) console.error(err);});
        //записывает объект в файл data.json
        return dt
    }
    this.getAll = () => {
        return Object.values(data);
    }
    this.get = id => data[id];
    this.update = dt => {
        data[dt.Id] = dt;
        writeFile(fileName, JSON.stringify(data), err => {if (err) console.error(err);});
        //записывает объект в файл data.json
        return dt;
    }
    this.delete = id => {
        delete data[id];
        writeFile(fileName, JSON.stringify(data), err => {if (err) console.error(err);});
    }

    //stat нужен если мы знаем что файл может не существовать
    //тогда он выдаст callcack err
    stat(fileName, (err, stats) => {
        if (err && err.code === "ENOENT") {    // Ошибка, когда нет такого файла
            writeFileSync(fileName, "{}");
            //создаем данные
        }
    data = JSON.parse(readFileSync(fileName, {encoding:"UTF-8"}));
    //json.parse преобразует строку в объект
    })
}