// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// DATABASE SETUP
var mongoose = require('mongoose');
mongoose.connect('mongodb://Elizaveta:disneymongo13@cluster0-shard-00-00-rzcsq.mongodb.net:27017,cluster0-shard-00-01-rzcsq.mongodb.net:27017,cluster0-shard-00-02-rzcsq.mongodb.net:27017/SampleCollections?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true'); // connect to our database

// Handle the connection event
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log("DB connection alive");
});

// Pokemon models lives here

var Pokemon = require('./app/models/pokemon')
// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// mnamedleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

// on routes that end in /pokemons
// ----------------------------------------------------
router.route('/pokemons')

    // create a Pokemon (accessed at POST http://localhost:8080/pokemons)
    .post(function(req, res) {

        var pokemon = new Pokemon(); // create a new instance of the Pokemon model
        pokemon.name = req.body.name; // set the pokemons name (comes from the request)

        pokemon.save(function(err) {
            if (err)
                res.send(err);

            res.json({
                message: 'Pokemon created!'
            });
        });


    })

    // get all the pokemons (accessed at GET http://localhost:8080/api/pokemons)
    .get(function(req, res) {
        Pokemon.find(function(err, pokemons) {
            if (err)
                res.send(err);

            res.json(pokemons);
        });
    });

// on routes that end in /pokemons/:Pokemon_name
// ----------------------------------------------------
router.route('/pokemons/:pokemon_name')

    // get the Pokemon with that name
    .get(function(req, res) {
        //Pokemon.findOne(req.params.Pokemon_name, function(err, Pokemon) {

        Pokemon.findOne({
            name: req.params.pokemon_name
        }, function(err, poke) {
            if (err)
                res.send(err);
            res.json(poke);
        });

    })

    // update the Pokemon with this name
    .put(function(req, res) {
        //Pokemon.findOne(req.params.Pokemon_name, function(err, Pokemon) 
        Pokemon.findOne({
            name: req.params.pokemon_name
        }, function(err, poke) {

            if (err)
                res.send(err);

            poke.name = req.body.name;
            poke.save(function(err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Pokemon updated!'
                });
            });

        });
    })




// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
