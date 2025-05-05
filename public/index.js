const mysql = require('mysql2/promise'); // Usando a versão promise
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Configurações
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexão com MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Gerencia_Condominio',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão com o banco
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexão com MySQL estabelecida com sucesso!');
        connection.release();
    } catch (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        process.exit(1);
    }
}

// Rotas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotas para cada módulo
app.get("/Blocos", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Blocos");
        res.sendFile(path.join(__dirname, 'public', 'html', 'Blocos.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar blocos");
    }
});

app.post('/novoBloco', async (req, res) => {
    try {
        const { descricao, qtd_apartamentos } = req.body;
        await pool.query(
            "INSERT INTO Blocos (descricao, qtd_apartamentos) VALUES (?, ?)",
            [descricao, qtd_apartamentos]
        );
        res.redirect('/Blocos');
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao cadastrar bloco");
    }
});

// Rotas para os outros módulos (similar ao padrão acima)
app.get("/Apartamentos", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Apartamento");
        res.sendFile(path.join(__dirname, 'public', 'html', 'Apartamentos.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar apartamentos");
    }
});

app.get("/Moradores", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Moradores");
        res.sendFile(path.join(__dirname, 'public', 'html', 'Moradores.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar moradores");
    }
});

// Iniciar servidor
async function startServer() {
    await testConnection();
    
    app.listen(4000, () => {
        console.log("Servidor rodando na url http://localhost:4000");
    });
}

startServer().catch(err => {
    console.error('Falha ao iniciar servidor:', err);
    process.exit(1);
});