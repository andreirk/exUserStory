var User = require('../models/user');
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
                    })

                }
            }
        })
    });

    return api;
};