var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var equipoSchema = new Schema({

    nombre: { type: String },
    nombreToSearch: { type: String },
    orden: { type: Number },
    liga: { type: String },
    resultadosUrl: { type: String },
    clasificacionUrl: { type: String },
    calendarioUrl: { type: String },
    jugadores: [{ type: Schema.Types.ObjectId, ref: 'Jugador' }],
    cronicas: [{ type: Schema.Types.ObjectId, ref: 'Cronica' }]

});

// export
module.exports = mongoose.model('Equipo', equipoSchema);