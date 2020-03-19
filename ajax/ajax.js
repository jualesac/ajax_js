"use strict";
/*
 * FECHA: 2018/12/20
 * AUTOR: Julio Alejandro Santos Corona
 * CORREO: jualesac@yahoo.com
 * TÍTULO: ajax.js
 *
 * Descripción: Librería que simplifica el uso de una petición AJAX.
 *
 * Reedición: 2019/03/12
 * Versión: 1.2. La versión anterior utilizaba el objeto XMLHttpRequest.
*/

var AJAX = {
    AJAX: function (staticURL) {
        staticURL = (staticURL === "STATIC_URL" ? true : false) || false;

        //let RUTA = location.href.replace (/\#/, "").trim () + `php/index.php`;
        let RUTA = `../php/index.php`;
        let RUTA_DEFAULT = "";
        let HEADERS = new Headers ();
        let errorCatch;

        errorCatch = function () {
            console.log ({ type: "error", message: "Ocurrió un problema con la petición al servidor." });
        };



        this.header = HEADERS;


        this.use = function (ruta) {
            RUTA = ruta.replace (/\#|\/$/, "").trim ();
        };


        this.useDefault = function (ruta) {
            RUTA_DEFAULT = ruta.replace (/\#|\/$/, "").trim ();
        }


        this.catch = function (callback) {
            callback = callback || function (err) { console.log ({ type: "error", message: "Ocurrió un problema con la petición al servidor." }); };

            errorCatch = callback;
        }


        this.get = function (callback, valores, url) {
            if (typeof (valores) === "string") {
                url = valores;
                valores = undefined;
            }

            callback = callback || function (datos) { return datos; };
            valores = valores || {};

            let stringValores = JSONStringURL (valores);
            let parametros = {
                method: "GET",
                headers: HEADERS
            };

            if (stringValores !== "") {
                url = url + `?${stringValores}`;
            }

            peticion (url, parametros, callback);
        };


        this.post = function (callback, valores, url) {
            send ("POST", url, valores, callback);
        };


        this.put = function (callback, valores, url) {
            send ("PUT", url, valores, callback);
        };


        this.delete = function (callback, valores, url) {
            send ("DELETE", url, valores, callback);
        };


        this.form = function (callback, idOFormData, url) {
            callback = callback || function (datos) { return datos; };

            let formulario;
            let parametros;
            let content;

            formulario = (idOFormData instanceof FormData) ? idOFormData : new FormData (document.getElementById (idOFormData));
            content = HEADERS.get ("Content-Type");

            HEADERS.delete ("Content-Type");

            parametros = {
                method: "POST",
                body: formulario,
                headers: HEADERS
            };

            peticion (url, parametros, callback);

            if (content != "") {
                HEADERS.append ("Content-Type", content);
            }
        };


        this.text = function (callback, content, url) {
            let parametros;

            parametros = {
                method: "GET",
                Content: content
            };

            fetch (url, parametros).then (function (res) {
                if (res.ok) {
                    return res.text ();
                }
            }).then (function (page) {
                callback (page);
            }).catch (function (err) {
                if (!(err instanceof Error)) {
                    errorCatch (err);
                } else {
                    console.log ({ type: "error", message: err });
                }
             });
        };


        function send (metodo, url, valores, callback) {
            callback = callback || function (datos) { return datos; };
            valores = valores || {};

            let parametros = {
                method: metodo,
                body: JSONStringURL (valores),
                headers: HEADERS
            };

            peticion (url, parametros, callback);
        }


        function peticion (url, parametros, callback) {
            url = ((staticURL ? (RUTA + RUTA_DEFAULT + (url || "")) : RUTA_DEFAULT + url) || RUTA + RUTA_DEFAULT);

            let status;

            fetch (url, parametros).then (function (res) {
                if (res.ok) {
                    status = res.status;

                    if (res.status != 204 && res.status != 205) {
                        return res.json ();
                    }

                    callback (res, status);
                } else {
                    throw res;
                }
            }).then (function (datos) {
                if (datos == undefined) { return; };

                callback (datos, status);
            }).catch (function (err) {
                if (!(err instanceof Error)) {
                    errorCatch (err);
                } else {
                    console.log (url, { type: "error", message: err });
                }
             });
        }


        function JSONStringURL (valores) {
            let val = [];

            for (let v in valores) {
                val.push (`${v}=${encodeURIComponent (valores[v])}`);
            }

            return val.join ("&");
        }
    }
};
