$(function () {

    var params = {};

    $.getJSON('wards.json', function (data) {
        params.packagePrice = data[0].packagePrice;
        params.packageSize = data[0].packageSize;
        params.paidPackages = data[0].paidPackages;
        params.paidStudents = data[0].paidStudents;
        params.paidPhrase = "&nbsp;&nbsp;<span style='font-size: 10px; vertical-align: top; margin-top:5px;' class='badge alert-info'>есть оплаченные </span>";
        params.allPaidPhrase = "&nbsp;&nbsp;<span style='font-size: 10px; vertical-align: top; margin-top:5px;' class='badge alert-success'>все оплачены </span>";

        //считаем свободные места в оплаченном пакете
        if (params.paidPackages != 0) {
            params.rest = params.paidPackages * params.packageSize - params.paidStudents;
        } else {
            params.rest = params.packageSize - params.paidStudents;
        }
        $("#packagePrice").text(params.packagePrice);
        $("#packageSize").text(params.packageSize);
        $("#paidPackages").text(params.paidPackages);
        $("#paidStudents").text(params.paidStudents);
        $("#restWards").text(params.rest);

        $('#students')
            .jstree({
                'plugins': ["checkbox"],
                checkbox: {
                    whole_node: false,
                    tie_selection: false,
                    "cascade": "up+undetermined",
                    "three_state": true

                },
                'core': {
                    'data': parseJSON(data),
                    'themes': {
                        'name': 'proton',
                        'responsive': false
                    }
                }, "types": {
                    "types": {
                        "disabled": {
                            "check_node": false,
                            "uncheck_node": false
                        }
                    }
                }
            })
            .bind('loaded.jstree', function (e, data) {
                getChecked(false, params);
                $('.badge').show();
            })
            .on("check_node.jstree uncheck_node.jstree", function (e, data) {
                if (data.node.text.indexOf('добавлен') + 1) {
                    // console.log("ранее был добавлен");
                } else {
                    getChecked(false, params);
                }
                $('.badge').show();
            });
    });

    /**
     * Просмотр организаций, есть ли оплаченные ученики
     */
    var checkPaidOrg = data => {
        var c = 0;
        data.map(function (e) {
            if (typeof e.classEntry != 'undefined') {
                e.classEntry.map(function (el) {
                    if (typeof el.firstName != 'undefined') {
                        if (el.paid) {
                            c++;
                        }
                    }
                })
            }
        });
        if (c) {
            return params.paidPhrase;
        } else {
            return "";
        }
    }

    /**
     * Проверим оплачена ли организация полностью
     */
    var checkAllOrgPaid = (org) => {
        var i = 0;
        org.classes.map(function (cls) {
            cls.classEntry.map(function (u) {
                if (u.paid == false) {
                    i++;
                }
            })
        })
        if (i) return false;
        else return params.allPaidPhrase;
    }

    /**
     * Проверим оплачена ли параллель полностью
     */
    var checkParPaid = (parallel) => {
        var i = 0;
        parallel.map(function (cls) {
            cls.classEntry.map(function (u) {
                if (u.paid == false) {
                    i++;
                }
            })
        })
        if (i) return false;
        else return params.allPaidPhrase;
    }

    /**
     * Просмотр классов, есть ли оплаченные ученики
     */
    var checkPaidClasses = (data, cls) => {
        var c = 0;
        data.map(function (e) {
            if (typeof e.firstName != 'undefined') {
                if (e.paid) {
                    c++;
                }
            }
        });
        if (c) {
            /**
             * Все оплачены выводим только для классов (cls)
             */
            if (data.length == c && cls) {
                return params.allPaidPhrase;
            } else {
                return params.paidPhrase;
            }
        } else {
            return "";
        }
    }

    /**
     * Обрабатываем JSON полученный с сервера
     * для отображения в дереве
     */
    var parseJSON = data => {
        var str = '[';
        data.map(function (e) {
            var i = 1;
            e.organizations.map(function (e2) {
                var check = checkAllOrgPaid(e2);
                if (!check) {
                    var status = checkPaidOrg(e2.classes);
                } else {
                    var status = check;
                }
                str += '{"text":"' + e2.orgName + '  <span class=\'orginfo\'>' + status +
                    '</span>","children":[';
                var parCount = 0;
                var parallel = [];
                var phrase = "";
                var phraseArr = [];
                e2.classes.map(function (p) {

                    phrase = "";
                    parallel[p.classNumber] = [];
                    parallel[p.classNumber].push(p);
                    parCount++;
                    var checkPhrase = checkPaidClasses(p.classEntry, false);
                    if (checkPhrase != "") {
                        phrase = checkPhrase;
                    } else {
                        phrase = "";
                    }
                    phraseArr.push(phrase);
                });
                var c = 1;
                parallel.map((e3, index)=> {
                    check = checkParPaid(e3);
                    if (!check) {
                        var status = phraseArr[c - 1];
                    } else {
                        var status = check;
                    }
                    str += '{"text":"' + index + ' классы <span class=\'parinfo\'>' + status + '</span>","children":[';
                    var c2 = 1;
                    e3.map(function (e4) {
                        str += '{"text":"' + e4.classNumber + e4.classSuffix + ' <span class=\'classinfo\'>' + checkPaidClasses(e4.classEntry, true) + '</span>","children":[';
                        var с3 = 1;
                        e4.classEntry.map(function (e5) {
                            if (e5.paid) {
                                var userIcon = "<img style='margin: -4px 8px 0 -2px;' src='./wards/lib/img/user.png' />";
                                var status = " <span style='font-size: 10px; vertical-align: top; margin-top:5px;' class='badge alert-info'>добавлен(а) ранее </span> ";
                            } else {
                                var userIcon = '';
                                var status = '';
                            }
                            str += '{"text":" ' + userIcon + '' + e5.firstName + ' ' +
                                e5.lastName + ' [' + e5.id + ']' + status +
                                '"';
                            if (!e5.paid) {
                                str += ', "icon": "./wards/lib/img/user.png"';
                            } else {
                                str += ', "icon": "./wards/lib/img/user_paid.png"';
                                str += ',"a_attr": {"class": "no_checkbox"}';
                                str += ',"state" : {"disabled":true}';
                            }
                            str += '}';
                            if (с3 != e4.classEntry.length) {
                                str += ',';
                            }
                            с3++;
                        })
                        str += ']';
                        str += '}';
                        if (c2 != e3.length) {
                            str += ',';
                        }
                        c2++;
                    })
                    str += ']';
                    str += '}';
                    if (c != parCount) {
                        str += ',';
                    }
                    c++;
                })
                str += ']';
                str += '}';
                if (i != e.organizations.length) {
                    str += ',';
                }
                i++;
            })
        });
        str += ']';
        /**
         * Проверка - если правильно собрана строка
         * в консоле видим обьект
         var testStr = JSON.parse(str);
         console.log(testStr);
         */
        return JSON.parse(str);
    }
});

var getChecked = (send, params) => {
    if (!send) {
        var wArr = [];
        var count = $('#students').jstree(true).get_checked(true).length - params.rest;
        if (count > 0) {
            $(".alert-info").hide();
            $(".alert-success").show();
        }
        $('#students').jstree(true).get_checked(true).map(function (e) {
            if (typeof e.icon == 'string') {
                if (e.icon.indexOf('user.png') + 1) {
                    var item = {};
                    item.text = e.text;
                    item.price = e.original.price;
                    wArr.push(item);
                }
            }
        });
        if (wArr.length < params.rest) {
            $(".alert-info").show();
            $(".alert-success").hide();
        }
        $('.count').text(wArr.length);
        /**
         * Если кол-во выбранныx учеников не превышает
         * остатка в оплаченном пакете - цена 0
         */
        if (params.rest >= wArr.length) {
            $('#amount').text("0руб.");
            $("#restWards").text(params.rest - wArr.length);
        } else {
            if (wArr.length - params.rest > params.packageSize) {
                /**
                 * Если кол-во выбранныx учеников больше одного пакета
                 */
                var packages = ~~((wArr.length - params.rest) / params.packageSize) + 1;
                var restСurWards = (packages) * params.packageSize - (wArr.length - params.rest);
                if (params.packageSize - restСurWards == 0) {
                    packages = packages - 1;
                }
                $('#packages').text(packages);
                $('#amount').text(params.packagePrice * packages + "руб.");
                $("#restСurWards").text(restСurWards);
            } else {
                /**
                 * Если кол-во выбранныx учеников не больше одного пакета
                 */
                var restСurWards = params.packageSize - (wArr.length - params.rest)
                $('#packages').text(1);
                $('#amount').text(params.packagePrice + "руб.");
                $('#restСurWards').text(restСurWards);
            }
        }
    } else {
        var str = "\n\r\n\rИтого: " + $("#amount").text();
        alert(str);
    }
}