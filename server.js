
// BASE CONF
// =============================================================================

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var https = require('https');
var fs = require('fs');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');


// Config file
var config = require('./config');

// User model schema ( mongoose )
var User = require('./models/user');
var Auth = require('./models/auth');


// SSL options
var sslOptions = {
   key: fs.readFileSync('./cert/black-server.key'),
   cert: fs.readFileSync('./cert/black-server.crt'),
   ca: fs.readFileSync('./cert/black-server-ca.crt'),
   requestCert: true,
   rejectUnauthorized: false
};


// Define port
var port = process.env.PORT || config.port;


// bodyParser() configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB base dir
mongoose.connect(config.database);
app.set(config.secretVariable, config.secret);

// use morgan to log requests to the console
app.use(morgan('dev'));




// ROUTES CONF
// =============================================================================

// Initialize Express Router
var router = express.Router();

// Middleware for all requests
router.use(function(req, res, next) {

   console.log('Something is happening.');
   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   next();

});


// Index page
router.get('/', function(req, res) {
   res.sendFile(__dirname + '/public/index.html');
});




// SetUp Auth page
app.get('/setup', function(req, res) {

   // create a sample user
   var loginInfos = new Auth({
      name: 'David Wieczorek',
      password: 'slipknot6',
      admin: true
   });

   // save the sample user
   loginInfos.save(function(err) {
      if (err) throw err;
      console.log('User saved successfully');
      res.json({ success: true });
   });

});





// AUTH ROUTES API
// =============================================================================

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
// Generate a Token
router.post('/authenticate', function(req, res) {

   // find the user
   Auth.findOne({
      name: req.body.name
   }, function(err, user) {

      if (err) throw err;

      if (!user) {
         res.json({ success: false, message: 'Authentication failed. User not found.' });
      }
      else if (user) {

         // check if password matches
         if (user.password != req.body.password) {
            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
         }
         else {

            // if user is found and password is right
            // create a token
            var token = jwt.sign(user, app.get(config.secretVariable), {
               expiresInMinutes: 1440 // expires in 24 hours
            });

            // return the information including token as JSON
            res.json({
               success: true,
               message: 'Enjoy your token!',
               token: token
            });
         }

      }

   });

});



// TOKEN AUTH VERIFICATION
// Route middleware to verify a token
// @ All routes after this Token check is encrypted by Token verification
// =============================================================================


router.use(function(req, res, next) {

   // check header or url parameters or post parameters for token
   var token = req.body.token || req.query.token || req.headers['x-access-token'];

   // decode token
   if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get(config.secretVariable), function(err, decoded) {

         if (err) {
            return res.json({
               success: false,
               message: 'Failed to authenticate token.'
            });
         }

         else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            next();
         }

      });
   }
   else {
      // if there is no token
      // return an error
      return res.status(403).send({
         success: false,
         message: 'No token provided.'
      });
   }

});


// USER AUTH API
// =============================================================================

router.route('/users')

   .get(function(req, res) {
      Auth.find({}, function(err, users) {
        res.json(users);
      });
   });



// USER ROUTES API
// =============================================================================

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


   // REGISTER ROUTES
   app.use('', router);

// STARTING SERVER
// =============================================================================
/*app.listen(port);
console.log('Api server on port ' + port);*/
var secureServer = https.createServer(sslOptions, app).listen(port, function(){
   console.log('BlackRatio Secure HTTPS Server listening on port ' + port + ' , yeah !!!');
});
