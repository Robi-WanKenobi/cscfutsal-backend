var express = require('express');
var router = express.Router();
var Equipo = require('../models/equipo');
var Jugador = require('../models/jugador');
var md_auth = require('../../middlewares/authenticated');
var request = require('request');
var cheerio = require('cheerio');
var jornada_concat = '/jornada-';


/* CREATE EQUIPO */
router.post('/', md_auth.ensureAuth, function(req, res) {
    Equipo.create(req.body, function(err, equipo) {
        if (err) {
            return next(err)
        }
        res.json(equipo);
    });
});

/* GET ALL EQUIPOS */
router.get('/', function(req, res, next) {
    Equipo.find().populate('jugadores').sort({ orden: 1 }).exec(function(err, equipos) {
        if (err) return next(err);
        res.json(equipos);
    });
});

/* GET EQUIPO BY ID */
router.get('/:id', function(req, res, next) {
    Equipo.findById(req.params.id).populate('jugadores').exec(function(err, equipo) {
        if (err) return next(err);
        res.json(equipo);
    });
});

/* UPDATE EQUIPO */
router.put('/:id', md_auth.ensureAuth, function(req, res, next) {
    Equipo.findByIdAndUpdate(req.params.id, req.body, function(err, equipo) {
        if (err) return next(err);
        res.json(equipo);
    });
});

/* DELETE EQUIPO */
router.delete('/:id', md_auth.ensureAuth, function(req, res, next) {
    Equipo.findByIdAndRemove(req.params.id, req.body, function(err, equipo) {
        if (err) return next(err);
        res.json(equipo);
    });
});

/* GET CRONICAS */
router.get('/cronicas/all', function(req, res, next) {
    Equipo.find().populate('cronicas').sort({ orden: 1 }).exec(function(err, equipos) {
        if (err) return next(err);
        res.json(equipos);
    });
});

/* GET CRONICAS BY EQUIPO AND JORNADA */
router.get('/:id/cronicas/:jornada', function(req, res, next) {
    Equipo.findById(req.params.id).populate({
        path: 'cronicas',
        match: { 'jornada': req.params.jornada }
    }).exec(function(err, equipos) {
        if (err) return next(err);
        res.json(equipos);
    });
});

/* GET JUGADORES BY EQUIPO */
router.get('/jugadores/:id', function(req, res, next) {
    Equipo.findById(req.params.id).populate({
        path: 'jugadores',
        match: {
            'tipo': {
                $in: ['Jugador', 'Porter']
            }
        }
    }).exec(function(err, equipo) {
        if (err) return next(err);
        res.json(equipo);
    });
});

/* GET TECNICOS BY EQUIPO */
router.get('/tecnicos/:id', function(req, res, next) {
    Equipo.findById(req.params.id).populate({ path: 'jugadores', match: { 'tipo': 'Tècnic' } }).exec(function(err, equipo) {
        if (err) return next(err);
        res.json(equipo);
    });
});

/* ADD JUGADOR TO EQUIPO */
router.post('/:idequipo/add-jugador/:idjugador', md_auth.ensureAuth, function(req, res, next) {
    Equipo.update({ _id: req.params.idequipo }, { "$push": { "jugadores": req.params.idjugador } },
        function(err, post) {
            if (err) return next(err);
            Equipo.findById(req.params.idequipo).exec(function(err, equipo) {
                if (err) return next(err);
                Jugador.update({ _id: req.params.idjugador }, { "equipo": equipo.nombre },
                    function(err, jugador) {
                        if (err) return next(err);
                        res.json(post);
                    })
            });
        })
})

/* REMOVE JUGADOR FROM EQUIPO */
router.post('/:idequipo/remove-jugador/:idjugador', md_auth.ensureAuth, function(req, res, next) {
    Equipo.update({ _id: req.params.idequipo }, { "$pull": { "jugadores": req.params.idjugador } },
        function(err, post) {
            if (err) return next(err);
            res.json(post)
        })
})

/* ADD CRONICA TO EQUIPO */
router.post('/:idequipo/add-cronica/:idcronica', md_auth.ensureAuth, function(req, res, next) {
    Equipo.update({ _id: req.params.idequipo }, { "$push": { "cronicas": req.params.idcronica } },
        function(err, post) {
            if (err) return next(err);
            res.json(post)
        })
})

/* REMOVE CRONICA FROM EQUIPO */
router.post('/:idequipo/remove-cronica/:idcronica', md_auth.ensureAuth, function(req, res, next) {
    Equipo.update({ _id: req.params.idequipo }, { "$pull": { "cronicas": req.params.idcronica } },
        function(err, post) {
            if (err) return next(err);
            res.json(post)
        })
})

/* GET JORNADA ACTUAL BY EQUIPO */
router.get('/jornada/num/:id', function(req, res, next) {

    var jornada = {};
    var _equipo = new Equipo();

    Equipo.findById(req.params.id).exec(function(err, equipo) {
        if (err) return next(err);
        _equipo = equipo;
        request(_equipo.resultadosUrl, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                $('#select_jornada').filter(function() {
                    jornada = parseInt(($(this).find('option:selected').text()).match(/\d+/)[0]);
                });
                res.json(jornada);
            }
        });
    });
});

/* GET CLASIFICACIONES BY EQUIPO */
router.get('/clasificacion/:id/:jornada', function(req, res, next) {

    var json = [];
    var _equipo = new Equipo();

    Equipo.findById(req.params.id).exec(function(err, equipo) {
        if (err) return next(err);
        _equipo = equipo;
        request(_equipo.clasificacionUrl + jornada_concat + req.params.jornada, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                $('table.fcftable-e tbody tr').each(function(i, element) {
                    equipo = {
                        posicion: "",
                        nombre: "",
                        puntos: "",
                        jugados: "",
                        csc: false,
                        partidos: {
                            ganados: "",
                            empatados: "",
                            perdidos: ""
                        },
                        goles: {
                            favor: "",
                            contra: ""
                        }
                    };
                    equipo.posicion = $(this).find('td:nth-child(1)').text();
                    equipo.nombre = $(this).find('td:nth-child(4)').text();
                    equipo.puntos = $(this).find('td:nth-child(5)').text();
                    equipo.jugados = $(this).find('td:nth-child(6)').text();
                    equipo.partidos.ganados = $(this).find('td:nth-child(7)').text();
                    equipo.partidos.empatados = $(this).find('td:nth-child(8)').text();
                    equipo.partidos.perdidos = $(this).find('td:nth-child(9)').text();
                    equipo.goles.favor = $(this).find('td:nth-child(18)').text();
                    equipo.goles.contra = $(this).find('td:nth-child(19)').text();
                    if ((equipo.nombre === _equipo.nombreToSearch)) {
                        equipo.csc = true
                    }
                    json.push(equipo);
                });
                res.json(json);
            }
        });
    });
});

/* GET RESULTADOS BY EQUIPO */
router.get('/resultados/:id/:jornada', function(req, res, next) {

    var json = [];
    var _equipo = new Equipo();
    var partido = {
        local: "",
        visitante: "",
        resultado: "",
        fecha: "",
        lugar: ""
    };

    Equipo.findById(req.params.id).exec(function(err, equipo) {
        if (err) return next(err);
        _equipo = equipo;
        request(_equipo.resultadosUrl + jornada_concat + req.params.jornada, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                $('tr.linia').each(function(i, element) {
                    partido = {
                        local: "",
                        visitante: "",
                        resultado: "",
                        fecha: "",
                        lugar: "",
                        csc: false
                    };

                    partido.local = $(this).find('td.p-5.resultats-w-equip.tr a').text();
                    partido.visitante = $(this).find('tr.linia td.p-5.resultats-w-equip.tl a').text();
                    partido.resultado = $(this).find('tr.linia td.p-5.resultats-w-resultat.tc a div.tc.fs-17').text();
                    partido.fecha = $(this).find('tr.linia td.p-5.resultats-w-resultat.tc a div.tc.fs-9').text();
                    partido.lugar = $(this).find('tr.linia td.p-5.resultats-w-text2.tr.fs-9 a').text();
                    if ((partido.local === _equipo.nombreToSearch) || (partido.visitante === _equipo.nombreToSearch)) {
                        partido.csc = true
                    }
                    json.push(partido);
                });
                res.json(json);
            }
        });
    });
});

/* GET CALENDARIOS BY EQUIPO */
router.get('/calendario/:id', function(req, res, next) {

    var json = [];
    var jornada = {};
    var _equipo = new Equipo();

    Equipo.findById(req.params.id).exec(function(err, equipo) {
        if (err) return next(err);
        _equipo = equipo;
        request(_equipo.calendarioUrl, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                $('table.calendaritable').each(function(i, element) {
                    jornada = {
                        numero: "",
                        fecha: "",
                        partidos: []
                    };

                    jornada.numero = $(this).find('thead tr th:first-child').text();
                    jornada.fecha = $(this).find('thead tr th:last-child').text();

                    $(this).find('tbody tr').each(function(i, e) {
                        partido = {
                            local: "",
                            visitante: "",
                            res_local: "",
                            res_visitante: "",
                            csc: false
                        };

                        partido.local = $(this).find('td:first-child a').text();
                        partido.visitante = $(this).find('td:last-child a').text();
                        partido.res_local = $(this).find('td:nth-child(3)').text();
                        partido.res_visitante = $(this).find('td:nth-child(5)').text();
                        if ((partido.local === _equipo.nombreToSearch) || (partido.visitante === _equipo.nombreToSearch)) {
                            partido.csc = true
                        }
                        jornada.partidos.push(partido);
                    });
                    json.push(jornada);
                });
                res.json(json);
            }
        });
    });
});

/* GET PARTIDO BY JORNADA AND EQUIPO */
router.get('/jornada/:id/:jornada', function(req, res, next) {

    var json = [];
    var _equipo = new Equipo();
    var partido = {
        local: "",
        visitante: "",
        resultado: "",
        fecha: "",
        lugar: ""
    };
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    Equipo.findById(req.params.id).exec(function(err, equipo) {
        if (err) return next(err);
        _equipo = equipo;
        request(_equipo.resultadosUrl + jornada_concat + req.params.jornada, function(error, response, html) {
            if (!error && response.statusCode === 200) {
                var $ = cheerio.load(html);
                $('tr.linia').each(function(i, element) {
                    partido = {
                        categoria: "",
                        local: "",
                        visitante: "",
                        resultado: "",
                        fecha: "",
                        lugar: ""
                    };

                    partido.categoria = _equipo.nombre;
                    partido.local = $(this).find('td.p-5.resultats-w-equip.tr a').text();
                    partido.visitante = $(this).find('tr.linia td.p-5.resultats-w-equip.tl a').text();
                    partido.resultado = $(this).find('tr.linia td.p-5.resultats-w-resultat.tc a div.tc.fs-17').text();
                    partido.fecha = $(this).find('tr.linia td.p-5.resultats-w-resultat.tc a div.tc.fs-9').text();
                    partido.lugar = $(this).find('tr.linia td.p-5.resultats-w-text2.tr.fs-9 a').text();
                    json.push(partido);
                });

                for (var index = 0; index < json.length; index++) {
                    if ((json[index].local === _equipo.nombreToSearch) || (json[index].visitante === _equipo.nombreToSearch)) {
                        res.json(json[index]);
                    }
                }
            }
        });
    });
});

module.exports = router;