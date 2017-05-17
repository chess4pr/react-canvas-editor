/**
 * Создаем обьект ZChecker (work space)
 * в нем будем хранить методы отвечающие за загрузку картинок
 * из файла solutionList.json
 */
var ZChecker = (el) => {
    if (ZChecker.count >= 1) {
        if (!ZChecker.rotate) {
            var image = ZChecker.lc.getImage().toDataURL();
        } else {
            var image = ZChecker.rotate;
            ZChecker.pages[ZChecker.curpage - 1].image = image;
        }
        if (ZChecker.pages[ZChecker.curpage - 1].image != image) {
            ZChecker.pages[ZChecker.curpage - 1].image = image;
            ZChecker.saveImg(ZChecker.pages[ZChecker.curpage - 1].id, image);
        }
        if (!ZChecker.rotate) {
            $('[data-count=' + ZChecker.curpage + ']').html('<img src="checker/lib/img/checked.png" />');
            $('[data-count=' + ZChecker.curpage + ']').css("background-image", "url(" + image + ")");
        } else {
            ZChecker.rotate = 0;
        }
    }
    //ставим рамку в отмеченной картинке
    ZChecker.checkedImg(el);
    var id = $(el).data("count");
    var imgSrc = ZChecker.pages[id - 1].image;
    var img = new Image();
    img.src = imgSrc;
    var width = img.clientWidth;
    var height = img.clientHeight;
    img.onload = function () {
        ZChecker.createLC(img);
    }
    ZChecker.curpage = $(el).data("count");
    ZChecker.curId = $(el).attr("id");
    ZChecker.count++;
}

ZChecker.createLC = (img) => {
    if (typeof img.src == "undefined") {
        var img = new Image();
        img.src = img;
    }
    var height = img.height;
    var width = img.width;
    ZChecker.lc.clear();
    var scale = 820 / width / 1.6;
    var imageSize = {width: width * scale, height: height* scale};
    var lc = LC.init(
        document.getElementsByClassName("draw")[0],
        {
            imageSize: imageSize,
            tools: [Plus, Minus, LC.tools.Pencil, LC.tools.Eraser, LC.tools.Line,
                LC.tools.Text, LC.tools.Pan, Rotate],
            backgroundShapes: [
                LC.createShape(
                    'Image', {x: 0, y: 0, image: img, scale: scale})
            ]
        });
    ZChecker.createPicker();
    //в ZChecker поместим lc (LiterallyCanvas)
    ZChecker.lc = lc;
}

//автосохранение при переключении страниц.
//если ZChecker.count == 0 не сохраняем
ZChecker.count = 0;
ZChecker.curpage = '';
ZChecker.rotate = 0;
ZChecker.init = (params) => {
    ZChecker.params = params;
    $("#" + ZChecker.params.elementId).append(`<div class="card-block">
    <div class="col-lg-12 col-md-12 col-sm-12 fullname"></div>
    <!-- Modal -->
    <div class="modal fade" id="popup1" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Отправка результатов проверки</h3>
                </div>
                <div class="modal-body">
                    <textarea class="comment" placeholder="Добавить комментарий"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" id="btnCancel" class="btn btn-default" data-dismiss="modal">Отменить</button>
                    <button onclick="ZChecker.createArch()" type="button" id="confirm" class="btn btn-warning">
                        Подтвердить
                        отправку
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-10 col-md-9 col-sm-8">
        <div class="cover-container solution"></div>
        <a id="rate-toggle" href="#">скрыть оценки</a>
    </div>
    <div class="col-lg-2 col-md-3 col-sm-4 send-btn">
        <button data-toggle="modal" id="btnSend" data-backdrop="static" data-keyboard="false" data-target="#popup1" type="button"
                class="btn btn-info">Отправить
        </button>
    </div>
    <div class="col-lg-12 col-md-12">
        <div class="rating">
            <img src="tmp/checker.jpg" class="balls"/>
            <button type="button" class="btn btn-success">Сохранить</button>
        </div>
        <div class="draw"></div>
    </div>
</div>`);

    setTimeout(()=> {
        /**
         * Показать и спрятать оценки.
         **/
        $("#rate-toggle").click(function (e) {
            if ($(".rating").is(":visible")) {
                $(".rating").hide();
                $("#rate-toggle").text("показать оценки");
                $(".draw").css("margin-left", "0");
            } else {
                $(".rating").show();
                $("#rate-toggle").text("скрыть оценки");
                $(".draw").css("margin-left", "250px");
            }
        });
        $(".draw").css("margin", "0px 10px 10px 280px")
        var str = '';
        ZChecker.pages = [];
        var str = '';
        var p = 0;
        ZChecker.pages = [];
        params.solution.pages.map(s => {
            p++;
            str += '<div onclick="ZChecker(this)" data-count="' + p + '" id="' + s.id + '" ' +
                'class="cover-item" style="background-image: url(' +
                s.image + ')"></div>';
            let page = {};
            page.id = s.id;
            page.image = s.image;
            page.status = "NOT_SENDED";
            ZChecker.pages.push(page);
        });
        $(".solution").append(str);
        $(".fullname").text(params.solution.student.firstname +
            " " + params.solution.student.lastname +
            " [" + params.solution.student.regnumber + "]");
        //загружаем первое решение
        ZChecker($('.cover-item').first());
        ZChecker.createPicker();
    }, 500);
}

/**
 * сохраняем картинку на сервер и меняем статус
 *
 * "NOT_SENDED" - не отправлена
 * "SENDED" - отправлена на сервер и получен ответ сервера с кодом 200
 * если картинка уже отправлена а ответ от сервера не получен в массиве ZChecker.pages
 * мы видим status: "NOT_SENDED", src:"data:image/png;base64,iVBORw0KGgo..."
 * это означает что идет отправка в противном случае в src находится путь к картинке
 */
ZChecker.saveImg = (id, src) => {
    var params = {
        id: id,
        step: "save_page",
        taskсode: ZChecker.params.solution.taskсode,
        src: src
    };
    $.post(ZChecker.params.backend, params, function (result) {
            var resp = JSON.parse(result);
            ZChecker.pages.map(s => {
                if (s.id == resp.id) {
                    s.status = "SENDED";
                }
            });
        })
        .fail(function () {
            console.log("error");
        })
}

ZChecker.createArch = () => {
    if(!ZChecker.params.onSubmitBefore())return;
    $("#btnCancel").hide();
    $(".comment").hide();
    $(".modal-body").css("text-align", "center");
    $(".modal-body").html('<img src="checker/lib/img/loader.gif">');
    $("#confirm").addClass('disabled');
    var promise = new Promise(function (resolve, reject) {
        let src = ZChecker.lc.getImage().toDataURL();
        let params = {
            id: ZChecker.curId,
            step: "save_page",
            'taskсode': ZChecker.params.solution.taskсode,
            src: src
        };

        /**
         * Отправляем текущую страницу
         */
        console.log("Текущая страница: ");
        $.post(ZChecker.params.backend, params, (result) => {
                let resp = JSON.parse(result);
                result = JSON.parse(result);
                if (result.status == "DONE") {
                    ZChecker.pages.map(s => {
                        if (s.id == resp.id) {
                            s.status = "SENDED";
                            console.log("Отправлена страница ", resp.id + " готово");
                        }
                    });
                    resolve("готово");
                } else {
                    console.log("ответ сервера: " + result);
                    reject(Error("Ошибка при сохранении архива"));
                }
            })
            .fail(() => {
                console.log("error");
                reject(Error("Ошибка при сохранении архива"));
            })
    });

    promise.then(function (successMessage) {

        /**
         * Проверяем есть ли не отправленные страницы
         */
        var check = 0;
        ZChecker.pages.map(s => {
            if (s.status != "SENDED") {
                check++;
            }
        });
        if (!check) {
            ZChecker.postArch(successMessage);
            return;
        }

        /**
         * Создаем очередь для отправки оставшихся страниц
         */
        console.log("Нетронутые страницы: ");
        $.request = (function () {
            var queue = $.Deferred().resolve();
            return function (options) {
                function _call() {
                    return $.ajax(options);
                }

                return (queue = queue.then(_call, _call));
            };
        })();

        ZChecker.pages.map(s => {
            if (s.status == "NOT_SENDED") {
                //ситуация когда что то еще не загрузилось на сервер, ждем
                if (s.image.indexOf('base64') + 1) {
                    setTimeout(()=> ZChecker.createArch(), 4000);
                    console.log("ждем загрузки");
                    return;
                } else {
                    let params = {
                        url: ZChecker.params.backend,
                        data: {
                            id: s.id,
                            step: "save_page",
                            'taskсode': ZChecker.params.solution.taskсode,
                            src: ZChecker.getBase64Image(s.image)
                        },
                        cache: false,
                        type: "POST",
                        success: function (response) {
                            let resp = JSON.parse(response);
                            console.log("Отправлена страница ", resp.id + " " + successMessage);
                            ZChecker.pages.map(s => {
                                if (s.id == resp.id) {
                                    s.status = "SENDED";
                                }
                            });
                        },
                        error: function (xhr) {
                            console.log("error");
                        }
                    };
                    $.request(params).always(function () {
                        var check = 0;
                        ZChecker.pages.map(s => {
                            if (s.status != "SENDED") {
                                check++;
                            }
                        });
                        /**
                         * Если у всех страниц статус "SENDED" даем команду на создание архива
                         */
                        if (!check) {
                            ZChecker.postArch(successMessage);
                        }
                    });
                }
            }
        });

    }, function (err) {
        console.log(err);
    });
}

ZChecker.postArch = (successMessage) => {
    var comment = $(".comment").val();
    if (!comment) {
        var comment = "нет комментария";
    }
    var params = {
        step: "create_package",
        comment: comment,
        regnumber: ZChecker.params.solution.student.regnumber,
        taskсode: ZChecker.params.solution.taskсode
        /*  firstname: ZChecker.params.solution.student.firstname,
         lastname: ZChecker.params.solution.student.lastname*/
    };
    $.post(ZChecker.params.backend, params, function (result) {
            console.log("Создаем архив: " + successMessage);
            let r = JSON.parse(result);
            $(".draw").html('<a href="' + r.url + '" download>Скачать архив</a>');
            ZChecker.archive = r.url;
            ZChecker.params.onSubmitAfter();
            $('#popup1').modal('toggle');
            $('#btnSend').hide();
            $('.solution').hide();
        })
        .fail(function () {
            console.log("error");
        })
}

ZChecker.getBase64Image = (path) => {
    var img = new Image();
    img.src = path;
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/jpeg");
    return dataURL;
}

ZChecker.rotateImage = (path) => {
    var img = new Image();
    img.src = path;
    var canvas = document.createElement("canvas");
    canvas.width = img.height;
    canvas.height = img.width;
    var ctx = canvas.getContext("2d");
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(90 * Math.PI / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
    var dataURL = canvas.toDataURL("image/jpeg");
    $('[data-count=' + ZChecker.curpage + ']').css("background-image", "url(" + dataURL + ")");
    ZChecker.rotate = dataURL;
    ZChecker($('[data-count=' + ZChecker.curpage + ']'));
}

ZChecker.checkedImg = (el) => {
    $.each($('.cover-item'), function (index) {
        $(this).css('border', '0');
    });
    if (typeof el[0] != 'undefined') {
        $('#' + el[0].id).css('border', '2px solid');
    }
    else {
        $(el).css('border', '2px solid');
    }
}

ZChecker.checkedColor = (el) => {
    $.each($('.square-toolbar-button'), function (index) {
        $(this).removeClass('border');
    });
    $(el).addClass('border');
}

ZChecker.createPicker = () => {
    var str = '<div id="pallete">' +
        '<div class="square-toolbar-button black" onclick="ZChecker.checkedColor(this); ZChecker.checkedColor(this); ZChecker.lc.setColor(\'primary\', \'black\');" style="float: left; margin: 1px;">&nbsp;</div>' +
        '<div class="square-toolbar-button red" onclick="ZChecker.checkedColor(this); ZChecker.lc.setColor(\'primary\', \'red\');" style="float: left; margin: 1px;"></div>' +
        '<div class="square-toolbar-button yellow" onclick="ZChecker.checkedColor(this); ZChecker.lc.setColor(\'primary\', \'yellow\');" style="float: left; margin: 1px;"></div>' +
        '<div class="square-toolbar-button green" onclick="ZChecker.checkedColor(this); ZChecker.lc.setColor(\'primary\', \'green\');" style="float: left; margin: 1px;"></div>' +
        '<div class="square-toolbar-button blue" onclick="ZChecker.checkedColor(this); ZChecker.lc.setColor(\'primary\', \'blue\');" style="float: left; margin: 1px;"></div>' +
        '<div class="square-toolbar-button white" onclick="ZChecker.checkedColor(this); ZChecker.lc.setColor(\'primary\', \'white\');" style="float: left; margin: 1px;"></div>' +
        '</div>';
    $(".lc-picker").append(str);
    $(".lc-undo-redo").css("margin", "-1020px 0 0 12px");
    $(".lc-clear").html('<img src="checker/lib/img/delete.png">');
    $(".lc-clear").css("margin", "-1062px 0 0 12px");
    $(".lc-zoom").css("margin-left", "12px");
}

ZChecker.getData = (url, ready) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 404) {
            ready(this.responseText);
        }
    }
    xhr.send();
}

/**
 * Инициализация навигации.
 * Создаем кнопки Plus и Minus
 * Встариваем их в панель инструментов
 **/
var Plus = function (lc) {
    var self = this;
    return {
        usesSimpleAPI: false,
        name: 'Plus',
        iconName: 'plus',
        strokeWidth: lc.opts.defaultStrokeWidth,
        optionsStyle: null,
        didBecomeActive: function (lc) {
            var onPointerDown = function (pt) {
                var plusImg = new Image();
                plusImg.src = 'checker/lib/img/plus_.png';
                self.currentShape = LC.createShape(
                    'Image', {x: pt.x - 8, y: pt.y - 8, image: plusImg});
            };
            var onPointerUp = function (pt) {
                lc.saveShape(self.currentShape);
            };
            self.unsubscribeFuncs = [
                lc.on('lc-pointerdown', onPointerDown),
                lc.on('lc-pointerup', onPointerUp)
            ];
        },
        willBecomeInactive: function (lc) {
            self.unsubscribeFuncs.map((f)=> {
                f()
            });
        }
    }
};

var Minus = function (lc) {
    var self = this;
    return {
        usesSimpleAPI: false,
        name: 'Minus',
        iconName: 'minus',
        strokeWidth: lc.opts.defaultStrokeWidth,
        optionsStyle: null,
        didBecomeActive: (lc) => {
            var onPointerDown = (pt) => {
                var plusImg = new Image();
                plusImg.src = 'checker/lib/img/minus_.png';
                self.currentShape = LC.createShape(
                    'Image', {x: pt.x - 8, y: pt.y - 8, image: plusImg});
            };
            var onPointerUp = function (pt) {
                lc.saveShape(self.currentShape);
            };
            self.unsubscribeFuncs = [
                lc.on('lc-pointerdown', onPointerDown),
                lc.on('lc-pointerup', onPointerUp)
            ];
        },
        willBecomeInactive: function (lc) {
            self.unsubscribeFuncs.map((f) => {
                f()
            });
        }
    }
};

var Rotate = function (lc) {
    var self = this;
    return {
        usesSimpleAPI: false,
        name: 'Rotate',
        iconName: 'rotate',
        strokeWidth: lc.opts.defaultStrokeWidth,
        optionsStyle: null,
        didBecomeActive: (lc) => {
            //ZChecker.rotateImage(ZChecker.params.solution.pages[ZChecker.curpage - 1].image);
            ZChecker.rotateImage(ZChecker.pages[ZChecker.curpage - 1].image);
        }
    }
};

setTimeout(()=> {
    var lc = LC.init(
        document.getElementsByClassName('draw')[0],
        {
            tools: [LC.tools.Pencil, LC.tools.Eraser, LC.tools.Line,
                LC.tools.Text, Plus, Minus, LC.tools.Rectangle]
        });
    ZChecker.lc = lc;
}, 200);

