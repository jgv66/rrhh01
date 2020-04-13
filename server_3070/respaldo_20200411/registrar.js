// debo cambiarlo por ksp_
var conector = require('./conexion_mssql.js');

module.exports = {
    // cada funncion se separa por comas  
    creartablas: function(sql) {
        //
        var request = new sql.Request();
        request.query("exec ksp_Crear_Tablas ; ")
            .then(function() { console.log("creacion de tablas OK "); })
            .catch(function(er) { console.log('error al crear tablas -> ' + er); });
        //
    },
    //
    changePass: function(empresa, sql, body) {
        //
        var query = "exec ksp_cambiarPass '" + body.rut + "', '" + body.claveActual + "','" + body.clave + "' ;";
        console.log(empresa, query, conector[empresa]);
        //
        sql.close();
        return sql.connect(conector[empresa])
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
    validarUser: function(empresa, sql, body) {
        //
        var query = "exec ksp_validarUsuario '" + body.rut + "', '" + body.clave + "' ;";
        console.log(empresa, query, conector[empresa]);
        //
        sql.close();
        return sql.connect(conector[empresa])
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
    leerFicha: function(sql, body) {
        // 
        var query = "exec ksp_leerFicha '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    leerLiquidaciones: function(sql, body) {
        //
        var query = "exec ksp_leerMisLiquidaciones '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    getBase64: function(sql, body) {
        //
        var query = "exec ksp_get1base64 " + body.idpdf.toString() + " ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    leerVacaciones: function(sql, body) {
        //
        var query = "exec ksp_vacaciones '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    leerDetalleVacaciones: function(sql, body) {
        //
        var query = "exec ksp_detalle_Vacaciones '" + body.ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    guardaSolicitud: function(empresa, sql, ficha, tipo, dato, cTo, cCc, cerrado) {
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
        sql.close();
        return sql.connect(conector[empresa])
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
    leermensajes: function(sql, ficha) {
        //
        var query = "exec ksp_leerMisMensajes '" + ficha + "' ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    cerrarmensaje: function(sql, body) {
        //
        var query = "exec ksp_cerrarMensaje " + body.id.toString() + " ;";
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    regiones: function(sql) {
        //
        var request = new sql.Request();
        //
        return request.query("select distinct CodRegion as cod, NomRegion as nom FROM softland.soregiones where CodPais='CL' order by cod ;")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    ciudades: function(sql, region) {
        //
        var request = new sql.Request();
        //
        return request.query("select CodCiudad as cod,NomCiudad as nom FROM softland.sociudades where CodPais='CL' and CodRegion='" + region + "' order by nom ;")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    comunas: function(sql, region) {
        //
        var request = new sql.Request();
        //
        return request.query("select CodComuna as cod, NomComuna as nom FROM softland.socomunas as co where co.CodRegion='" + region + "' and CodPais='CL' order by nom ; ")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    isapres: function(sql) {
        //
        var request = new sql.Request();
        //
        return request.query(`select nombre as nom FROM softland.sw_isapre 
                              union
                              select 'Fonasa' as nom
                              order by nom ;`)
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    afps: function(sql) {
        //
        var request = new sql.Request();
        //
        return request.query("select nombre as nom FROM softland.sw_afp order by nom ; ")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    getBase64Cert: function(sql, body) {
        //
        var query = "exec ksp_get1base64Cert '" + body.key + "', '" + body.ficha + "' ;";
        console.log('getBase64Cert >>>> ', body.key, body.ficha);
        console.log(body.empresa, query, conector[body.empresa]);
        //
        sql.close();
        return sql.connect(conector[body.empresa])
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
    licenciasMedicas: function(sql, body) {
        //
        var request = new sql.Request();
        //
        console.log('reg.licenciasMedicas');
        return request.query("exec ksp_licencMedic '" + body.ficha + "' ;")
            .then(function(results) {
                console.log('resultado', results.recordset);
                return { ok: true, datos: results.recordset };
            })
            .catch(function(err) {
                return { ok: false, datos: err };
            });
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