// console.log("hola mundo");
var express = require('express');
var app = express();
var dbconex = require('./conexion_mssql.js');
var archXemp = require('./archivos_por_empresa.js');
//
var nodemailer = require('nodemailer');
var base642pdf = require('base64topdf');
var path = require('path');
var wkhtmltopdf = require('insane-wkhtmltopdf');
var fs = require("fs");
var fileExist = require('file-exists');
var cors = require('cors');
//
var reg = require('./registrar.js');
var htmlCorreos = require('./direcciones_mail.js');

var usuarios = [];

// Habilitacion de cors (sacada de https://github.com/jsanta/api-starter/blob/develop/index.js )
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'], // , 'PUT', 'DELETE'
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
app.use('/static', express.static(publicpath));
CARPETA_PDF = publicpath + '/pdf/';
FACTURACION = publicpath + '/facturacion/concurrencia.json'; // archivo usado para registrar concurrencia de usuarios

app.set('port', 3070);
var server = app.listen(3070, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Escuchando http-server en el puerto: %s", port);
});

// coneccion a la BD
const sql = require('mssql');
// pool de conexiones... forma 1 
var pool = Array(4);
var sqlpool = Array(4);
//
pool[1] = new sql.ConnectionPool(dbconex[1]);
sqlpool[1] = pool[1].connect();
pool[1].on('error', err => console.log('bd-1', err));

pool[2] = new sql.ConnectionPool(dbconex[2]);
sqlpool[2] = pool[2].connect();
pool[2].on('error', err => console.log('bd-2', err));

pool[3] = new sql.ConnectionPool(dbconex[3]);
sqlpool[3] = pool[3].connect();
pool[3].on('error', err => console.log('bd-3', err));

// se leen todos los usuarios solo una vez para determinar 
// en la entrada cual es la empresa que lo contiene
let getUsuarios = async function() {
    //
    await sqlpool[3];
    await sqlpool[2];
    await sqlpool[1];
    //
    return new Promise((resolve, reject) => {
        //
        console.log('buscando usuarios');
        // sql.close();
        return sqlpool[1] /* la primera empresa tiene a todos los usuarios */
            .then(function(pool) {
                return pool.request()
                    .query("exec ksp_dameEmpresa '*todos*' ;");
            })
            .then(resultado => {
                resolve(resultado.recordset);
            })
            .catch(err => {
                reject([]);
            });
    });
};
// se asignan todos los usuarios a la matriz usuarios multi-empresa
getUsuarios().then(usrs => { usuarios = usrs; });

// buscar empresa en la matriz de usuarios
let getEmpresa = (rut) => {
    //
    return new Promise((resolve, reject) => {
        // console.log('buscando rut(1)', rut);
        var emp;
        usuarios.forEach(element => {
            if (element.rut === rut) {
                emp = element;
            }
        });
        // console.log('emp', emp);
        if (emp === undefined) {
            reject(0);
        } else {
            resolve(emp.id_empresa);
        }
    });
};
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> concurrencia de usuarios y su actividad
let registraActividad = (empresa, rut, actividad) => {
    //
    const fecha = new Date();
    const dia = ('0' + fecha.getDate().toString()).slice(-2);
    const mes = ('0' + (fecha.getMonth() + 1).toString()).slice(-2);
    const ano = fecha.getFullYear().toString();
    const hora = ('0' + fecha.getHours().toString()).slice(-2);
    const minu = ('0' + fecha.getMinutes().toString()).slice(-2);
    //
    var reg = `{ empresa: ${empresa}, rut: ${ rut }, fecha: ${ dia+'/'+mes+'/'+ano }, hora: ${ hora+':'+minu }, actividad: ${actividad} },\n`;
    //
    fs.appendFile(FACTURACION, reg,
        (err) => {});
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> web-services
app.post('/validarUser',
    function(req, res, usuarios) {
        //
        getEmpresa(req.body.rut)
            .then(empresa => {
                    console.log("/validarUser ", req.body, empresa);
                    reg.validarUser(empresa, sqlpool, req.body)
                        .then(function(data) {
                            //
                            if (data.resultado === 'ok') {
                                // concurrencia
                                registraActividad(empresa, req.body.rut, 'ingreso al sistema');
                                //
                                res.json({ resultado: 'ok', datos: data.datos });
                            } else {
                                res.json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
                            }
                        })
                        .catch(function(err) {
                            console.log("/validarUser ", err);
                            res.json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
                        });
                },
                () => {
                    res.json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
                });
    });

app.post('/cambiarClave',
    function(req, res) {
        getEmpresa(req.body.rut)
            .then(empresa => {
                    console.log("/cambiarClave ", req.body, empresa);
                    reg.changePass(empresa, sqlpool, req.body)
                        .then(function(data) {
                            //
                            if (data.resultado === 'ok') {
                                // concurrencia
                                registraActividad(empresa, req.body.rut, 'cambiarClave()');
                                //
                                res.json({ resultado: 'ok', datos: data.datos });
                            } else {
                                res.json({ resultado: 'error', datos: data.datos });
                            }
                        })
                        .catch(function(err) {
                            console.log("/cambiarClave ", err);
                            res.json({ resultado: 'error', datos: error });
                        });
                },
                (error) => {
                    res.json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
                });
    });

app.post('/leerFicha',
    function(req, res) {
        console.log("/leerFicha ", req.body);
        reg.leerFicha(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerFicha()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerFicha ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });

app.post('/liquidaciones',
    function(req, res) {
        console.log("/liquidaciones ", req.body);
        reg.leerLiquidaciones(sqlpool, req.body)
            .then(function(data) {
                //
                // console.log(data);
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'liquidaciones()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerFicha ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerPDFLiquidacion',
    function(req, res) {
        console.log("/leerPDFLiquidacion ", req.body);
        reg.getBase64(sqlpool, req.body)
            .then(function(data) {
                //
                var pdf = data.datos;
                var filename = `liq_${req.body.ficha.trim()}_${req.body.filename }.pdf`;
                var fullpath = path.join(CARPETA_PDF, filename);
                //
                var base64_pdf = base642pdf.base64Decode(pdf, fullpath);
                // concurrencia
                registraActividad(req.body.empresa, req.body.ficha, 'leerPDFLiquidacion() -> ' + filename);
                //
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
        reg.leerVacaciones(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerVacaciones()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("leerVacaciones ", err);
                res.json({ resultado: 'error', datos: err });
            });
    });
app.post('/leerDetalleVacaciones',
    function(req, res) {
        console.log("/leerDetalleVacaciones ", req.body);
        reg.leerDetalleVacaciones(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerDetalleVacaciones()');
                    //                    
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
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
        reg.getBase64Cert(sqlpool, req.body)
            .then(function(data) {
                //
                var filenamePDF = `cert_antig_${req.body.ficha.trim()}.pdf`;
                var filenameHTM = `cert_antig_${req.body.ficha.trim()}.html`;
                var fullpathPDF = path.join(CARPETA_PDF, filenamePDF);
                var fullpathHTM = path.join(CARPETA_PDF, filenameHTM);
                //
                contruyeHTML(data.datos, fullpathHTM, req.body.empresa)
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
                                // (err, stream) => {
                                (err) => {
                                    // console.log(stream);
                                    if (err) {
                                        console.error('No se pudo generar el PDF ', fullpathPDF, err);
                                        res.status(500).json({ resultado: 'error', datos: err });
                                    } else {
                                        // concurrencia
                                        registraActividad(req.body.empresa, req.body.ficha, 'leerCertAntiguedad() -> ' + filenamePDF);
                                        //                    
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
contruyeHTML = function(data, fullpathHTM, empresa) {
    //
    return new Promise(resolve => {
            //
            var buff = new Buffer(data[0].archivo, 'base64');
            var xHTML = buff.toString('ascii');
            // console.log(xHTML);
            // variables por empresa
            xHTML = xHTML.replace('##logo##', archXemp[empresa].imagen_cert_antig);
            xHTML = xHTML.replace('##firma##', archXemp[empresa].firma_cert_antig);
            xHTML = xHTML.replace('##razonsocial##', archXemp[empresa].razon_social_empresa);
            xHTML = xHTML.replace('##nombre-encargado-rrhh##', archXemp[empresa].nombre_encargado_rrhh);
            xHTML = xHTML.replace('##cargo-encargado-rrhh##', archXemp[empresa].cargo_encargado_rrhh);
            xHTML = xHTML.replace('##direccion_empresa_1##', archXemp[empresa].direccion_empresa_1);
            xHTML = xHTML.replace('##direccion_empresa_2##', archXemp[empresa].direccion_empresa_2);
            xHTML = xHTML.replace('##telefonos_empresa##', archXemp[empresa].telefonos_empresa);
            xHTML = xHTML.replace('##sitio_web_empresa##', archXemp[empresa].sitio_web_empresa);
            // variables por empleado
            xHTML = xHTML.replace('##nombres##', data[0].nombres);
            xHTML = xHTML.replace('##rut##', data[0].rut);
            xHTML = xHTML.replace('##fecha_ingreso##', data[0].fechaingreso);
            xHTML = xHTML.replace('##labor##', data[0].labor);
            xHTML = xHTML.replace('##dia_hoy##', data[0].dia_hoy);
            xHTML = xHTML.replace('##mes_hoy##', data[0].mes_hoy);
            xHTML = xHTML.replace('##anno_hoy##', data[0].anno_hoy);
            //
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
                reg.guardaSolicitud(req.body.empresa, sqlpool, req.body.codigo, 'PDF', 'PDF: ' + req.body.periodo, req.body.to, req.body.cc, true)
                    .then(x => null);
                // concurrencia
                registraActividad(req.body.empresa, req.body.ficha, 'enviarPDF(' + req.body.filename + ') -> ' + req.body.to);
                //                    
                res.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + req.body.to });
                //
            }
        });
    });

app.post('/pedirAnticipo',
    function(req, res) {
        console.log('/pedirAnticipo', req.body);
        reg.leerFicha(sqlpool, req.body)
            .then(function(data) {
                enviarCorreoAnticipo(req, res, data.datos);
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
    cTo = archXemp[req.body.empresa].anticipos;
    cCc = archXemp[req.body.empresa].anticipos_cc;
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
            reg.guardaSolicitud(req.body.empresa, sqlpool, data[0].codigo, 'Anticipo', 'anticipo: ' + req.body.monto.toString() + ', para el dia ' + req.body.fecha, cTo, cCc)
                .then(x => null);
            // concurrencia
            registraActividad(req.body.empresa, req.body.ficha, 'pedirAnticipo( ' + 'Ant: ' + req.body.monto.toString() + ', dia ' + req.body.fecha + ' ) -> ' + cTo);
            //                    
            res.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
            //
        }
    });
};

app.post('/leerMensajes',
    function(req, res) {
        //
        console.log("/leerMensajes ", req.body);
        reg.leermensajes(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok' || data.resultado === 'nodata') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerMensajes()');
                    //                    
                    res.json({ resultado: data.resultado, datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerMensajes ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/cierraMensaje',
    function(req, res) {
        //
        reg.cerrarmensaje(sqlpool, req.body)
            .then(function(data) {
                //
                // console.log(data);
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'cierraMensaje()');
                    //                       
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/cerrarmensaje ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });

app.post('/leerRegiones',
    function(req, res) {
        //
        reg.regiones(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerRegiones()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerRegiones ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerCiudades',
    function(req, res) {
        //
        reg.ciudades(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerCiudades()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerCiudades ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerComunas',
    function(req, res) {
        //
        reg.comunas(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerComunas()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerComunas ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerIsapres',
    function(req, res) {
        //
        reg.isapres(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerIsapres()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerIsapres ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerAfps',
    function(req, res) {
        //
        reg.afps(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerAfps()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
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
        reg.leerFicha(sqlpool, req.body)
            .then(
                function(data) {
                    enviarCorreoVacaciones(req, res, data.datos);
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
    cTo = archXemp[req.body.empresa].vacaciones;
    cCc = archXemp[req.body.empresa].vacaciones_cc;
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
            reg.guardaSolicitud(req.body.empresa, sqlpool, data[0].codigo, 'Vacaciones', 'desde: ' + req.body.desde + ', hasta ' + req.body.hasta, cTo, cCc)
                .then(x => null);
            // concurrencia
            registraActividad(req.body.empresa, req.body.ficha, 'pedirVacaciones( desde: ' + req.body.desde + ', hasta ' + req.body.hasta + ' ) -> ' + cTo);
            //                    
            response.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
            //
        }
    });
};

app.post('/leerLicencias',
    function(req, res) {
        //
        console.log('/leerLicencias');
        reg.licenciasMedicas(sqlpool, req.body)
            .then(function(data) {
                console.log("/leerLicencias ", data);
                if (data.resultado === 'ok' || data.resultado === 'nodata') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerLicencias()');
                    //                    
                    res.json({ resultado: data.resultado, datos: data.datos });
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
        // 
        reg.leerFicha(sqlpool, req.body)
            .then(
                function(data) {
                    enviarCorreoLicencia(req, res, data.datos);
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
    cTo = archXemp[req.body.empresa].licencias;
    cCc = archXemp[req.body.empresa].licencias_cc;
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
            reg.guardaSolicitud(req.body.empresa, sqlpool, data[0].codigo, 'Licencia médica', 'desde: ' + req.body.desde + ', hasta ' + req.body.hasta + ', comentarios: ' + req.body.comentario, cTo, cCc)
                .then(x => null);
            // concurrencia
            registraActividad(req.body.empresa, req.body.ficha, 'informarLicencia( desde: ' + req.body.desde + ', hasta ' + req.body.hasta + ' ) -> ' + cTo);
            //                    
            response.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
            //
        }
    });
};

app.post('/cambiarDatosFicha',
    function(req, res) {
        //
        console.log(req.body);
        reg.leerFicha(sqlpool, req.body)
            .then(function(data) {
                enviarCorreoCambio(req, res, data.datos);
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
    cTo = archXemp[req.body.empresa].cambios;
    cCc = archXemp[req.body.empresa].cambios_cc;
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
            reg.guardaSolicitud(req.body.empresa, sqlpool, data[0].codigo, 'Cambio : ' + req.body.caso, 'Cambiar: ' + req.body.dato1 + (req.body.dato2 ? ', ' + req.body.dato2 : '') + (req.body.dato3 ? ', ' + req.body.dato3 : ''), cTo, cCc)
                .then(x => null);
            // concurrencia
            registraActividad(req.body.empresa, req.body.ficha, 'enviarCorreoCambio( ' + req.body.caso + ' )');
            //                    
            res.json({ resultado: 'ok', mensaje: 'Correo ya se envió a ' + cTo });
        }
    });
};

app.post('/guardaGeoPos',
    function(req, res) {
        console.log("/guardaGeoPos ", req.body);
        reg.geoPos(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'guardaGeoPos()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/guardaGeoPos ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });
app.post('/leerGeoPos',
    function(req, res) {
        console.log("/leerGeoPos ", req.body);
        reg.leerGeoPos(sqlpool, req.body)
            .then(function(data) {
                //
                if (data.resultado === 'ok') {
                    // concurrencia
                    registraActividad(req.body.empresa, req.body.ficha, 'leerGeoPos()');
                    //
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.datos });
                }
            })
            .catch(function(err) {
                console.log("/leerGeoPos ", err);
                res.json({ resultado: 'error', datos: error });
            });
    });


// sql.close();
// sql.connect(dbconex[1]) 
//     .then(function(pool) {
//         return pool.request()
//             .query("exec ksp_dameEmpresa '*todos*' ;");
//     })
//     .then(resultado => {
//         resolve(resultado.recordset);
//     })
//     .catch(err => {
//         reject([]);
//     });


// app.post('/newUser',
//     function(req, res) {
//         console.log("/newUser ", req.body);
//         reg.newUser(sql, req.body)
//             .then(function(data) {
//                 res.json({ resultado: 'ok', datos: data });
//             })
//             .catch(function(err) {
//                 console.log("/newUser ", err);
//                 res.json({ resultado: 'error', datos: error });
//             });
//     });

// app.post('/validarUser_bueno',
//     function(req, res, usuarios) {
//         //
//         // sql.close();
//         sql.connect(dbconex[1]) /* la primera empresa tiene a todos los usuarios */
//         .then(function(pool) {
//             return pool.request()
//                 .query("exec ksp_dameEmpresa '" + req.body.rut + "' ;");
//         })
//         .then(resultado => {
//             // console.log('resultado.recordset', resultado.recordset);
//             try {
//                 var empresa = resultado.recordset[0].id_empresa;
//                 console.log("/validarUser ", req.body, empresa);
//                 reg.validarUser(empresa, sql, req.body)
//                     .then(function(data) {
//                         //
//                         // console.log(data);
//                         if (data.resultado === 'ok') {
//                             res.json({ resultado: 'ok', datos: data.datos });
//                         } else {
//                             res.json({ resultado: 'error', datos: data.mensaje });
//                         }
//                     })
//                     .catch(function(err) {
//                         console.log("/validarUser ", err);
//                         res.json({ resultado: 'error', datos: err });
//                     });

//             } catch (error) {
//                 res.json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
//             }
//         })
//         .catch(err => {
//             console.log(err);
//             return [];
//         });

// });