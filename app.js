var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); //the session object is appended to request
var MongoStore = require('connect-mongo')(session); 
var express = require('express');
var mqtt=require('mqtt');

var app = express();

app.use(express.urlencoded({ extended: false })); // express body-parser
app.set('port', process.env.PORT || 8080);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + '/views')));

//-------------------- SESSION config and mongo ------------------------------
app.use(session({
    name: 'RawanBeeLine',
    secret: 'cats',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: { maxAge: (2592000000)} //30 days
}));

mongoose.connect('mongodb://localhost:27017/users', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', new mongoose.Schema({
    username: { //username   
        type: String,
        required: true
    },
    email: {
        type: String,
        required:true,  //email must be unique
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    start: {
        type: String
    },
    end: {
        type: String
    }
}));

//----------------------------------- ROUTES -------------------------------------
//------------------- GET

app.get('/',  async (req, res) => { //main route is the login
    if (req.session.loggedIn)
    {
        let user = await User.findOne({ email: req.session.email});
        if (user) //if user is logged in and found
        {
            res.redirect('/dashboard');
        }
        else { res.render('login'); }
    }

    res.render('login');
}); 

app.get('/registration',  (req, res) => { 
    res.render('register');
});

app.get('/dashboard', (req, res) => { //to get map
    if (req.session && req.session.user) { // check if session exists
      // lookup the user in the DB by pulling their email from the session
      User.findOne({ email: req.session.user.email }, function (err, user) {
        if (!user) {
          // if the user isn't found in the DB, reset the session info and
          // redirect the user to the login page
          req.session.reset();
          res.redirect('/');
        } 
        else if (req.session.loggedIn){
            if (req.session.visited)
            {
                req.session.visited = Date.now().toString();
                statement = "Welcome back, " + user.username + ". Your last visit was "+ req.session.visited ;
                
                req.lastVisit = req.session.visited;
           
            }
            else {
                statement = "Hello, " + user.username + ". This is your first visit!";
            }
            
            
            next();
            res.render("map", {sentence: statement});
        }
      });
    } else {
      res.redirect('/');
    }
  });


app.get('/arrow', (req, res) =>{
    if (req.session.loggedIn) {
        res.render('arrow');
    }
    else {
        res.redirect('/');
    }
})


app.get('/logout', (req, res) => {
    res.redirect('/');
    delete req.session;
})


//---------------------- POST
app.post('/registration',  async (req, res, next) => {
    let user = await User.findOne({email:req.body.email});
    if (user){ //if user already exists in db
       console.log("wtf");
    } else{  //create a new user in db
         user = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        user.password = bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {
              return next(err);
            }
            user.password = hash;
            next();
          })
          user.save();
          req.session.user = user; 
          req.redirect('/'); //redirect(/login)???
        

    }
});


app.post('/login', async (request, response) => {
    try {
        let user = await User.findOne({email: req.body.email});
        if (!user) {
            res.render('login', { error: 'Invalid email or password.' });
          } else {
        if (req.body.password == user.password) {
            if (!req.body.remember_me)
            {
                req.session.cookie
            }
              // sets a cookie with the user's info
          req.session.user = {
                email: user.email,
                name: user.name
         };
         req.session.loggedIn=true;
         req.session.email = res.locals.email
         req.session.username = res.locals.username
         console.log(req.session)
         res.redirect('/dashboard');

        } 
            else {
              res.render('login', { error: 'Invalid email or password.' });
            }
          }
           
    } catch(err) {
        res.sendStatus(500);
    }
});


//dashboard is for the map
app.post('/dashboard', async (req, res, next) => {
let user = await User.findOne({username: req.body.username});
if (!user || !(authenticate = bcrypt.compare(user.password, req.body.password)))
{
    res.redirect('/');
}
else{
    req.session.loggedIn= true;
    req.session.email = user.email;
    req.session.username = user.username;
    if (req.session.visited)
    {
        req.lastVisit = req.session.visited;
        res.render("map", )
    }
    req.session.visited = Date.now().toString();
    next();
    res.render("map", {displayName: user.username, timeStamp: req.session.visited});

}
}
);




app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});


//FOR MQTT 
client.on('connect', function () {
    client.subscribe('coe-457/HW3', function (err) {
        if (err) {
            console.log('Error');
        }
        else {
            console.log('Success');
            client.on('message', function (topic, message) {
                var coordi = message.toString();
                //use User.updateOne() to update each user's start location and end location
                }

            })
        }
    })


});
