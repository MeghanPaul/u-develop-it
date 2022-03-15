const inputCheck = require('./utils/inputCheck');

const mysql = require('mysql2');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();

//Express middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        user:'root',
        password: 'frankieolive',
        database: 'election'
    },
    console.log('Connected to the election database.')
);

app.get('/api/candidates',(req, res) => {
    const sql = `SELECT * FROM candidates`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});



app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT * FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if(err){
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

app.delete('/api/candidate/:id',(req,res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if(err){
            res.statusMessage(400).json({error: res.message});
        }else if(!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        }else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

app.post('/api/candidate', ({body}, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if(errors) {
        res.status(400).json({error: errors});
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, result) => {
        if(err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
});

/* const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected)
            VALUES (?,?,?,?)`;

const params = [1, 'Ronald', 'Firbank', 1];

db.query(sql, params, (err, result) => {
    if (err) {
        console.log(err);
    }
    console.log(result);
}); */

//catch all
app.use((req,res)=> {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
