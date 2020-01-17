const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create redis client
const client = redis.createClient();

client.on('connect', function() {
    console.log('Connected to Redis...');
});

// Set port
const PORT = 3000;

// Init app
const app = express();

// View engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Method override
app.use(methodOverride('_method'));

// Search page
app.get('/', function(req, res) {
    res.render('searchusers');
});

// Search processing
app.post('/user/search', function(req, res, next) {
    let id = req.body.id;
    client.hgetall(id, function(err, obj) {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User page
app.get('/user/add', function(req, res) {
    res.render('adduser');
});

// Process Add User page
app.post('/user/add', function(req, res) {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function(err, reply) {
        if (err) {
            console.error(err);
        } else {
            console.log(reply);
            res.redirect('/');
        }
    });
});

app.delete('/user/delete/:id', function(req, res) {
    let id = req.params.id;
    client.del(id);
    res.redirect('/');
});

app.listen(PORT, function(err) {
    if (err) throw err;
    console.log(`Server is running on port ${PORT}`);
});