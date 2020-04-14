// conexion a la base de jgv
module.exports = [
    { posicion: 0 },
    {
        empresa: 1, // principal
        user: 'sa',
        password: 'megatron.123',
        server: '200.113.49.181',
        port: 1433,
        database: 'BVARSOVIENNE',
        options: { encrypt: false }, // Use this if you're on Windows Azure
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 10000
        }
    },
    {
        empresa: 2, // siguientes empresas...
        user: 'sa',
        password: 'Softland2019',
        server: '190.151.5.131',
        port: 1433,
        database: 'REDHAT',
        options: { encrypt: false }, // Use this if you're on Windows Azure
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 10000
        }
    },
    {
        empresa: 3, // siguientes empresas...
        user: 'sa',
        password: 'Softland2019',
        server: '190.151.5.131',
        port: 1433,
        database: 'SUNSWETT',
        options: { encrypt: false }, // Use this if you're on Windows Azure
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 10000
        }
    },
];