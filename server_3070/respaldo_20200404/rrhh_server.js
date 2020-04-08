// console.log("hola mundo");
var express = require('express');
var app = express();
var dbconex = require('./conexion_mssql.js');
var reg = require('./registrar.js');
var nodemailer = require('nodemailer');
var htmlCorreos = require('./direcciones_mail.js');
var base642pdf = require('base64topdf');
var path = require('path');
var wkhtmltopdf = require('insane-wkhtmltopdf');
var fs = require("fs");
var fileExist = require('file-exists');
var cors = require('cors');

// Habilitacion de cors (sacada de https://github.com/jsanta/api-starter/blob/develop/index.js )
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Token', 'X-RefreshToken'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
//
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// carpeta de imagenes: desde donde se levanta el servidor es esta ruta -> /root/trial-server-001/public
// app.use(express.static('public'));
publicpath = path.resolve(__dirname, 'public');
app.use('/static', express.static( publicpath ));
CARPETA_PDF = publicpath + '/pdf/';

app.set('port', 3070);
var server = app.listen(3070, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Escuchando http-server en el puerto: %s", port);
});

// dejare el server myssql siempre activo
var sql = require('mssql');
var conex = sql.connect(dbconex);

app.post('/newUser',
    function(req, res) {
        console.log("/newUser ", req.body);
        reg.newUser(sql, req.body)
            .then(function(data) {
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/newUser ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });

app.post('/validarUser',
    function(req, res) {
        console.log("/validarUser ", req.body);
        reg.validarUser(sql, req.body)
            .then(function(data) {
                //
                if (data[0].resultado === true) {
                    res.json({ resultado: 'ok', datos: data });
                } else {
                    res.json({ resultado: 'error', datos: data[0].mensaje });
                }
            })
            .catch(function(err) {
                console.log("/validarUser ", err);
                res.json({ resultado: 'error', datos: err });
            });
    });

app.post('/leerFicha',
    function(req, res) {
        console.log("/leerFicha ", req.body);
        reg.leerFicha(sql, req.body)
            .then(function(data) {
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerFicha ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });

app.post('/liquidaciones',
    function(req, res) {
        console.log("/liquidaciones ", req.body);
        reg.leerLiquidaciones(sql, req.body)
            .then(function(data) {
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerFicha ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerPDFLiquidacion',
    function(req, res) {
        console.log("/leerPDFLiquidacion ", req.body);
        reg.getBase64(sql, req.body.idpdf)
            .then(function(data) {
                //
                var filename = `liq_${req.body.ficha.trim()}_${req.body.filename }.pdf`;
                var fullpath = path.join(CARPETA_PDF, filename);
                //
                var base64_pdf = base642pdf.base64Decode(data, fullpath);
                res.json({ resultado: 'ok', datos: filename, base64: base64_pdf });
                //
            })
            .catch(function(err) {
                console.log("/leerPDFLiquidacion ", err);
                res.json({ resultado: 'error', datos: err });
            });
    });

app.post('/leerVacaciones',
    function(req, res) {
        console.log("/leerVacaciones ", req.body);
        reg.leerVacaciones(sql, req.body)
            .then(function(data) {
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("leerVacaciones ", err);
                res.json({ resultado: 'error', datos: err });
            });
    });

app.post('/leerDetalleVacaciones',
    function(req, res) {
        console.log("/leerDetalleVacaciones ", req.body);
        reg.leerDetalleVacaciones(sql, req.body)
            .then(function(data) {
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("leerDetalleVacaciones ", err);
                res.json({ resultado: 'error', datos: err });
            });
    });


app.post('/leerCertAntiguedad',
    function(req, res) {
        //
        console.log("/leerCertAntiguedad >>> ", req.body);
        //
        reg.getBase64Cert(sql, req.body.key, req.body.ficha)
            .then(function(data) {

                var filenamePDF = `cert_antig_${req.body.ficha.trim()}.pdf`;
                var filenameHTM = `cert_antig_${req.body.ficha.trim()}.html`;
                var fullpathPDF = path.join(CARPETA_PDF, filenamePDF);
                var fullpathHTM = path.join(CARPETA_PDF, filenameHTM);

                contruyeHTML(data, fullpathHTM)
                    .then(htmlContent => {
                        console.log('HTML creado');
                        try {
                            //
                            wkhtmltopdf(
                                htmlContent, {
                                    output: fullpathPDF,
                                    pageSize: 'letter',
                                    noBackground: true
                                },
                                (err, stream) => {
                                    // console.log(stream);
                                    if (err) {
                                        console.error('No se pudo generar el PDF ', fullpathPDF, err);
                                        res.status(500).json({ resultado: 'error', datos: err });
                                    } else {
                                        res.status(200).json({ resultado: 'ok', datos: filenamePDF, base64: fullpathPDF });
                                    }
                                }
                            );
                        } catch (error) {
                            console.error('Error!', error);
                            console.error('/leerCertAntiguedad ', error);
                            res.status(500).json({ resultado: 'error', datos: error });
                        }
                        //
                    }, (err) => {
                        console.error(err);
                        res.status(500).json({ resultado: 'error', datos: err });
                    });
            })
            .catch(function(err) {
                console.log("/leerCertAntiguedad cath() >>>", err);
                res.status(500).json({ resultado: 'error', datos: err });
            });
    });
contruyeHTML = function(data, fullpathHTM) {
    //
    return new Promise(resolve => {
            //
            var buff = new Buffer(data[0].archivo, 'base64');
            var xHTML = buff.toString('ascii');
            // console.log(xHTML);
            //
            xHTML = xHTML.replace('##logo##', 'https://kinetik.cl/rrhh01/img/varso_logo.png');
            xHTML = xHTML.replace('##firma##', 'https://kinetik.cl/rrhh01/img/varso_firma.png');
            xHTML = xHTML.replace('##nombres##', data[0].nombres);
            xHTML = xHTML.replace('##rut##', data[0].rut);
            xHTML = xHTML.replace('##fecha_ingreso##', data[0].fechaingreso);
            xHTML = xHTML.replace('##labor##', data[0].labor);
            xHTML = xHTML.replace('##dia_hoy##', data[0].dia_hoy);
            xHTML = xHTML.replace('##mes_hoy##', data[0].mes_hoy);
            xHTML = xHTML.replace('##anno_hoy##', data[0].anno_hoy);

            fs.writeFile(fullpathHTM, xHTML, { encoding: 'utf-8' }, errData => {
                // console.log(errData);
                if (!errData) {
                    if (fileExist.sync(fullpathHTM)) {
                        console.log('Archivo existe ', fullpathHTM);
                        // El archivo no se necesita para convertirlo a PDF, basta pasarle el contenido html
                        resolve(xHTML);
                    }
                } else {
                    // throw Error(errData);
                    resolve();
                }
            });
        },
        reject => {
            reject('Algo paso....');
        }
    );
    //
};

app.post('/enviarPDF',
    async function(req, res) {
        console.log("/enviarPDF ", req.body);
        //
        var delBody = htmlCorreos.default_header;
        delBody = delBody.replace('##default_body##', htmlCorreos.PDF_body);
        delBody = delBody.replace('##ficha##', req.body.codigo);
        delBody = delBody.replace('##nombres##', req.body.nombres);
        delBody = delBody.replace('##periodo##', req.body.periodo);
        // cuando envío por gmail
        // var transporter = nodemailer.createTransport({service: 'Gmail', auth: {user: htmlCorreos.sender, pass: htmlCorreos.sender_psw } });
        // datos del enviador, original
        var transporter = nodemailer.createTransport({
            host: "vps-150899.gloryeta.cl",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: htmlCorreos.sender,
                pass: htmlCorreos.sender_psw
            }
        });
        // opciones del correo
        var mailOptions = {
            from: { name: "miMandala", address: htmlCorreos.sender },
            to: req.body.to,
            cc: req.body.cc,
            subject: (req.body.subject === '' || req.body.subject === undefined) ? 'Envío de archivo PDF' : req.body.subject,
            html: delBody,
            attachments: [{
                filename: req.body.filename,
                path: path.join(CARPETA_PDF, req.body.filename)
            }]
        };
        // enviar el correo
        var info = await transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log('error en sendmail->', error);
                res.json({ resultado: 'error', mensaje: error.message });
            } else {
                console.log("Email PDF a -> ", req.body.to);
                console.log("Email PDF con copia -> ", req.body.cc);
                //
                res.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + req.body.to });
                //
                reg.guardaSolicitud(sql, req.body.codigo, 'PDF', 'PDF: ' + req.body.periodo, req.body.to, req.body.cc, true)
                    .then(x => null);
                //
            }
        });
    });

app.post('/pedirAnticipo',
    function(req, res) {
        console.log('/pedirAnticipo', req.body);
        reg.leerFicha(sql, req.body)
            .then(function(data) {
                enviarCorreoAnticipo(req, res, data);
            })
            .catch(function(err) {
                console.log("/pedirAnticipo ", err);
                res.json({ resultado: 'error', datos: err });
            });
    });
enviarCorreoAnticipo = function(req, res, data) {
    //
    sender = htmlCorreos.sender;
    psswrd = htmlCorreos.sender_psw;
    //
    cTo = htmlCorreos.anticipos;
    cCc = htmlCorreos.anticipos_cc;
    cSu = 'Solicitud de Anticipo : ' + data[0].nombres;
    // cambiar formnato
    var xmonto = new Intl.NumberFormat("en-EU").format(req.body.monto);
    //
    var delBody = htmlCorreos.default_header;
    delBody = delBody.replace('##default_body##', htmlCorreos.anticipos_body);
    delBody = delBody.replace('##ficha##', data[0].codigo);
    delBody = delBody.replace('##rut##', data[0].rut);
    delBody = delBody.replace('##nombres##', data[0].nombres);
    delBody = delBody.replace('##monto##', xmonto);
    delBody = delBody.replace('##fecha##', req.body.fecha);
    // cuando envío por gmail
    // var transporter = nodemailer.createTransport({service: 'Gmail', auth: {user: htmlCorreos.sender, pass: htmlCorreos.sender_psw } });
    // datos del enviador, original
    var transporter = nodemailer.createTransport({
        host: "vps-150899.gloryeta.cl",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: htmlCorreos.sender,
            pass: htmlCorreos.sender_psw
        }
    });
    // opciones del correo
    var mailOptions = {
        from: { name: "miMandala", address: htmlCorreos.sender },
        to: cTo,
        cc: cCc,
        subject: cSu,
        html: delBody
    };
    // enviar el correo
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('error en sendmail->', error);
            res.json({ resultado: 'error', mensaje: error.message });
        } else {
            console.log("Email anticipo a -> ", cTo);
            console.log("Email anticipo con copia -> ", cCc);
            //
            res.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
            //
            reg.guardaSolicitud(sql, data[0].codigo, 'Anticipo', 'anticipo: ' + req.body.monto.toString() + ', para el dia ' + req.body.fecha, cTo, cCc)
                .then(x => null);
        }
    });
};

app.post('/leerMensajes',
    function(req, res) {
        //
        reg.leermensajes(sql, req.body.ficha)
            .then(function(data) {
                // console.log("/validarUser ",data);
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerMensajes ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });

app.post('/cierraMensaje',
    function(req, res) {
        //
        reg.cerrarmensaje(sql, req.body.id)
            .then(function(data) {
                // console.log("/validarUser ",data);
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/cerrarmensaje ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });

app.post('/cambiarDatosFicha',
    function(req, res) {
        //
        console.log(req.body);
        reg.leerFicha(sql, req.body)
            .then(function(data) {
                console.log("/cambiarDatosFicha ", data[0]);
                enviarCorreoCambio(req, res, data);
            })
            .catch(function(err) {
                console.log("/cambiarDatosFicha ", err);
                res.json({ resultado: 'error', datos: err });
            });
    });
enviarCorreoCambio = function(req, res, data) {
    //
    sender = htmlCorreos.sender;
    psswrd = htmlCorreos.sender_psw;
    //
    cTo = htmlCorreos.cambios;
    cCc = htmlCorreos.cambios_cc;
    cSu = 'Solicitud de Actualizacion de datos personales : ' + data[0].nombres;
    //
    var delBody = htmlCorreos.default_header;
    delBody = delBody.replace('##default_body##', htmlCorreos.cambios_body(req.body.caso));
    delBody = delBody.replace('##ficha##', data[0].codigo);
    delBody = delBody.replace('##rut##', data[0].rut);
    delBody = delBody.replace('##nombres##', data[0].nombres);
    if (req.body.caso === 'domicilio') {
        delBody = delBody.replace('##direccion##', req.body.dato1);
        delBody = delBody.replace('##ciudad##', req.body.dato2);
        delBody = delBody.replace('##comuna##', req.body.dato3);
    } else if (req.body.caso === 'numero') {
        delBody = delBody.replace('##numero##', req.body.dato1);
    } else if (req.body.caso === 'afp') {
        delBody = delBody.replace('##afp##', req.body.dato1);
    } else if (req.body.caso === 'isapre') {
        delBody = delBody.replace('##isapre##', req.body.dato1);
    }
    // cuando envío por gmail
    // var transporter = nodemailer.createTransport({service: 'Gmail', auth: {user: htmlCorreos.sender, pass: htmlCorreos.sender_psw } });
    // datos del enviador, original
    var transporter = nodemailer.createTransport({
        host: "vps-150899.gloryeta.cl",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: htmlCorreos.sender,
            pass: htmlCorreos.sender_psw
        }
    });
    // opciones del correo
    var mailOptions = {
        from: { name: "miMandala", address: htmlCorreos.sender },
        to: cTo,
        cc: cCc,
        subject: cSu,
        html: delBody
    };
    // enviar el correo
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('error en sendmail->', error);
            res.json({ resultado: 'error', mensaje: error.message });
        } else {
            console.log("Email cambio a -> ", cTo);
            console.log("Email cambio con copia -> ", cCc);
            //
            res.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
            //
            reg.guardaSolicitud(sql, data[0].codigo, 'Cambio : ' + req.body.caso, 'Cambiar: ' + req.body.dato1 + (req.body.dato2 ? ', ' + req.body.dato2 : '') + (req.body.dato3 ? ', ' + req.body.dato3 : ''), cTo, cCc)
                .then(x => null);
        }
    });
};

app.post('/leerRegiones',
    function(req, res) {
        //
        reg.regiones(sql)
            .then(function(data) {
                // console.log("/leerRegiones ",data);
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerRegiones ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerCiudades',
    function(req, res) {
        //
        reg.ciudades(sql, req.body.region)
            .then(function(data) {
                // console.log("/leerCiudades ",data);
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerCiudades ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerComunas',
    function(req, res) {
        //
        reg.comunas(sql, req.body.region)
            .then(function(data) {
                // console.log("/leerComunas ",data);
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerComunas ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerIsapres',
    function(req, res) {
        //
        reg.isapres(sql)
            .then(function(data) {
                console.log("/leerIsapres ", data);
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerIsapres ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerAfps',
    function(req, res) {
        //
        reg.afps(sql)
            .then(function(data) {
                console.log("/leerAfps ", data);
                res.json({ resultado: 'ok', datos: data });
            })
            .catch(function(err) {
                console.log("/leerAfps ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
//
app.post('/pedirVacaciones',
    function(req, res) {
        console.log('/pedirVacaciones', req.body);
        reg.leerFicha(sql, req.body)
            .then(
                function(data) {
                    console.log('enviar correo...');
                    enviarCorreoVacaciones(req, res, data);
                })
            .catch(
                function(err) {
                    console.log("/pedirVacaciones ", err);
                    res.json({ resultado: 'error', datos: err });
                });
    });
enviarCorreoVacaciones = function(req, response, data) {
    //
    sender = htmlCorreos.sender;
    psswrd = htmlCorreos.sender_psw;
    //
    cTo = htmlCorreos.vacaciones;
    cCc = htmlCorreos.vacaciones_cc;
    cSu = 'Solicitud de Vacaciones : ' + data[0].nombres;
    //
    var delBody = htmlCorreos.default_header;
    delBody = delBody.replace('##default_body##', htmlCorreos.vacaciones_body);
    delBody = delBody.replace('##ficha##', data[0].codigo);
    delBody = delBody.replace('##rut##', data[0].rut);
    delBody = delBody.replace('##nombres##', data[0].nombres);
    delBody = delBody.replace('##desde##', req.body.desde);
    delBody = delBody.replace('##hasta##', req.body.hasta);
    delBody = delBody.replace('##dias##', req.body.dias);
    // cuando envío por gmail
    // var transporter = nodemailer.createTransport({service: 'Gmail', auth: {user: htmlCorreos.sender, pass: htmlCorreos.sender_psw } });
    // datos del enviador, original
    var transporter = nodemailer.createTransport({
        host: "vps-150899.gloryeta.cl",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: htmlCorreos.sender,
            pass: htmlCorreos.sender_psw
        }
    }); // opciones del correo
    var mailOptions = {
        from: { name: "miMandala", address: htmlCorreos.sender },
        to: cTo,
        cc: cCc,
        subject: cSu,
        html: delBody
    };
    // enviar el correo
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('error en sendmail->', error);
            response.json({ resultado: 'error', mensaje: error.message });
        } else {
            //
            console.log("Email vacaciones a -> ", cTo);
            console.log("Email vacaciones con copia -> ", cCc);
            //
            response.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
            //
            reg.guardaSolicitud(sql, data[0].codigo, 'Vacaciones', 'desde: ' + req.body.desde + ', hasta ' + req.body.hasta, cTo, cCc)
                .then(x => null);
            //        
        }
    });
};

app.post('/leerLicencias',
    function(req, res) {
        //
        console.log('/leerLicencias');
        reg.licenciasMedicas(sql, req.body.ficha)
            .then(function(data) {
                console.log("/leerLicencias ", data);
                if (data.ok) {
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    console.log("/leerLicencias ", data.datos);
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerLicencias ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });

app.post('/informarLicencia',
    function(req, res) {
        console.log('/informarLicencia', req.body);
        reg.leerFicha(sql, req.body)
            .then(
                function(data) {
                    console.log('enviar correo...');
                    enviarCorreoLicencia(req, res, data);
                })
            .catch(
                function(err) {
                    console.log("/informarLicencia ", err);
                    res.json({ resultado: 'error', datos: err });
                });
    });
enviarCorreoLicencia = function(req, response, data) {
    //
    sender = htmlCorreos.sender;
    psswrd = htmlCorreos.sender_psw;
    //
    cTo = htmlCorreos.licencias;
    cCc = htmlCorreos.licencias_cc;
    cSu = 'Licencia médica : ' + data[0].nombres;
    //
    var delBody = htmlCorreos.default_header;
    delBody = delBody.replace('##default_body##', htmlCorreos.licencias_body);
    delBody = delBody.replace('##ficha##', data[0].codigo);
    delBody = delBody.replace('##rut##', data[0].rut);
    delBody = delBody.replace('##nombres##', data[0].nombres);
    delBody = delBody.replace('##desde##', req.body.desde);
    delBody = delBody.replace('##hasta##', req.body.hasta);
    delBody = delBody.replace('##dias##', req.body.dias);
    delBody = delBody.replace('##comentario##', req.body.comentario);
    // cuando envío por gmail
    // var transporter = nodemailer.createTransport({service: 'Gmail', auth: {user: htmlCorreos.sender, pass: htmlCorreos.sender_psw } });
    // datos del enviador, original
    var transporter = nodemailer.createTransport({
        host: "vps-150899.gloryeta.cl",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: htmlCorreos.sender,
            pass: htmlCorreos.sender_psw
        }
    });
    // opciones del correo
    var mailOptions = {
        from: { name: "miMandala", address: htmlCorreos.sender },
        to: cTo,
        cc: cCc,
        subject: cSu,
        html: delBody
    };
    // enviar el correo
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('error en sendmail->', error);
            response.json({ resultado: 'error', mensaje: error.message });
        } else {
            //
            console.log("Email licencia a -> ", cTo);
            console.log("Email licencia con copia -> ", cCc);
            //
            response.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
            //
            reg.guardaSolicitud(sql, data[0].codigo, 'Licencia médica', 'desde: ' + req.body.desde + ', hasta ' + req.body.hasta + ', comentarios: ' + req.body.comentario, cTo, cCc)
                .then(x => null);
            //        
        }
    });
};