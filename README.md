# Sintesi

App mobile per gestire facilmente le ricette mediche del tuo dottore.

Sintesi è pensata per utenti anziani o con difficoltà tecnologiche: interfaccia semplice, font grandi, elevate dimensioni di tocco e alto contrasto visivo.

## Funzionalità

- Registrazione guidata del profilo medico (genere, cognome, email, indirizzo, CAP, telefono, orari)
- Stato in tempo reale dello studio medico (aperto / chiuso / chiude a breve)
- Mappa Google Maps integrata dello studio
- Chiamata diretta al medico da dentro l'app
- Gestione lista farmaci e visite da richiedere
- Invio ricette via email con un solo tap
- Backup e ripristino dati tramite codice copia-incolla
- Aggiornamenti automatici da GitHub Releases

## Stack

React + TypeScript + Vite + Capacitor (Android) + Tailwind CSS

## Run Locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

## Build Android

```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

## Licenza

MIT
