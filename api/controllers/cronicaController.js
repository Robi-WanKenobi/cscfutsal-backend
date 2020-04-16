var express = require('express');
var router = express.Router();
var Cronica = require('../models/cronica');
var md_auth = require('../../middlewares/authenticated');
var Equipo = require('../models/equipo');

/* CREATE CRONICA */
router.post('/', md_auth.ensureAuth, function(req, res) {
    Cronica.create(req.body, function(err, cronica) {
        if (err) return next(err);
        res.json(cronica);
    });
});

/* UPDATE CRONICA */
router.put('/:id', md_auth.ensureAuth, function(req, res, next) {
    Cronica.findByIdAndUpdate(req.params.id, req.body, function(err, cronica) {
        if (err) return next(err);
        res.json(cronica);
    });
});

/* GET CRONICA BY ID */
router.get('/:id', md_auth.ensureAuth, function(req, res, next) {
    Cronica.findById(req.params.id).populate('goleadores.jugador').populate('asistentes.jugador')
        .populate('amarillas.jugador').populate('rojas.jugador').exec(function(err, cronica) {
            if (err) return next(err);
            res.json(cronica);
        });
});

/* DELETE CRONICA */
router.delete('/:idcronica/:idequipo', md_auth.ensureAuth, function(req, res, next) {
    Equipo.update({ _id: req.params.idequipo }, { "$pull": { "cronicas": req.params.idcronica } },
        function(err, post) {
            if (err) return next(err);
            Cronica.findByIdAndRemove(req.params.idcronica, req.body, function(err, cronica) {
                if (err) return next(err);
                res.json(cronica);
            });
        })
});

/* ADD JUGADOR TO CRONICA GOLEADORES */
router.post('/:id/goleadores/', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$push": { "goleadores": req.body } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

/* ADD JUGADOR TO CRONICA ASISTENTES */
router.post('/:id/asistentes/', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$push": { "asistentes": req.body } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

/* ADD JUGADOR TO CRONICA AMARILLAS */
router.post('/:id/amarillas/', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$push": { "amarillas": req.body } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

/* ADD JUGADOR TO CRONICA ROJAS */
router.post('/:id/rojas/', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$push": { "rojas": req.body } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

/* DELETE JUGADOR FROM CRONICA GOLEADORES */
router.put('/:id/goleadores/:idjugador', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$pull": { "goleadores": { "_id": req.params.idjugador } } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

/* DELETE JUGADOR FROM CRONICA ASISTENTES */
router.put('/:id/asistentes/:idjugador', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$pull": { "asistentes": { "_id": req.params.idjugador } } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

/* DELETE JUGADOR FROM CRONICA AMARILLAS */
router.put('/:id/amarillas/:idjugador', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$pull": { "amarillas": { "_id": req.params.idjugador } } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

/* DELETE JUGADOR FROM CRONICA ROJAS */
router.put('/:id/rojas/:idjugador', md_auth.ensureAuth, function(req, res, next) {
    Cronica.update({ _id: req.params.id }, { "$pull": { "rojas": { "_id": req.params.idjugador } } },
        function(err, post) {
            if (err) return next(err);
            res.json(post);
        });
});

module.exports = router;