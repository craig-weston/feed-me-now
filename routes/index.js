var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');
const Review = require('../models/reviews');
var googleMapsClient = require('@google/maps').createClient({
    key: process.env.MAP_KEY
});

//this position needs to be the geolocation position
let pos;

// GET /
router.get('/', function(req, res, next) {
    res.redirect('/map');
});

// GET / splash page
router.get('/home', function(req, res, next) {
    return res.render('index', { title: 'Home' });
});

// POST /location
router.post('/map', function(req, res, next) {
    const location = {
        lat: req.body.lat,
        lng: req.body.lng
    };
    // save location in user session
    req.session.location = location;
    res.redirect('/map');
});

// GET /map
router.get('/map', mid.requiresLogin, function(req, res, next) {
    if(req.session.location){
        pos = req.session.location;
        console.log('geolocation working')
    }else{
        pos = {
            lat: 39.5696,
            lng: 2.6502,
        };
        console.log('default palma coords - goelocation not working')
    }

    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                googleMapsClient.placesNearby({
                    location: pos,
                    radius: 1500,
                    type: 'restaurant'
                }, function(err, response) {
                    if (!err) {
                        res.render('map', {
                            title: 'Restaurants Nearby',
                            restaurants: response.json.results,
                        });
                    }
                });
            }
        });
});
router.get('/map/:id', mid.requiresLogin, function(req, res, next) {

    //get reviews from database
    Review.find({restaurantID: req.params.id})
        .sort('-created')
        .exec(function(err, reviews){
            if(err){
                err.status = 400;
                return next(err);
            }
            googleMapsClient.place({
                placeid: req.params.id,
            }, function(err, response) {
                if(err) throw err;

                let restaurant = response.json.result;
                res.render('restaurant', {
                    title: restaurant.name,
                    place: restaurant,
                    photos: restaurant.photos,
                    key: process.env.MAP_KEY,
                    reviews: reviews
                });
            });
        });
});
// GET /restaurant detail page
router.post('/map/:id', function(req, res, next) {

    Review.create(req.body, function (err) {
        if (err) {
            err.status = 400;
            return next(err);
        }else{
            console.log(req.body);
        }
        res.redirect('/map/'+ req.body.restaurantID)

    });
});

router.get('/addReview/:ID', mid.requiresLogin, function(req, res, next) {
    googleMapsClient.place({
        placeid: req.params.ID,
    }, function(err, response) {
        if (!err) {
            console.log(response.json.result.name);
            res.render('addReview', {
                title: `Review ${response.json.result.name}`,
                restaurantID: req.params.ID,
                restaurant: response.json.result
            });

        }
    });

});

/*// GET /photo
router.get('/map/photo/:photoreference', function(req, res, next) {

    googleMapsClient.placePhoto({

        photoreference: req.params.photoreference,
    }, function(err, response) {
        if(err) throw err;
        let photo = response.json.photo;
        res.send(photo);
    });
});*/



// GET /logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
    return res.render('login', { title: 'Log In'});
});

// POST /login
router.post('/login', function(req, res, next) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (error, user) {
            if (error || !user) {
                return res.render('login', {
                    error: 'Wrong email or password.',
                    title: 'Log In'
                });
            }  else {
                req.session.userId = user._id;
                return res.redirect('/map');
            }
        });
    } else {
        return res.render('login', {
            error: 'Email and password are required.',
            title: 'Log In'
        });
    }
});

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
    return res.render('register', {
        title: 'Sign Up'
    });
});

// POST /register
router.post('/register', function(req, res, next) {
    if (req.body.email &&
        req.body.name &&
        req.body.password &&
        req.body.confirmPassword) {

        // confirm that user typed same password twice
        if (req.body.password !== req.body.confirmPassword) {
            return res.render('register', {
                error: 'Passwords do not match.',
                name: req.body.name,
                email: req.body.email,
                title: 'Sign Up'
            });
        }

        // create object with form input
        var userData = {
            email: req.body.email,
            name: req.body.name,
            password: req.body.password
        };

        // use schema's `create` method to insert document into Mongo
        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/map');
            }
        });

    } else {
        return res.render('register', {
            error: 'All fields required.',
            name: req.body.name,
            email: req.body.email,
            title: 'Sign Up'
        });
    }
});

module.exports = router;
