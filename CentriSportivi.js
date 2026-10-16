/********************************************************************
 * FILE DI CONFIGURAZIONE: CENTRI SPORTIVI & AMMINISTRATORI
 * Modifica questo file per aggiungere campi, cambiare coordinate
 * o abilitare le email Google dei Gestori e degli Amministratori.
 ********************************************************************/

// 1. EMAIL SUPER-ADMIN (PROPRIETARIO DELL'APP)
// Inserisci qui la tua email Google per sbloccare la scheda "👑 Admin"
window.ADMIN_EMAILS = [
  "flegreamatch@gmail.com"
];

// 2. LISTA DEI CENTRI SPORTIVI DELLA ZONA FLEGREA
// Per abilitare il gestore di un centro sportivo, inserisci la sua email Google
// dentro l'array "managerEmails" della sua struttura.
window.VENUES_CONFIG = [
  {
    id: "da_innaro",
    name: "Agriturismo Da Innaro",
    shortName: "Da Innaro",
    city: "Monte di Procida",
    address: "Via Amedeo 92, Monte di Procida",
    lat: 40.80373,
    lng: 14.04886,
    managerEmails: [
      "domenico.colandrea007@gmail.com" 
    ],
    pitches: [
      { id: "innaro_c1", name: "Campo 1 (C5)", format: "C5", maxPlayers: 10 },
      { id: "innaro_c2", name: "Campo 2 (C5)", format: "C5", maxPlayers: 10 }
    ]
  },
  
  
  {
    id: "maracana_bacoli",
    name: "Centro Sportivo Maracanà",
    shortName: "Maracanà",
    city: "Bacoli",
    address: "Viale Olimpico 150, Bacoli",
    lat: 40.80258,
    lng: 14.06186,
    managerEmails: [],
    pitches: [
      { id: "maracana_c1", name: "Campo 1 (C5)", format: "C5", maxPlayers: 10 },
      { id: "maracana_c2", name: "Campo 2 (C5)", format: "C5", maxPlayers: 10 }
    ]
  },
  {
    id: "calcetto_zeus",
    name: "ASD Calcetto Zeus",
    shortName: "Zeus",
    city: "Bacoli",
    address: "Via Ottaviano Augusto 65, Bacoli",
    lat: 40.81729,
    lng: 14.06155,
    managerEmails: [],
    pitches: [
      { id: "zeus_c1", name: "Campo Zeus (C5)", format: "C5", maxPlayers: 10 }
    ]
  },
  {
    id: "oblio_calcetto",
    name: "Oblio Calcetto Miliscola",
    shortName: "Oblio",
    city: "Bacoli",
    address: "Via Lido Miliscola 40, Bacoli",
    lat: 40.7906 ,
    lng: 14.0763 ,
    managerEmails: [],
    pitches: [
      { id: "oblio_c1", name: "Campo Miliscola (C5)", format: "C5", maxPlayers: 10 }
    ]
  },
  {
    id: "oasi_pozzuoli",
    name: "Centro Sportivo Oasi",
    shortName: "C.S. Oasi",
    city: "Pozzuoli",
    address: "Via Campana 237, Pozzuoli",
    lat: 40.8385 ,
    lng: 14.1039 ,
    managerEmails: [],
    pitches: [
      { id: "oasi_c5", name: "Campo A (C5)", format: "C5", maxPlayers: 10 },
      { id: "oasi_c8", name: "Campo Grande (Calciotto)", format: "C8", maxPlayers: 16 }
    ]
  },
  {
    id: "monterusciello_sport",
    name: "Centro Sportivo Monterusciello",
    shortName: "Monterusciello",
    city: "Pozzuoli",
    address: "Via Cosimo Luigi Miccoli, Monterusciello",
    lat: 40.86542,
    lng: 14.07718,
    managerEmails: [],
    pitches: [
      { id: "mont_c5", name: "Campo C5", format: "C5", maxPlayers: 10 },
      { id: "mont_c8", name: "Campo Calciotto (C8)", format: "C8", maxPlayers: 16 }
    ]
  },
  
  {
    id: "san_germano",
    name: "San Germano Football & More",
    shortName: "San Germano",
    city: "Agnano",
    address: "Via Antonio Beccadelli 75, Agnano",
    lat: 40.8267,
    lng: 14.1685,
    managerEmails: [],
    pitches: [
      { id: "sg_c5", name: "Campo 1 (C5)", format: "C5", maxPlayers: 10 },
      { id: "sg_c8", name: "Campo Calciotto (C8)", format: "C8", maxPlayers: 16 }
    ]
  },
  {
    id: "sporting_agnano",
    name: "Sporting Club Agnano",
    shortName: "Sporting Agnano",
    city: "Agnano / Pozzuoli",
    address: "Via Agnano agli Astroni 293, Agnano",
    lat: 40.83852,
    lng: 14.16741,
    managerEmails: [],
    pitches: [
      { id: "sp_agnano_c5", name: "Campo C5", format: "C5", maxPlayers: 10 },
      { id: "sp_agnano_c8", name: "Campo Calciotto (C8)", format: "C8", maxPlayers: 16 }
    ]
  },
  
];
