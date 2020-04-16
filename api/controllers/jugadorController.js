var express = require('express');
var router = express.Router();
var fs = require('fs');
var Jugador = require('../models/jugador');
var Equipo = require('../models/equipo');
var md_auth = require('../../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './public/plantillas' });

/* CREATE JUGADOR */
router.post('/', md_auth.ensureAuth, function(req, res) {
    Jugador.create(req.body, function(err, jugador) {
        if (err) return next(err);
        res.json(jugador);
    });
});

/* GET JUGADOR BY ID */
router.get('/:id', function(req, res, next) {
    Jugador.findById(req.params.id).exec(function(err, jugador) {
        if (err) return next(err);
        res.json(jugador);
    });
});

/* DELETE JUGADOR */
router.delete('/:idjugador/:idequipo', md_auth.ensureAuth, function(req, res, next) {
    Jugador.findById(req.params.idjugador).exec(function(err, jugador) {
        if (err) return next(err);
        var image_name = jugador.imagen;
        if (image_name.toString().trim() !== 'player.png') {
            var path_dev = '/usr/dev/cscfutsal-backend/public/plantillas/';
            var path_prod = '/CSCFUTSAL-BACKEND/public/plantillas/';
            fs.unlink(path_prod + image_name, function(err2) {
                if (err2) throw err2;
            });
        }
        Equipo.update({ _id: req.params.idequipo }, { "$pull": { "jugadores": req.params.idjugador } },
            function(err, post) {
                if (err) return next(err);
                Jugador.findByIdAndRemove(req.params.idjugador, req.body, function(err, jugador) {
                    if (err) return next(err);
                    res.json(jugador);
                });
            })
    });
});

/* UPDATE JUGADOR */
router.put('/:id', md_auth.ensureAuth, function(req, res, next) {

    _Jugador = req.body;
    _Jugador.estadisticas.tarjetas = parseInt(_Jugador.estadisticas.amarillas) + parseInt(_Jugador.estadisticas.rojas);
    _Jugador.estadisticas.goles_pp = (parseInt(_Jugador.estadisticas.goles) / parseFloat(_Jugador.estadisticas.partidos));
    _Jugador.estadisticas.asistencias_pp = (parseInt(_Jugador.estadisticas.asistencias) / parseFloat(_Jugador.estadisticas.partidos));
    _Jugador.estadisticas.goles_encajados_pp = (parseInt(_Jugador.estadisticas.goles_encajados) / parseFloat(_Jugador.estadisticas.partidos));

    Jugador.findByIdAndUpdate(req.params.id, _Jugador, function(err, jugador) {
        if (err) return next(err);
        res.json(jugador);
    });
});

/* UPDATED JUGADOR IMAGE */
router.post('/image/:id', [md_auth.ensureAuth, md_upload], function(req, res) {

    var file_name = 'No subido';

    if (req.files) {

        console.log(req.files)
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        console.log(file_split)
        var file_name = file_split[2];
        var ext_split = file_path.split('\.');
        var file_ext = ext_split[1].toLowerCase();
        console.log(file_name);

        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg') {
            Jugador.findById(req.params.id).exec(function(err, jugador) {
                if (err) return next(err);
                var image_name = jugador.imagen;
                if (image_name.toString().trim() === 'player.png') {
                    Jugador.findByIdAndUpdate(jugador, { imagen: file_name }, { new: true }, function(err, act) {
                        if (err) {
                            res.status(500).send({ message: 'Error al actualizar el jugador' })
                        } else {
                            if (!act) {
                                res.status(404).send({ message: 'No se ha podido actualizar al jugador' })
                            } else {
                                res.status(200).send({ jugador: act })
                            }
                        }
                    })
                } else {
                    var path_dev = '/usr/dev/cscfutsal-backend/public/plantillas/';
                    var path_prod = '/CSCFUTSAL-BACKEND/public/plantillas/';
                    fs.unlink(path_prod + image_name, function(err2) {
                        if (err2) throw err2;
                        Jugador.findByIdAndUpdate(jugador, { imagen: file_name }, { new: true }, function(err, act) {
                            if (err) {
                                res.status(500).send({ message: 'Error al actualizar el jugador' })
                            } else {
                                if (!act) {
                                    res.status(404).send({ message: 'No se ha podido actualizar al jugador' })
                                } else {
                                    res.status(200).send({ jugador: act })
                                }
                            }
                        })
                    });
                }
            });
        } else {
            res.status(300).send({ message: 'Extensión no valida' });
        }
    } else {
        res.status(500).send({ message: 'No se ha subido el archivo' })
    }
});

/*GET MAX GOLEADORES CLUB*/
router.get('/stats/goles', function(req, res, next) {
    Jugador.find({ $or: [{ 'tipo': 'Jugador' }, { 'tipo': 'Porter' }] }).sort({ "estadisticas.goles": -1 }).limit(5).exec(function(err, jugadores) {
        if (err) return next(err);
        res.json(jugadores);
    });
});

/*GET MAX ASISTENTES CLUB*/
router.get('/stats/asistencias', function(req, res, next) {
    Jugador.find({ $or: [{ 'tipo': 'Jugador' }, { 'tipo': 'Porter' }] }, null, { sort: { "estadisticas.asistencias": -1 } }).limit(5).exec(function(err, jugadores) {
        if (err) return next(err);
        res.json(jugadores);
    });
});

/*GET MAX AMONESTADOS CLUB*/
router.get('/stats/tarjetas', function(req, res, next) {
    Jugador.find({ $or: [{ 'tipo': 'Jugador' }, { 'tipo': 'Porter' }] }, null, { sort: { "estadisticas.tarjetas": -1 } }).limit(5).exec(function(err, jugadores) {
        if (err) return next(err);
        res.json(jugadores);
    });
});

/*GET MIN GOLEADOS CLUB*/
router.get('/stats/porteros', function(req, res, next) {
    Jugador.find({ 'tipo': 'Porter' }, null, { sort: { "estadisticas.goles_encajados_pp": +1 } }).limit(5).exec(function(err, jugadores) {
        if (err) return next(err);
        res.json(jugadores);
    });
});

module.exports = router;