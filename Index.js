const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
 
const app = express();
 
app.use(express.static('public'));
 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Gerencia_de_Condominio',
    port:3306
});
 
connection.connect(function(err){
    if(err){
        console.error('Erro', err);
        return
    }
 
    console.log("Conexão ok");
});
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
 
app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html")
    });
 
    app.post('/cadastrar', function (req,res){
 
        const bloco = req.body.bloco;
        const numero_apartamento = req.body.numero_apartamento;
        const qtd_apartamentos = req.body.qtd_apartamentos;
        const residente = req.body.residente;
        const values = [bloco, qtd_apartamentos, numero_apartamento, residente];
        const insert = "INSERT INTO condominio (bloco, qtd_apartamentos, numero_apartamento, residente) VALUES (?,?,?,?)"
   
        connection.query(insert, values, function(err, result){
            if(!err){
                console.log("Apartamento cadastrado com sucesso!");
                res.redirect('/listar');
   
            }else{
                console.log("Não foi possível cadastrar o Apartamento! ", err);
                res.send("Erro!")
            }
        });
    });
 
 
    app.get('/listar', function(req,res){
        const listar = "SELECT * FROM condominio";
     
        connection.query(listar, function(err, rows){
            if(!err){
                console.log("Consulta realizada com sucesso!");
                res.send(`
                    <html>
                    <head>
                    <title> Dados do Condominio </title>
                    <link rel="stylesheet" href="/style.css">
                    </head>
                    <body>
   
                        <h1>Relatório do Condominio</h1>
     
                        <table>
                            <tr>
                                <th> Código </th>
                                <th> Bloco </th>
                                <th> Quantidade de apartamentos </th>
                                <th> N° do Apartamento </th>
                                <th> Residente </th>
                            </tr>
                            ${rows.map(row => `
                                <tr>
                                    <td>${row.id}</td>
                                    <td>${row.bloco}</td>
                                    <td>${row.qtd_apartamentos}</td>
                                    <td>${row.numero_apartamento}</td>
                                    <td>${row.residente}</td>
   
                                    <td>
                                        <a href="/editar/${row.id}"><button class="Editar">Editar</button></a>
                                        <a href="/excluir/${row.id}"><button class="Excluir">Excluir</button></a>
                                    </td>
                                </tr>
                       
                            `).join('')}
                        </table>
                        <a href="/"> Voltar </a>
                    </body>
                    </html>
                    `);
            } else {
                console.log("Erro no relatório do Condominio ", err);
                res.send("Erro")
            }
        });
    });
 
    app.get('/excluir/:id', function(req,res){
        const id = req.params.id;
     
        connection.query('DELETE FROM condominio WHERE id = ?', [id], function(err, result){
            if(err){
                console.error('Erro ao excluir apartamento.');
                res.status(500).send('Erro interno ao excluir os apartamentos.')
                return;
            }
            console.log('Apartamento deletado com sucesso!');
            res.redirect('/listar');
        });
    });
   
    app.get('/editar/:id', function(req, res){
        const id = req.params.id;
        const select = "SELECT * FROM condominio WHERE id = ?";
       
        connection.query(select, [id], function(err, rows){
            if(!err){
                console.log("Apartamento encontrado com sucesso!");
                res.send(`
                    <html>
                        <head>
                            <title> Editar Apartamento </title>
                   
                        </head>
                        <body>
                            <div class="edit-container">
                            <h1>Editar Apartamento</h1>
                            <form action="/editar/${id}" method="POST">
                                <label for="bloco">Bloco:</label><br>
                                <input type="text" name="bloco" value="${rows[0].bloco}"><br><br>
                                <label for="qtd_apartamentos">Quantidade de Apartamentos:</label><br>
                                <input type="number" name="qtd_apartamentos" value="${rows[0].qtd_apartamentos}"><br><br>
                                <label for="numero_apartamento">N° do Apartamento:</label><br>
                                <input type="number" name="numero_apartamento" value="${rows[0].numero_apartamento}"><br><br>
                                <label for="residente">Residente:</label><br>
                                <input type="text" name="residente" value="${rows[0].residente}"><br><br>
                                <input type="submit" value="Salvar">
                            </form>
                        </body>
                    </html>`);
                } else {
                    console.log("Erro no relatório do Apartamento. ", err);
                    res.send("Erro")
                }
            });
        });
        app.post('/editar/:id', function(req, res){
            const id = req.params.id;
            const bloco = req.body.bloco;
            const qtd_apartamentos = req.body.qtd_apartamentos;
            const numero_apartamento = req.body.numero_apartamento;
            const residente = req.body.residente;
         
            const update = "UPDATE condominio SET bloco = ?, qtd_apartamentos = ?, numero_apartamento = ?, residente = ? WHERE id = ?";
         
            connection.query(update, [bloco, qtd_apartamentos, numero_apartamento, residente, id], function(err, result){
                if(!err){
                    console.log("Apartamento editado com sucesso!");
                    res.redirect('/listar');
                }else{
                    console.log("Erro ao editar o Apartamento ", err);
                    res.send("Erro")
                }
            });
        });
   
        app.listen(4000, function(){ console.log("Servidor rodando na url http://localhost:4000")
        });
 