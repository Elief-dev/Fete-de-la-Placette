import { defineConfig } from 'vite'

// Le site sera servi par GitHub Pages à l'adresse
// https://elief-dev.github.io/Fete-de-la-Placette/ — donc dans un
// sous-dossier, pas à la racine. Sans ce réglage, les fichiers CSS et
// JS générés par la construction chercheraient au mauvais endroit et
// la page resterait blanche.
export default defineConfig({
  base: '/Fete-de-la-Placette/',
})
