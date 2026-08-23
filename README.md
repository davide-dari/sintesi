# Ricetta Facile

App mobile per gestire e inviare richieste di ricette mediche al proprio medico di base.

## Funzionalita'

- Registrazione utente e medico con wizard guidato
- Gestione farmaci e visite
- Invio email al medico tramite mailto
- Stato aperto/chiuso studio in tempo reale
- Mappa Google Maps dello studio
- Backup/ripristino dati

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Build Android

```bash
npx cap sync android
cd android
./gradlew bundleRelease
```

## Licenza

MIT
