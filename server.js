
// BASE CONF
// =============================================================================

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');


// bodyParser() configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define port
var port = process.env.PORT || 8080;

// Define MongoDB base dir
mongoose.connect('mongodb://localhost/data/test');




// ROUTES CONF
// =============================================================================

var router = express.Router();

// middleware use for all requests
router.use(function(req, res, next) {
   console.log('Something is happening.');
   next();
});

// Index route
router.get('/', function(req, res) {
   res.json({ message: 'Welcome!' });
});

// REGISTER ROUTES -------------------------------
app.use('', router);



// ROUTES API
// =============================================================================

// Initialize main RESTFUL route
router.route('/user')


   // create user
   // @ POST -> http://localhost:8080/user

   .post(function(req, res) {

      var user = new User();      // create a new instance of the User model
      user.name = req.body.name;  // set the user name
      user.age = req.body.age;

      // save the user and check errors
      user.save(function(err) {
         if (err) {
            res.send(err);
         }
         else {
            res.json({
               message: 'User successfully created!'
            });
         }
      });

   })


   // Get users
   // @ GET -> http://localhost:8080/user

   .get(function(req, res) {
      User.find(function(err, users) {
         if (err) {
            res.send(err);
         }
         else {
            res.json(users);
         }
      });
   });


router.route('/user/:user_id')

   // Get users
   // @ GET -> http://localhost:8080/user/:user_id

   .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
         if (err) {
            res.send(err);
         }
         else {
            res.json(user);
         }
      });
   });




// STARTING SERVER
// =============================================================================
app.listen(port);
console.log('Api server on port ' + port);
