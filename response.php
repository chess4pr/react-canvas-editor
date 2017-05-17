<?php
session_start();
require('checker.php');

/**
 * Запись страницы в сессию
 */
if ($_POST["step"] == "save_page") {
    $checker = new Checker();
    echo $checker->savePage($_POST["id"], $_POST["src"], $_POST["taskсode"]);
}

/**
 * Создание архива
 */
if ($_POST["step"] == "create_package") {
    $checker = new Checker();
    $objDateTime = new DateTime('NOW');
    $temp_name = $_POST["regnumber"] . "-" .
        $_POST["taskсode"] . "-" .
        $objDateTime->format('Ymd-His') . "-" .
        ceil(microtime(true));
    $params = array(
        "name" => $temp_name,
        "taskсode" => $_POST["taskсode"],
        "comment" => $_POST["comment"],
        "tutor" => "12345",//берем Id проверяющего из сессии
        "datetime" => $objDateTime->format('Y-m-d H:i:s')
    );
    echo $checker->createPackage($params);
}

?>