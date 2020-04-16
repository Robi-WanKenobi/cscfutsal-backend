var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var cronicaSchema = new Schema({

  local: { type: String},
  visitante: { type: String},
  resultado: { type: String },
  jornada: { type: Number },
  texto: { type: String, default: 'Crònica en procés...'},
  goleadores: [
      {
        jugador: {type: Schema.Types.ObjectId, ref: 'Jugador'},
        minuto: {type: Number}
      }
    ],
  asistentes: [
    {
      jugador: {type: Schema.Types.ObjectId, ref: 'Jugador'},
      minuto: {type: Number}
    }
  ],
  amarillas: [
    {
      jugador: {type: Schema.Types.ObjectId, ref: 'Jugador'},
      minuto: {type: Number}
    }
  ],
  rojas: [
    {
      jugador: {type: Schema.Types.ObjectId, ref: 'Jugador'},
      minuto: {type: Number}
    }
  ],
  fecha_creacion: { type: Date, default: Date.now }
});
// export
module.exports = mongoose.model('Cronica', cronicaSchema);
