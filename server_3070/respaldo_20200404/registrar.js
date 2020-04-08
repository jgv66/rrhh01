// debo cambiarlo por ksp_

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
    validarUser: function(sql, body) {
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
    leerFicha: function(sql, body) {
        //
        var request = new sql.Request();
        //
        return request.query("exec ksp_leerFicha '" + body.ficha + "' ;")
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    guardaSolicitud: function(sql, ficha, tipo, dato, cTo, cCc, cerrado) {
        //
        console.log('aqui en guardaSolicitud()');
        var request = new sql.Request();
        if (cerrado === undefined) {
            cerrado = false;
        }
        if (cCc === undefined) {
            cCc = '';
        }
        //
        var query = "exec ksp_guardaSolicitud '" + ficha + "','" + tipo + "','" + dato + "','" + cTo + "','" + cCc + "', " + (cerrado ? '1' : '0') + "  ;";
        console.log(query);
        return request.query(query)
            .then(function(results) {
                return results.recordset;
            });
    },
    //
    leermensajes: function(sql, ficha) {
        //
        var request = new sql.Request();
        //
        return request.query("exec ksp_leerMisMensajes '" + ficha + "' ;")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    cerrarmensaje: function(sql, id) {
        //
        var request = new sql.Request();
        //
        return request.query("exec ksp_cerrarMensaje " + id.toString() + " ;")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
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
    //  
    leerLiquidaciones: function(sql, body) {
        //
        var request = new sql.Request();
        //
        return request.query("exec ksp_leerMisLiquidaciones '" + body.ficha + "' ;")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    leerVacaciones: function(sql, body) {
        //
        var request = new sql.Request();
        //
        return request.query("exec ksp_vacaciones '" + body.ficha + "' ;")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    leerDetalleVacaciones: function(sql, body) {
        //
        var request = new sql.Request();
        //
        return request.query("select * from ARE_VacAsigDetalle  where ficha ='" + body.ficha + "' order by adesde desc ;")
            .then(function(results) {
                // console.log(results);
                return results.recordset;
            });
    },
    //  
    getBase64: function(sql, id) {
        //
        console.log('getBase64', id);
        var request = new sql.Request();
        //
        return request.query("exec ksp_get1base64 " + id.toString() + " ;")
            .then(function(results) {
                return results.recordset[0].pdfbase64;

            });
    },
    //  
    getBase64Cert: function(sql, key, ficha) {
        //
        console.log('getBase64Cert >>>> ', key, ficha);
        var request = new sql.Request();
        //
        return request.query("exec ksp_get1base64Cert '" + key + "', '" + ficha + "' ;")
            .then(function(results) {
                // console.log('saliendo de getBase64Cert');
                return results.recordset;
            });
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