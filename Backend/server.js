const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const app = express();
const db = new sqlite3.Database(':memory:');
const saltRounds = 10; // Para bcrypt

// Configurações do Express
app.use(cors());
app.use(bodyParser.json());

// Criação das tabelas
db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        mobile TEXT NOT NULL,
        cpf TEXT NOT NULL,
        password TEXT NOT NULL,
        state TEXT NOT NULL,
        city TEXT NOT NULL,
        condo TEXT NOT NULL,
        unit TEXT NOT NULL,
        condoType TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        amount REAL,
        date TEXT,
        description TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        document TEXT,
        value REAL,
        account TEXT,
        detail TEXT
    )`);
    db.run(`CREATE TABLE charges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issueDate TEXT,
        number INTEGER,
        reason TEXT,
        dueDate TEXT,
        property TEXT,
        description TEXT,
        amount REAL,
        discount REAL,
        deductions REAL,
        interest REAL,
        penalty REAL,
        otherAdditions REAL,
        status TEXT,
        receivedDate TEXT,
        reasonForCancellation TEXT
    )`);
});

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'placidojunior34@gmail.com',
        pass: '220981Ana'
    }
});

// Endpoints de cadastro e login
app.post('/register', (req, res) => {
    const { name, email, phone, mobile, cpf, password, state, city, condo, unit, condoType } = req.body;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criptografar a senha' });
        }
        db.run(`INSERT INTO users (name, email, phone, mobile, cpf, password, state, city, condo, unit, condoType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [name, email, phone, mobile, cpf, hash, state, city, condo, unit, condoType], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [username], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (row) {
            bcrypt.compare(password, row.password, (err, result) => {
                if (result) {
                    res.json({ message: 'Login successful', user: row });
                } else {
                    res.status(400).json({ error: 'Invalid username or password' });
                }
            });
        } else {
            res.status(400).json({ error: 'Invalid username or password' });
        }
    });
});

app.post('/recover', (req, res) => {
    const { email } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (row) {
            const mailOptions = {
                from: 'placidojunior34@gmail.com',
                to: email,
                subject: 'Recuperação de Senha',
                text: `Olá, ${row.name}. Sua senha é: ${row.password}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(400).json({ error: 'Erro ao enviar email de recuperação' });
                } else {
                    res.json({ message: 'Email enviado' });
                }
            });
        } else {
            res.status(400).json({ error: 'Email não encontrado' });
        }
    });
});

// Endpoint para adicionar pagamento
app.post('/addPayment', (req, res) => {
    const { userId, amount, date, description } = req.body;
    db.run(`INSERT INTO payments (userId, amount, date, description) VALUES (?, ?, ?, ?)`, [userId, amount, date, description], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Endpoint para obter pagamentos
app.get('/getPayments', (req, res) => {
    db.all(`SELECT * FROM payments`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ payments: rows });
    });
});

// Endpoint para adicionar movimento
app.post('/addMovement', (req, res) => {
    const { date, document, value, account, detail } = req.body;
    db.run(`INSERT INTO movements (date, document, value, account, detail) VALUES (?, ?, ?, ?, ?)`, [date, document, value, account, detail], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Endpoint para obter movimentos
app.get('/getMovements', (req, res) => {
    db.all(`SELECT * FROM movements`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ movements: rows });
    });
});

// Endpoint para adicionar cobrança
app.post('/addCharge', (req, res) => {
    const { issueDate, number, reason, dueDate, property, description, amount, discount, deductions, interest, penalty, otherAdditions, status, receivedDate, reasonForCancellation } = req.body;
    db.run(`INSERT INTO charges (issueDate, number, reason, dueDate, property, description, amount, discount, deductions, interest, penalty, otherAdditions, status, receivedDate, reasonForCancellation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [issueDate, number, reason, dueDate, property, description, amount, discount, deductions, interest, penalty, otherAdditions, status, receivedDate, reasonForCancellation], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Endpoint para obter cobranças
app.get('/getCharges', (req, res) => {
    db.all(`SELECT * FROM charges`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ charges: rows });
    });
});

// Endpoint para obter saldo da conta
app.get('/getAccountBalance', (req, res) => {
    db.all(`SELECT SUM(amount) as balance FROM payments`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ balance: rows[0].balance || 0 }); // Adicione um valor padrão 0
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});