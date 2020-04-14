// debo cambiarlo por ksp_
var conector = require('./conexion_mssql.js');

module.exports = {
    // cada funncion se separa por comas  
    creartablas: function(sqlpool) {
        //
        var request = new sqlpool[1].Request();
        request.query("exec ksp_Crear_Tablas ; ")
            .then(function() { console.log("creacion de tablas OK "); })
            .catch(function(er) { console.log('error al crear tablas -> ' + er); });
        //
    },
    //
    changePass: function(empresa, sqlpool, body) {
        //
        var query = "exec ksp_cambiarPass '" + body.rut + "', '" + body.claveActual + "','" + body.clave + "' ;";
        console.log(empresa, query, conector[empresa]);
        //
        // sql.close();
        return sqlpool[empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                // console.log(resultado);
                if (resultado.recordset[0].resultado === true) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
    },
    //
    validarUser: function(empresa, sqlpool, body) {
        //
        var query = "exec ksp_validarUsuario '" + body.rut + "', '" + body.clave + "' ;";
        console.log(empresa, query, conector[empresa]);
        //
        // sql.close();
        return sqlpool[empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                // console.log(resultado);
                return { resultado: 'ok', datos: resultado.recordset };
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
    },
    //
    leerFicha: function(sqlpool, body) {
        // 
        var query = "exec ksp_leerFicha '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
    },
    //      
    leerLiquidaciones: function(sqlpool, body) {
        //
        var query = "exec ksp_leerMisLiquidaciones '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
    },
    //  
    getBase64: function(sqlpool, body) {
        //
        var query = "exec ksp_get1base64 " + body.idpdf.toString() + " ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset[0].pdfbase64 };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });

    },
    //  
    leerVacaciones: function(sqlpool, body) {
        //
        var query = "exec ksp_vacaciones '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
    },
    //  
    leerDetalleVacaciones: function(sqlpool, body) {
        //
        var query = "exec ksp_detalle_Vacaciones '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //
    guardaSolicitud: function(empresa, sqlpool, ficha, tipo, dato, cTo, cCc, cerrado) {
        //
        console.log('guardaSolicitud()');
        if (cerrado === undefined) {
            cerrado = false;
        }
        if (cCc === undefined) {
            cCc = '';
        }
        //
        var query = "exec ksp_guardaSolicitud '" + ficha + "','" + tipo + "','" + dato + "','" + cTo + "','" + cCc + "', " + (cerrado ? '1' : '0') + "  ;";
        console.log(empresa, query, conector[empresa]);
        //
        // sql.close();
        return sqlpool[empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //
    leermensajes: function(sqlpool, body) {
        //
        var query = "exec ksp_leerMisMensajes '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'nodata', datos: [] };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //  
    cerrarmensaje: function(sqlpool, body) {
        //
        var query = "exec ksp_cerrarMensaje " + body.id.toString() + " ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //  
    regiones: function(sqlpool, body) {
        //
        var query = "exec ksp_getRegiones ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //  
    ciudades: function(sqlpool, body) {
        //
        var query = "exec ksp_getCiudades '" + body.region + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //  
    comunas: function(sqlpool, body) {
        //
        var query = "exec ksp_getComunas '" + body.region + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //  
    isapres: function(sqlpool, body) {
        //
        var query = "exec ksp_getIsapres ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //  
    afps: function(sqlpool, body) {
        //
        var query = "exec ksp_getAfps ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //
    getBase64Cert: function(sqlpool, body) {
        //
        var query = "exec ksp_get1base64Cert '" + body.key + "', '" + body.ficha + "' ;";
        console.log('getBase64Cert >>>> ', body.key, body.ficha);
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'error', datos: resultado.recordset };
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    //  
    licenciasMedicas: function(sqlpool, body) {
        //
        var query = "exec ksp_licencMedic '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        // sql.close();
        return sqlpool[body.empresa]
            .then(pool => {
                return pool.request()
                    .query(query);
            })
            .then(resultado => {
                if (resultado.recordset[0]) {
                    return { resultado: 'ok', datos: resultado.recordset };
                } else {
                    return { resultado: 'nodata', datos: resultado.recordset }; // experimento.... 12/04/2020
                }
            })
            .catch(err => {
                console.log(err);
                return { resultado: 'error', datos: err };
            });
        //
    },
    // 
};


/* funciones originales 

    original_validarUser: function(sql, body) {
        //
        var request = new sql.Request();
        //
        return request.query("exec ksp_validarUsuario '" + body.rut + "', '" + body.clave + "' ;")
            .then(function(results) {
                return results.recordset;
            })
            .catch(function(er) {
                return er;
            });
    },
    //
    newUser: function(sql, body) {
        //
        var request = new sql.Request();
        //
        return request.query("exec ksp_crearUsuario '" + body.rut + "', '" + body.clave + "' ;")
            .then(function(results) {
                return results.recordset;
            });
    },
    //       

*/