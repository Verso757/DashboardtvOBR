import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Dynamic logo routes
app.get('/logo.png', (req, res) => {
    const pngPath = path.join(__dirname, 'public', 'logo.png');
    if (fs.existsSync(pngPath)) {
        return res.sendFile(pngPath);
    }
    res.sendFile(path.join(__dirname, 'public', 'logo-yaqui.svg'));
});

app.get('/logo-yaqui.png', (req, res) => {
    const pngPath = path.join(__dirname, 'public', 'logo.png');
    if (fs.existsSync(pngPath)) {
        return res.sendFile(pngPath);
    }
    res.sendFile(path.join(__dirname, 'public', 'logo-yaqui.svg'));
});

// Download ZIP of PHP Project
app.get('/proyecto.zip', (req, res) => {
    const zipFile = path.join(__dirname, 'public', 'proyecto.zip');
    if (fs.existsSync(zipFile)) {
        res.download(zipFile, 'proyecto.zip');
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

app.get('/descargar-proyecto', (req, res) => {
    const zipFile = path.join(__dirname, 'public', 'proyecto.zip');
    if (fs.existsSync(zipFile)) {
        res.download(zipFile, 'proyecto.zip');
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

// Serve the raw PHP/HTML project folder for direct inspection
app.use('/proyecto', express.static(path.join(__dirname, 'proyecto')));

const getSqlConfig = () => ({
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'D1mens1on',
    database: process.env.DB_NAME || 'VentasYCobranzaCYSA',
    server: process.env.DB_SERVER || '172.16.60.12',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE || 'SQLSVR'
    },
    connectionTimeout: 2000,
    requestTimeout: 2000
});

// Helper to normalize cedis/city parameter
const getRequestedCity = (req) => {
    const p = (req.query.cedis || req.query.city || req.query.cityCode || '').toString().toLowerCase().trim();
    if (!p || p === 'all' || p === 'todos') return null;
    if (p === '1' || p === 'obregon' || p === 'obregón') return { code: 1, name: 'Obregon' };
    if (p === '2' || p === 'hermosillo') return { code: 2, name: 'Hermosillo' };
    if (p === '3' || p === 'navojoa') return { code: 3, name: 'Navojoa' };
    if (p === '4' || p === 'nogales') return { code: 4, name: 'Nogales' };
    if (p === '5' || p === 'caborca') return { code: 5, name: 'Caborca' };
    if (p === '6' || p === 'guaymas') return { code: 6, name: 'Guaymas' };
    return null;
};

// 1. API api_litros.php
app.get('/api_litros.php', async (req, res) => {
    const filter = getRequestedCity(req);
    const mockData = {
        "Obregon": [
            { familia: '1', nombre: 'Leche Fresca', litros: 16500 },
            { familia: '2', nombre: 'Yogurt', litros: 6200 },
            { familia: '3', nombre: 'Quesos y Derivados', litros: 4100 },
            { familia: '4', nombre: 'Jugos y Néctares', litros: 3200 }
        ],
        "Hermosillo": [
            { familia: '1', nombre: 'Leche Fresca', litros: 22400 },
            { familia: '2', nombre: 'Yogurt', litros: 8900 },
            { familia: '3', nombre: 'Quesos y Derivados', litros: 5800 },
            { familia: '4', nombre: 'Jugos y Néctares', litros: 4300 }
        ],
        "Navojoa": [
            { familia: '1', nombre: 'Leche Fresca', litros: 9800 },
            { familia: '2', nombre: 'Yogurt', litros: 3700 },
            { familia: '3', nombre: 'Quesos y Derivados', litros: 2400 },
            { familia: '4', nombre: 'Jugos y Néctares', litros: 1800 }
        ],
        "Nogales": [
            { familia: '1', nombre: 'Leche Fresca', litros: 8500 },
            { familia: '2', nombre: 'Yogurt', litros: 3100 },
            { familia: '3', nombre: 'Quesos y Derivados', litros: 2100 },
            { familia: '4', nombre: 'Jugos y Néctares', litros: 1400 }
        ],
        "Caborca": [
            { familia: '1', nombre: 'Leche Fresca', litros: 7200 },
            { familia: '2', nombre: 'Yogurt', litros: 2600 },
            { familia: '3', nombre: 'Quesos y Derivados', litros: 1800 },
            { familia: '4', nombre: 'Jugos y Néctares', litros: 1100 }
        ],
        "Guaymas": [
            { familia: '1', nombre: 'Leche Fresca', litros: 8900 },
            { familia: '2', nombre: 'Yogurt', litros: 3400 },
            { familia: '3', nombre: 'Quesos y Derivados', litros: 2200 },
            { familia: '4', nombre: 'Jugos y Néctares', litros: 1600 }
        ]
    };

    try {
        await sql.connect(getSqlConfig());
        let query = `
            SELECT
                R.Ciudad,
                P.Familia,
                f.Nombre AS NombreFamilia,
                CAST(ISNULL(SUM(CASE WHEN R.Ciudad IS NOT NULL THEN (DET.Unidades * ISNULL(P.Factor, 1)) ELSE 0 END), 0) AS FLOAT) AS Litros
            FROM VwMovimientosMov DET
            INNER JOIN Productos P ON DET.Producto = P.Producto
            INNER JOIN Familias f ON f.Familia = P.Familia
            INNER JOIN VwMovimientos ENC ON ENC.Folio = DET.Folio
            INNER JOIN Rutas R ON R.Ruta = ENC.Ruta AND ENC.Almacen = R.Almacen
            WHERE
                ENC.Fecha >= CAST(GETDATE() AS DATE)
                AND ENC.Fecha < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
                AND ENC.Ruta NOT IN (50, 151)
                AND P.SeUsa = '1'
                AND R.Ciudad IS NOT NULL
        `;
        if (filter) query += ` AND R.Ciudad = ${filter.code}`;
        query += ` AND P.Familia NOT IN ('17', '98', '99') GROUP BY R.Ciudad, P.Familia, f.Nombre ORDER BY Litros DESC`;

        const result = await sql.query(query);
        const cityMap = { 1: "Obregon", 2: "Hermosillo", 3: "Navojoa", 4: "Nogales", 5: "Caborca", 6: "Guaymas" };
        const data = {};
        for (const row of result.recordset) {
            const cityName = cityMap[row.Ciudad];
            if (!cityName) continue;
            if (filter && cityName.toLowerCase() !== filter.name.toLowerCase()) continue;
            if (!data[cityName]) data[cityName] = [];
            data[cityName].push({
                familia: row.Familia,
                nombre: row.NombreFamilia,
                litros: parseFloat(row.Litros) || 0
            });
        }
        return res.json({ success: true, data });
    } catch (err) {
        if (filter) {
            const single = {};
            single[filter.name] = mockData[filter.name] || [];
            return res.json({ success: true, data: single, cedis: filter.name });
        }
        res.json({ success: true, data: mockData });
    }
});

// 2. API api_visitas.php
app.get('/api_visitas.php', async (req, res) => {
    const filter = getRequestedCity(req);
    const mockData = {
        "Obregon": { ventas: 210, visitas: 245, clientesDelDia: 270, clientesActivos: 480, clientesTotales: 530, efectividadVentas: 77.8, coberturaVisitas: 90.7 },
        "Hermosillo": { ventas: 320, visitas: 360, clientesDelDia: 410, clientesActivos: 720, clientesTotales: 800, efectividadVentas: 78.0, coberturaVisitas: 87.8 },
        "Navojoa": { ventas: 145, visitas: 160, clientesDelDia: 185, clientesActivos: 310, clientesTotales: 340, efectividadVentas: 78.4, coberturaVisitas: 86.5 },
        "Nogales": { ventas: 115, visitas: 130, clientesDelDia: 150, clientesActivos: 260, clientesTotales: 290, efectividadVentas: 76.7, coberturaVisitas: 86.7 },
        "Caborca": { ventas: 95, visitas: 105, clientesDelDia: 120, clientesActivos: 210, clientesTotales: 235, efectividadVentas: 79.2, coberturaVisitas: 87.5 },
        "Guaymas": { ventas: 130, visitas: 148, clientesDelDia: 165, clientesActivos: 290, clientesTotales: 320, efectividadVentas: 78.8, coberturaVisitas: 89.7 }
    };

    try {
        await sql.connect(getSqlConfig());
        let query = `
            WITH Dia AS (
                SELECT DATENAME(WEEKDAY, GETDATE()) AS NombreDia
            )
            SELECT 
                CASE 
                    WHEN LEFT(s.Ruta, 1) = '1' THEN 'Obregon'
                    WHEN LEFT(s.Ruta, 1) = '2' THEN 'Hermosillo'
                    WHEN LEFT(s.Ruta, 1) = '3' THEN 'Navojoa'
                    WHEN LEFT(s.Ruta, 1) = '4' THEN 'Nogales'
                    WHEN LEFT(s.Ruta, 1) = '5' THEN 'Caborca'
                    WHEN LEFT(s.Ruta, 1) = '6' THEN 'Guaymas'
                    ELSE 'Otra Ciudad'
                END AS Ciudad,
                COUNT(DISTINCT CASE WHEN v.Tipo = 'V' THEN v.IDRemision END) AS Ventas,
                COUNT(DISTINCT CASE WHEN v.Tipo = 'C' THEN v.IDRemision END) AS Visitas,
                (SELECT COUNT(*) 
                 FROM Sucursales s2
                 CROSS JOIN Dia d
                 WHERE s2.SeUsa = 1 
                   AND s2.Ruta <> '50'
                   AND LEFT(s2.Ruta,1) = LEFT(s.Ruta,1)
                   AND (
                        (d.NombreDia = 'Monday'    AND s2.Lun = 1) OR
                        (d.NombreDia = 'Tuesday'   AND s2.Mar = 1) OR
                        (d.NombreDia = 'Wednesday' AND s2.Mie = 1) OR
                        (d.NombreDia = 'Thursday'  AND s2.Jue = 1) OR
                        (d.NombreDia = 'Friday'    AND s2.Vie = 1) OR
                        (d.NombreDia = 'Saturday'  AND s2.Sab = 1)
                   )
                ) AS ClientesDelDia,
                (SELECT COUNT(*) 
                 FROM Sucursales s2
                 WHERE s2.SeUsa = 1 
                   AND s2.Ruta <> '50'
                   AND LEFT(s2.Ruta,1) = LEFT(s.Ruta,1)
                ) AS ClientesActivos,
                (SELECT COUNT(*) 
                 FROM Sucursales s3
                 WHERE s3.Ruta <> '50'
                   AND LEFT(s3.Ruta,1) = LEFT(s.Ruta,1)
                ) AS ClientesTotales
            FROM VentasApp v
            INNER JOIN Sucursales s ON s.Sucursal = v.Sucursal
            CROSS JOIN Dia d
            WHERE v.Cancelado = '0'
              AND CONVERT(date, v.Fecha) = CONVERT(date, GETDATE())
        `;
        if (filter) query += ` AND LEFT(s.Ruta,1) = '${filter.code}'`;
        query += ` GROUP BY CASE WHEN LEFT(s.Ruta, 1) = '1' THEN 'Obregon' WHEN LEFT(s.Ruta, 1) = '2' THEN 'Hermosillo' WHEN LEFT(s.Ruta, 1) = '3' THEN 'Navojoa' WHEN LEFT(s.Ruta, 1) = '4' THEN 'Nogales' WHEN LEFT(s.Ruta, 1) = '5' THEN 'Caborca' WHEN LEFT(s.Ruta, 1) = '6' THEN 'Guaymas' ELSE 'Otra Ciudad' END, LEFT(s.Ruta,1)`;

        const result = await sql.query(query);
        const data = {};
        for (const row of result.recordset) {
            const ciudad = row.Ciudad;
            if (ciudad !== 'Otra Ciudad') {
                if (filter && ciudad.toLowerCase() !== filter.name.toLowerCase()) continue;
                const clientesDelDia = parseInt(row.ClientesDelDia, 10) || 0;
                const ventas = parseInt(row.Ventas, 10) || 0;
                const visitas = parseInt(row.Visitas, 10) || 0;
                const efectividadVentas = clientesDelDia > 0 ? (ventas / clientesDelDia) * 100 : 0;
                const coberturaVisitas = clientesDelDia > 0 ? (visitas / clientesDelDia) * 100 : 0;

                data[ciudad] = {
                    ventas,
                    visitas,
                    clientesDelDia,
                    clientesActivos: parseInt(row.ClientesActivos, 10) || 0,
                    clientesTotales: parseInt(row.ClientesTotales, 10) || 0,
                    efectividadVentas: Math.round(efectividadVentas * 10) / 10,
                    coberturaVisitas: Math.round(coberturaVisitas * 10) / 10
                };
            }
        }
        res.json(data);
    } catch (err) {
        if (filter) {
            const single = {};
            single[filter.name] = mockData[filter.name] || null;
            return res.json(single);
        }
        res.json(mockData);
    }
});

// 3. API api_litros_vendidos.php
app.get('/api_litros_vendidos.php', async (req, res) => {
    const filter = getRequestedCity(req);
    const mockData = {
        "Obregon": [
            { familia: '1', nombre: 'Leche Fresca', litros: 15800 },
            { familia: '2', nombre: 'Yogurt', litros: 5900 },
            { familia: '3', nombre: 'Quesos', litros: 3900 }
        ],
        "Hermosillo": [
            { familia: '1', nombre: 'Leche Fresca', litros: 21600 },
            { familia: '2', nombre: 'Yogurt', litros: 8400 },
            { familia: '3', nombre: 'Quesos', litros: 5500 }
        ],
        "Navojoa": [
            { familia: '1', nombre: 'Leche Fresca', litros: 9300 },
            { familia: '2', nombre: 'Yogurt', litros: 3500 },
            { familia: '3', nombre: 'Quesos', litros: 2300 }
        ],
        "Nogales": [
            { familia: '1', nombre: 'Leche Fresca', litros: 8100 },
            { familia: '2', nombre: 'Yogurt', litros: 2900 },
            { familia: '3', nombre: 'Quesos', litros: 1950 }
        ],
        "Caborca": [
            { familia: '1', nombre: 'Leche Fresca', litros: 6900 },
            { familia: '2', nombre: 'Yogurt', litros: 2450 },
            { familia: '3', nombre: 'Quesos', litros: 1700 }
        ],
        "Guaymas": [
            { familia: '1', nombre: 'Leche Fresca', litros: 8500 },
            { familia: '2', nombre: 'Yogurt', litros: 3200 },
            { familia: '3', nombre: 'Quesos', litros: 2100 }
        ]
    };

    try {
        await sql.connect(getSqlConfig());
        let query = `
            SELECT
                DET.Ciudad,
                DET.Familia,
                DET.NOMFAM AS familiaNombre,
                CAST(SUM(DET.Unidades * DET.Factor) AS FLOAT) AS total
            FROM VwEstadisticadeVentas AS DET
            INNER JOIN Rutas AS RUT ON RUT.Ruta = DET.Ruta
            WHERE DET.Tipo = 'V'
              AND DET.Ruta NOT IN (50, 151)
              AND CONVERT(date, DET.Fecha) = CONVERT(date, GETDATE())
              AND DET.Ciudad IN (1, 2, 3, 4, 5, 6)
        `;
        if (filter) query += ` AND DET.Ciudad = ${filter.code}`;
        query += ` GROUP BY DET.Ciudad, DET.Familia, DET.NOMFAM ORDER BY total DESC`;

        const result = await sql.query(query);
        const cityMap = { 1: "Obregon", 2: "Hermosillo", 3: "Navojoa", 4: "Nogales", 5: "Caborca", 6: "Guaymas" };
        const data = {};
        for (const row of result.recordset) {
            const cityName = cityMap[row.Ciudad];
            if (!cityName) continue;
            if (filter && cityName.toLowerCase() !== filter.name.toLowerCase()) continue;
            if (!data[cityName]) data[cityName] = [];
            data[cityName].push({
                familia: row.Familia,
                nombre: row.familiaNombre,
                litros: parseFloat(row.total) || 0
            });
        }
        res.json({ success: true, data });
    } catch (err) {
        if (filter) {
            const single = {};
            single[filter.name] = mockData[filter.name] || [];
            return res.json({ success: true, data: single, cedis: filter.name });
        }
        res.json({ success: true, data: mockData });
    }
});

// 4. API api_cancelaciones.php
app.get('/api_cancelaciones.php', async (req, res) => {
    const filter = getRequestedCity(req);
    const mockData = {
        ciudades: {
            "Obregon": {
                "6": { activos: 24, cancelados: 1 },
                "8": { activos: 15, cancelados: 0 },
                "C": { activos: 45, cancelados: 2 },
                "V": { activos: 180, cancelados: 3 }
            },
            "Hermosillo": {
                "6": { activos: 36, cancelados: 2 },
                "8": { activos: 22, cancelados: 1 },
                "C": { activos: 68, cancelados: 4 },
                "V": { activos: 260, cancelados: 5 }
            },
            "Navojoa": {
                "6": { activos: 18, cancelados: 0 },
                "8": { activos: 12, cancelados: 1 },
                "C": { activos: 34, cancelados: 1 },
                "V": { activos: 125, cancelados: 2 }
            },
            "Nogales": {
                "6": { activos: 14, cancelados: 1 },
                "8": { activos: 9, cancelados: 0 },
                "C": { activos: 28, cancelados: 2 },
                "V": { activos: 98, cancelados: 1 }
            },
            "Caborca": {
                "6": { activos: 11, cancelados: 0 },
                "8": { activos: 7, cancelados: 0 },
                "C": { activos: 22, cancelados: 1 },
                "V": { activos: 82, cancelados: 1 }
            },
            "Guaymas": {
                "6": { activos: 16, cancelados: 1 },
                "8": { activos: 10, cancelados: 0 },
                "C": { activos: 30, cancelados: 2 },
                "V": { activos: 110, cancelados: 2 }
            }
        },
        rutas: {
            "Obregon": [
                { ruta: 101, activos: 42, cancelados: 2 },
                { ruta: 104, activos: 38, cancelados: 1 }
            ],
            "Hermosillo": [
                { ruta: 203, activos: 48, cancelados: 3 },
                { ruta: 207, activos: 44, cancelados: 2 }
            ],
            "Navojoa": [
                { ruta: 302, activos: 35, cancelados: 1 }
            ],
            "Nogales": [
                { ruta: 401, activos: 31, cancelados: 1 }
            ],
            "Caborca": [
                { ruta: 502, activos: 29, cancelados: 1 }
            ],
            "Guaymas": [
                { ruta: 601, activos: 36, cancelados: 1 }
            ]
        }
    };

    if (filter) {
        const cSingle = {};
        cSingle[filter.name] = mockData.ciudades[filter.name] || {};
        const rSingle = {};
        rSingle[filter.name] = mockData.rutas[filter.name] || [];
        return res.json({
            success: true,
            data: { ciudades: cSingle, rutas: rSingle, cedis: filter.name }
        });
    }

    res.json({ success: true, data: mockData });
});

// 5. API api_bitacora.php
app.get('/api_bitacora.php', async (req, res) => {
    const filter = getRequestedCity(req);

    const cityPrefixes = [
        { city: 'Obregon', prefix: 100, count: 14, code: 1 },
        { city: 'Hermosillo', prefix: 200, count: 18, code: 2 },
        { city: 'Navojoa', prefix: 300, count: 10, code: 3 },
        { city: 'Nogales', prefix: 400, count: 8, code: 4 },
        { city: 'Caborca', prefix: 500, count: 6, code: 5 },
        { city: 'Guaymas', prefix: 600, count: 8, code: 6 }
    ];

    let selectedPrefixes = cityPrefixes;
    if (filter) {
        selectedPrefixes = cityPrefixes.filter(c => c.city.toLowerCase() === filter.name.toLowerCase() || c.code === filter.code);
    }

    const routes = [];
    let index = 0;
    for (const cp of selectedPrefixes) {
        for (let i = 1; i <= cp.count; i++) {
            index++;
            const rutaNum = cp.prefix + i;
            const tieneLic = index % 14 === 0 ? 'Sin Licencia' : 'Con Licencia';
            const hourOut = 5 + Math.floor((i % 4));
            const minOut = (i * 7) % 60;
            const horaSalida = `2026-10-19 ${hourOut.toString().padStart(2, '0')}:${minOut.toString().padStart(2, '0')}:00`;
            
            const hasLiquidated = i <= (cp.count - 3);
            const horaLiquidacion = hasLiquidated ? `2026-10-19 ${13 + Math.floor(i % 5)}:${((i * 11) % 60).toString().padStart(2, '0')}:00` : null;
            const enAlmacen = hasLiquidated ? `2026-10-19 12:${((i * 9) % 60).toString().padStart(2, '0')}:00` : null;
            const enCaja = hasLiquidated ? `2026-10-19 13:05:00` : null;

            routes.push({
                ruta: rutaNum,
                ciudad: cp.city,
                tieneLic,
                horaSalida,
                kmRecorrido: 65 + ((i * 13) % 70),
                temSalida: 3.5 + ((i * 0.7) % 3.0),
                temRegreso: hasLiquidated ? 4.2 + ((i * 0.6) % 3.5) : null,
                enAlmacen,
                enCaja,
                horaLiquidacion,
                observaciones: index % 12 === 0 ? 'Cambio de unidad por revisión mecánica' : (index % 19 === 0 ? 'Retraso por tráfico en zona centro' : '')
            });
        }
    }

    res.json({
        success: true,
        data: routes,
        meta: {
            cedis: filter ? filter.name : 'Todos',
            total_registros: routes.length,
            timestamp: new Date().toISOString()
        }
    });
});

const distPath = path.join(__dirname, 'dist');
const distExists = fs.existsSync(path.join(distPath, 'index.html'));
const isProduction = process.env.NODE_ENV === 'production' && distExists;

if (!isProduction) {
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
    });
    app.use(vite.middlewares);
} else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
