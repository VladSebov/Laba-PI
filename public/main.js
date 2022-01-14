let data = new function () { //Создаём объект data
    let inc = 0; //Создаём локальную переменную inc - инкремент. С помощью него формируется id
    let arr = {}; //Создаём объект arr в нем хранятся созданные студенты 
    this.init = (callback) => { //свойство init задаётся стрелочной функцией необходимо для вывода уже имеющихся данных
        util.ajax({method:"GET"}, data => {
            data.map(std => {
                arr[std.Id] = std;
                inc = std.Id;
            }); //Метод map вызывает переданную функцию 
            //callback один раз для каждого элемента,
            // в порядке их появления и конструирует
            // новый массив из результатов её вызова.
            inc++;
            if (typeof callback == 'function') callback();
        })
    }
    this.create = (obj) => {//свойство create необходимо при создании студента
        obj.Id = inc++;
        arr[obj.Id] = obj; 
        util.ajax({method:"POST", body:JSON.stringify(obj)});
        //создает объект с помощью ajax методом post с заданными параметрами
        //и посылает данные об объекте в формате JSON
        return obj;
    }
    this.getAll = () => {//свойство getAll необходимо при получении всего массива студентов
        return Object.values(arr)
    };
    this.get = (id) => arr[id];//свойство get необходимо при получении данных о студенте по id
    this.update = (obj) => {//свойство update - при обновлении информации о студенте
        arr[obj.Id] = obj;
        util.ajax({method:"PUT", body:JSON.stringify(obj)});
        return obj;
    }
    this.delete = (id) => {//свойство delete
        delete arr[id];
        util.ajax({method:"DELETE", path:"/"+id});
    }
};

const util = new function () {
    this.ajax = (params, callback) => {
        let url = "";
        if (params.path !== undefined) { // Для удаления   path - id студента
            url = params.path;
            delete params.path;
        }
        fetch("/student"+url, params).then(data => data.json()).then(callback)
        //fetch ассинхронно отправляет данные на сервер
        //then выполняется после того как fetch возвращает promise
    }
    this.parse = (tpl, obj) => {
        let str = tpl;
        for (let k in obj) {
            str = str.replaceAll("{" + k + "}", obj[k]);
        }
        return str;
    };
    this.id = (el) => document.getElementById(el); //свойство id - поиск элемента в HTMl по id
    this.q = (el) => document.querySelectorAll(el); //возвращает массив элементов с заданным тэгом
    this.listen = (el, type, callback) => el.addEventListener(type, callback); //свойство listen - при взаимодействии с найденным в HTML элементе
}

const student = new function () {//Объект student для изменения или удаления мнформация о студенте
    this.submit = () => {   // нажатие кнопки сохранить
        const st = {
            name: util.id("name").value,
            group: util.id("group").value,
            phone: util.id("phone").value,
            email: util.id("email").value,
        };
        if(util.id("Id").value === "-1") data.create(st)
        else {
            st.Id = util.id("Id").value;
            data.update(st);
        }
        this.render();
        util.id("edit").style.display = "none"
    }

    this.remove = () => {  // удаление студента
        data.delete(activeStudent);
        activeStudent = null;
        this.render()
        util.id("remove").style.display = "none"
    }

const init = () => {//объект init отвечает за рендеринг имеющихся данных и работу кнопок
    data.init(() => {
        this.render();
    });
    util.q("button.add").forEach(el => {  // Кнопка добавления
        util.listen(el, "click", add);
    });
    util.q(".btn-close, .close").forEach(el => {  // Крестики и отмена
        util.listen(el, "click", () => {
            util.id(el.dataset["id"]).style.display = "none";
        });
    });
    util.q(".submit").forEach(el => {  // Кнопки сохранить и удалить в формах, цикл потому что обе кнопки submit
        util.listen(el, "click", () => {
            this[el.dataset["func"]]();
        });
    });
};

const add = () => {
    util.q("#edit .title")[0].innerHTML = "Добавить студента: ";
    util.q("#edit form")[0].reset();
    util.id("Id").value = "-1";
    util.id("edit").style.display = "block";
};

const edit = (el) => {
    util.q("#edit .title")[0].innerHTML = "Изменить студента: ";
    util.q("#edit form")[0].reset();
    const st = data.get(el.dataset["id"]); // Забирает кнопку изменить
    for(let k in st) {
        util.id(k).value = st[k];
    }
    util.id("edit").style.display = "block";
};

let activeStudent = null;
const rm = (el) => {
    util.id("remove").style.display = "block";
    activeStudent = el.dataset["id"]; // dataset получает значение пользовательских атрибутов
};

const addListener = () => {  // События для кнопок изменить и удалить в таблице
    util.q("button.edit").forEach(el => {  // Метод forEach() выполняет цикл по событиям.
        util.listen(el, "click", () => edit(el)); // Показывает форму изменения
    });
    util.q("button.rm").forEach(el => {    // Метод forEach() выполняет цикл по событиям.
        util.listen(el, "click", () => rm(el)); // Показывает форму удаления
    });
};

this.render = () => {
    util.id("table")
        .innerHTML = data // Отображает студентов в таблице
        .getAll()
        .map(el => util.parse(tpl, el)).join("");  // Взвращаем массив строк с табличкой и join превращает в строку
    addListener();
};

const tpl = `
   <tr>
        <td style="width: 20px">{Id}</td>
        <td>{name}</td>
        <td style="width: 45%">{group}</td>
        <td style="width: 55%">{phone}</td>
        <td>{email}</td>
        <td style="width: 100%">
        <button type="button" class="edit" data-id="{Id}">Изменить</button>
        <button type="button" class="rm" data-id="{Id}">Удалить</button></td>                    
   </tr>
`;

window.addEventListener("load", init);//при загрузке страницы происходит вызов коструктора объекта init
}
