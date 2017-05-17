<?php

/**
 * Класс содержит методы для подготовки архива в формате e-package
 */
class Checker
{
    /**
     * Запись страницы в сессию
     * @param string $pageId - идентификатор страницы
     * @param string $src - картинка
     * @param string $src - код решения
     * @return JSON
     */
    function savePage($pageId, $src, $taskсode)
    {
        $_SESSION["pages_" . $taskсode][$pageId] = $src;
        return '{"status": "DONE", "id": "' . $pageId . '"}';
    }

    /**
     * Создание архива
     * @param array $params массив данных переданных в $_POST
     * @return JSON
     */
    function createPackage($params)
    {
        $zip = new ZipArchive(); //Создаём объект для работы с ZIP-архивами
        $zip->open($params["name"] . ".zip", ZIPARCHIVE::CREATE); //Открываем (создаём) архив archive.zip
        $structure = $params["name"] . "/package0/images/";
        if (!mkdir($structure, 0777, true)) {
            die("Failed to create folders...");
        }
        Checker::createXMLfile($params);
        $c = 0;
        foreach ($_SESSION["pages_" . $params["taskсode"]] as $key => $value) {
            $fp = fopen($structure . "{$c}.jpg", "w");
            $data = explode(",", $value);
            fwrite($fp, base64_decode($data[1]));
            fclose($fp);
            $zip->addFile($params["name"] . "/epackages.xml");
            $zip->addFile($structure . "{$c}.jpg");
            $c++;
        }
        //Завершаем работу с архивом
        $zip->close();
        Checker::rrmdir($params["name"]);
        //Удаляем сессию
        session_destroy();
        return '{"status": "DONE","url": "' . $params["name"] . '.zip' . '"}';
    }

    /**
     * Создание XML файла
     * @param array $params массив данных переданных в $_POST
     */
    private function createXMLfile($params)
    {
        $file = $params["name"] . "/epackages.xml";
        $fp = fopen($file, "w");
        $content = Checker::createXMLcontent($params);
        fwrite($fp, $content);
        fclose($fp);
        return;
    }

    /**
     * Создание XML содержания файла
     * @param array $params массив данных переданных в $_POST
     * @return string
     */
    private function createXMLcontent($params)
    {
        $str = '<packages>' . "\r\n";
        $str .= '    <package type="checked">' . "\r\n";
        $str .= '        <packagename>Solutions</packagename>' . "\r\n";
        $str .= '        <packagecreator>RMU 1.0</packagecreator>' . "\r\n";
        $str .= '        <packagecreated>' . $params["datetime"] . '</packagecreated>' . "\r\n";
        $str .= '        <jobcomment>' . $params["comment"] . '</jobcomment>' . "\r\n";
        $str .= '        <pages>' . "\r\n";
        $c = 0;
        foreach ($_SESSION["pages_" . $params["taskсode"]] as $key => $value) {
            $str .= '            <page>' . "\r\n";
            $str .= '                <code>' . str_pad($key, 11, "0", STR_PAD_LEFT) . str_pad($params["tutor"], 11, "0", STR_PAD_LEFT) . '</code>' . "\r\n";
            $str .= '                <image>package0/images/' . $c . '.jpg</image>' . "\r\n";
            $str .= '                <conform_template>yes</conform_template>' . "\r\n";
            $str .= '            </page>' . "\r\n";
            $c++;
        }
        $str .= '        </pages>' . "\r\n";
        $str .= '        <files></files>' . "\r\n";
        $str .= '    </package>' . "\r\n";
        $str .= '</packages>' . "\r\n";
        return $str;
    }

    /**
     * Удаление директории рекурсивно
     */
    private function rrmdir($dir)
    {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir . "/" . $object))
                        Checker::rrmdir($dir . "/" . $object);
                    else
                        unlink($dir . "/" . $object);
                }
            }
            rmdir($dir);
        }
    }

}

?>