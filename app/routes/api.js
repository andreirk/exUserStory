var User = require('../models/user');
var Story = require('../models/story');

var config = require('../../config');
var jwt = require('jsonwebtoken');
var secretKey = config.secretKey;


function createToken(user){
     var token = jwt.sign({
         id: user.id,
         username: user.username,
         name: user.name
     }, secretKey,{
         expiresIn: '120m'
     });

     return token;
}

module.exports = function(app, express) {
    api = express.Router();

    api.post('/signup', function(req, res){

        var user = new User({
            name : req.body.name,
            username: req.body.username,
            password: req.body.password,
        });

        user.save(function(err){
            if(err){
                res.send(err);
                return;
            }
            res.json({message: 'User   has been created'});
        });
    });


    api.get('/users', function (req, res) {
        
        User.find({}, function(err, users) {
            if(err){
                res.send(err);
                return;
            }
            res.json(users);
        });
    });

    api.post('/login', function(req, res){

        User.findOne({
            username: req.body.username,
        }).select('password').exec(function(err, user){
            if(err){
                throw err;
            }
            if(!user){
                res.send({message: 'User doesnt exist'});
            } else {
                var validPassword = user.comparePassword(req.body.password);

                if(!validPassword){
                    res.send({message: 'invalid Password'});
                } else {
                    ///// token
                    var token = createToken(user);

                    res.json({
                        success:true,
                        message: 'Successfuli login',
                        token: token
                    });

                }
            }
        });
    });

    api.use(function(req, res, next){
        console.log('Somebody juct came to our app');
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        if(token){
            jwt.verify(token, secretKey, function (err, decoded) {
                
                if(err){
                    res.status(403).send({success: false, message: 'Faild to auhenticate user'});

                }
                req.decoded = decoded;

                next();

            });
        } else {
            res.status(403).send({success: false, message: 'No token provided'});
        }
    });


  api.route('/')
    .post(function (req, res) {
        var story = new Story({
            creator: req.decoded.id,
            content: req.body.content,
        });

        story.save(function (err) {
            if(err){
                res.send(err);  
                return;
            }
            res.json({message: "New story created"});
        });
    })

    .post(function (req, res) {
        Story.find({creator: req.decoded.id}, function (err, stories) {
            if(err){
                res.send(err);
                return; 
            }
            res.json(stories);
        });
    })

    return api;
};