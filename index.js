const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Configurações de middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração da conexão MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Gerencia_Condominio',
    port: 3306
});

connection.connect(err => {
    if (err) {
        console.error('Erro na conexão ao MySQL:', err);
        process.exit(1);
    }
    console.log('Conectado ao MySQL');
});

// Rota principal - página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Busca de moradores por nome
app.post('/buscar', (req, res) => {
    const termo = req.body.termo || '';
    const sql = 'SELECT * FROM Moradores WHERE nome LIKE ?';

    connection.query(sql, [`%${termo}%`], (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).send('Erro na consulta ao banco.');
        }

        if (results.length > 0) {
            const nomes = results.map(r => r.nome).join('<br>');
            res.send(`<h2>Moradores encontrados:</h2><p>${nomes}</p>`);
        } else {
            res.send('<p>Nenhum morador encontrado com esse nome.</p>');
        }
    });
});

// Rotas para Blocos
app.get('/blocos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'blocos.html'));
});

app.post('/blocos', (req, res) => {
    const { descricao, qtd_apartamentos } = req.body;
    const sql = 'INSERT INTO Blocos (descricao, qtd_apartamentos) VALUES (?, ?)';

    connection.query(sql, [descricao, qtd_apartamentos], err => {
        if (err) {
            console.error('Erro ao cadastrar bloco:', err);
            return res.status(500).send('Erro ao cadastrar bloco.');
        }
        res.redirect('/blocos');
    });
});

// Rotas para Apartamentos
app.get('/apartamentos', (req, res) => {
    const sql = `
        SELECT a.id, a.numero, b.descricao AS bloco_descricao
        FROM Apartamentos a
        JOIN Blocos b ON a.bloco = b.id
    `;

    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar apartamentos:', err);
            return res.status(500).send('Erro ao buscar apartamentos.');
        }

        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Apartamentos Cadastrados</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Apartamentos Cadastrados</h1>
    <table>
        <tr>
            <th>ID</th>
            <th>Bloco</th>
            <th>Número</th>
            <th>Ações</th>
        </tr>`;

        rows.forEach(row => {
            html += `
        <tr>
            <td>${row.id}</td>
            <td>${row.bloco_descricao}</td>
            <td>${row.numero}</td>
            <td>
                <a href="/apartamentos/editar/${row.id}">Editar</a> |
                <a href="/apartamentos/excluir/${row.id}">Excluir</a>
            </td>
        </tr>`;
        });

        html += `
    </table>
    <a href="/">Voltar</a>
</body>
</html>`;

        res.send(html);
    });
});

// Rotas para Moradores
app.get('/moradores', (req, res) => {
    const sql = `
        SELECT m.id, m.nome, m.cpf, m.telefone,
               b.descricao AS bloco, a.numero AS apartamento
        FROM Moradores m
        JOIN Apartamentos a ON m.apartamento_id = a.id
        JOIN Blocos b ON a.bloco = b.id
    `;

    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar moradores:', err);
            return res.status(500).send('Erro ao buscar moradores.');
        }

        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Moradores Cadastrados</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Moradores Cadastrados</h1>
    <table>
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Bloco</th>
            <th>Apartamento</th>
            <th>Ações</th>
        </tr>`;

        rows.forEach(row => {
            html += `
        <tr>
            <td>${row.id}</td>
            <td>${row.nome}</td>
            <td>${row.cpf}</td>
            <td>${row.telefone}</td>
            <td>${row.bloco}</td>
            <td>${row.apartamento}</td>
            <td>
                <a href="/moradores/editar/${row.id}">Editar</a> |
                <a href="/moradores/excluir/${row.id}">Excluir</a>
            </td>
        </tr>`;
        });

        html += `
    </table>
    <a href="/">Voltar</a>
</body>
</html>`;

        res.send(html);
    });
});

// Rotas para Manutenções
app.get('/manutencoes', (req, res) => {
    const sql = `
        SELECT m.id, m.descricao, m.data, m.local,
               b.descricao AS bloco, a.numero AS apartamento
        FROM Manutencoes m
        LEFT JOIN Apartamentos a ON m.apartamento_id = a.id
        LEFT JOIN Blocos b ON a.bloco = b.id
    `;

    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar manutenções:', err);
            return res.status(500).send('Erro ao buscar manutenções.');
        }

        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Manutenções Registradas</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Manutenções Registradas</h1>
    <table>
        <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Data</th>
            <th>Local</th>
            <th>Bloco</th>
            <th>Apartamento</th>
            <th>Ações</th>
        </tr>`;

        rows.forEach(row => {
            const dataFormatada = new Date(row.data).toLocaleDateString();
            html += `
        <tr>
            <td>${row.id}</td>
            <td>${row.descricao}</td>
            <td>${dataFormatada}</td>
            <td>${row.local}</td>
            <td>${row.bloco || 'Área comum'}</td>
            <td>${row.apartamento || 'N/A'}</td>
            <td>
                <a href="/manutencoes/editar/${row.id}">Editar</a> |
                <a href="/manutencoes/excluir/${row.id}">Excluir</a>
            </td>
        </tr>`;
        });

        html += `
    </table>
    <a href="/">Voltar</a>
</body>
</html>`;

        res.send(html);
    });
});

// Rotas para Pagamentos
app.get('/pagamentos', (req, res) => {
    const sql = `
        SELECT p.id, p.valor, p.data, p.referencia_mes,
               b.descricao AS bloco, a.numero AS apartamento
        FROM Pagamentos p
        JOIN Apartamentos a ON p.apartamento_id = a.id
        JOIN Blocos b ON a.bloco = b.id
    `;

    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar pagamentos:', err);
            return res.status(500).send('Erro ao buscar pagamentos.');
        }

        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pagamentos Registrados</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Pagamentos Registrados</h1>
    <table>
        <tr>
            <th>ID</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Mês Referência</th>
            <th>Bloco</th>
            <th>Apartamento</th>
        </tr>`;

        rows.forEach(row => {
            const dataFormatada = new Date(row.data).toLocaleDateString();
            html += `
        <tr>
            <td>${row.id}</td>
            <td>R$ ${row.valor.toFixed(2)}</td>
            <td>${dataFormatada}</td>
            <td>${row.referencia_mes}</td>
            <td>${row.bloco}</td>
            <td>${row.apartamento}</td>
        </tr>`;
        });

        html += `
    </table>
    <a href="/">Voltar</a>
</body>
</html>`;

        res.send(html);
    });
});

// Inicia o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
