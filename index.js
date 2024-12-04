const express = require('express'); //express est un framework node.js, permettant de créer des API rapidement
const bodyParser = require('body-parser'); //Body parser est utilisé pour analyser le corps des requetes HTTP
const mysql = require('mysql'); //Module pour se connecter et interagir avec une base de donnée mysql
const cors = require('cors');  //Cors middleware permet d'ajouter des en-têtes de controle d'accés pour autoriser les requetes entre differents domaines 
const xml2js = require('xml2js'); // est utilié pour convertir les objets json en xml et inversement 
const soap = require('soap'); // est utilisé pour gérer les requetes soap, un protocole de communication web


const app = express(); // crée une instance de l'application Express
app.use(cors());  //permet à l'application de gérer les requetes cross-origin
app.use(bodyParser.json()); // utilise body-parser pour analyser les corps des requetes JSON.

//Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost', //l'adresse de hote ou se trouve la bdd
    user: 'Lynda', //Le nom d'utilisateur pour se connecter à la bdd
    password : 'Lyon2024%@', //le mot de passe de l'utilisateur de la bdd
    database:'projet_api' // le nom de la bdd à utiliser
});

//Connexion à la bdd
db.connect(err =>{
    if(err) throw err;  //si une erreur se produit lors de la connexion, elle est sera lancé 'throw'
    console.log('MySQL Connected...'); //Message de confirmation si la connexion est réussie.
});

//route 'REST API':  Recuperer la liste des clients depuis la bdd 
app.get('/api/customers', (req,res) =>{
    const sql = 'SELECT * FROM costumers'; //requete sql pour selectionner tous les clients de la table customers

    //Exécution de la requete SQL
    db.query(sql, (err, results) => {
        if (err) throw err; // si une erreur survient lors de l'exécution de la requete, elle est lancée
        res.json(results); //Envoie la liste des clients récupérés en format JSON dans la réponse
    });
});

//'Route SOAP API' : Exporter les clients en format XML 
app.post('/api/soap/customers', (req, res) =>{
    const sql = 'SELECT * FROM costumers'; // La même requête SQL pour obtenir tous les clients 
    //Exécution de la requête SQL 
    db.query(sql, (err, result) => {
        if(err) throw err;

        // creation d'un objet XML à partir des résultats 
        const builder = new xml2js.Builder();
        const xml = builder.buildObject({customers: results }); //Convertit les résultats en XML.
        res.type('application/xml').send(xml);

    });
});
//Ajouter un client: route pour ajouter un client à la base de données 
app.post('/api/customers', (req, res) => {
    const{name, email, city, phone} = req.body; //Récupére les informations du client envoyé dans le corp de la requete

    //Requete SQL pour insérer un nouveau client dans la table 'customer'
    const sql = 'INSERT INTO costumers(name, email, city, phone) VALUES (?, ?, ?, ?)';
    
    //Exécution de la requete SQL avec les données reçues
    db.query(sql, [name, email, city, phone], (err, result) =>{
        if (err) throw err;

    //Envoie une réponse json avec l'ID généré pour le client et les informations envoyée 
    res.json({id: result.insertId, ...req.body}); //inclu l'id du nouveau client par la base de données
    });
});

//Lancer le serveur sur le port 5000
const PORT = 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT} `));