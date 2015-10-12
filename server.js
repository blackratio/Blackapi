
// BASE CONF
// =============================================================================

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var https = require('https');
var fs = require('fs');

// User model schema ( mongoose )
var User = require('./models/user');

// SSL options
var sslOptions = {
   key: fs.readFileSync('./cert/black-server.key'),
   cert: fs.readFileSync('./cert/black-server.crt'),
   ca: fs.readFileSync('./cert/black-server-ca.crt'),
   requestCert: true,
   rejectUnauthorized: false
};

// Define port
var port = process.env.PORT || 8080;


// bodyParser() configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB base dir
mongoose.connect('mongodb://localhost/data/test');



// ROUTES CONF
// =============================================================================

// Initialize Express Router
var router = express.Router();

// Middleware for all requests
router.use(function(req, res, next) {
   console.log('Something is happening.');
   next();
});

// Index page
router.get('/', function(req, res) {
   res.sendFile(__dirname + '/public/index.html');
});

// REGISTER ROUTES -------------------------------
app.use('', router);



// USER ROUTES API
// =============================================================================

// Initialize main RESTFUL route
router.route('/user')


   // create user
   // @ POST -> http://localhost:8080/user

   .post(function(req, res) {

      var user = new User();

      user.name = req.body.name;
      user.age = req.body.age;
      user.birthDate = req.body.birthdate;
      user.email = req.body.email;

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
      User.find(function(err, usersList) {
         if (err) {
            res.send(err);
         }
         else {
            res.json(usersList);
         }
      });
   });


router.route('/user/:user_id')

   // Get user by ID
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
   })


   // Delete user by ID
   // @ DEL -> http://localhost:8080/user/:user_id

   .delete(function(req, res) {
      User.remove({
         _id: req.params.user_id
      }, function(err, user) {
         if (err) {
            res.send(err);
         }
         else {
            res.json({
               message: 'User successfully deleted'
            });
         }
      });
   })


   // Update user by ID
   // @ DEL -> http://localhost:8080/user/:user_id

   .put(function(req, res) {

      User.findById(req.params.user_id, function(err, user) {

         if (err) {
            res.send(err);
         }
         else {
            user.name = req.body.name;
            user.age = req.body.age;
            user.birthDate = req.body.birthdate;
            user.email = req.body.email;
         }

         // Save updated user
         user.save(function(err) {
            if (err) {
               res.send(err);
            }
            else {
               res.json({
                  message: 'User successfully updated!'
               });
            }
         });

      });
   });



// STARTING SERVER
// =============================================================================
//app.listen(port);
//console.log('Api server on port ' + port);
var secureServer = https.createServer(sslOptions, app).listen(port, function(){
   console.log('BlackRatio Secure HTTPS Server listening on port ' + port + ' , yeah !!!');
});
