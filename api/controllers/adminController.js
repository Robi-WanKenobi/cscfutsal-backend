var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var Admin = require('../models/admin');
var md_auth = require('../../middlewares/authenticated');

/* LOGIN */
router.post('/login', function(req, res) {

    var params = req.body;
    var usuario = params.usuario;
    var password = params.password;

    Admin.findOne({ usuario: usuario }).exec(function(err, admin) {
        if (err) {
            res.status(500).send({ message: 'Error al iniciar sesión' })
        } else {
            if (admin) {
                bcrypt.compare(password, admin.password, function(err, check) {
                    if (check) {
                        res.status(200).jsonp({
                            user: check,
                            token: md_auth.createToken(admin)
                        });
                    } else {
                        res.status(404).send({ message: 'Contraseña incorrecta' })
                    }
                })
            } else {
                res.status(404).send({ message: 'Usuario incorrecto' });
            }
        }
    });
});

/* ADD ADMIN */
// router.post('/add', function(req, res) {

//   var admin = new Admin();
//   var params = req.body;

//   if(params.usuario && params.password){
//     admin.usuario = params.usuario;
//     admin.password = params.password;
//     bcrypt.hash(params.password, 10, function (err, hash) {
//       admin.password = hash;
//         Admin.create(admin, function (err, admin) {
//           if (err) return next(err);
//           res.json(admin);
//         });
//     })
//   }
// });

/* DELETE ADMIN */
/*router.delete('/login/:id', function(req, res, next) {
  Admin.findByIdAndRemove(req.params.id, req.body, function (err, jugador) {
    if (err) return next(err);
    res.json(jugador);
  });
});*/

module.exports = router;