// =====================================================================
//  La connexion à la base de données
// =====================================================================
//
//  Ce fichier ne fait qu'une chose : fabriquer l'objet qui sait parler à
//  Supabase. Tout le reste du code s'en servira sans avoir à connaître
//  l'adresse ni la clé.
//
//  LES DEUX INFORMATIONS
//  Elles ne sont pas écrites ici, mais dans le fichier « .env », à la
//  racine du dossier web/. Ce fichier n'est pas envoyé sur GitHub.
//
//  ATTENTION, CONTRE-INTUITIF : la clé publique n'est PAS un secret.
//  Elle sera présente dans le code de la page, lisible par n'importe qui
//  affichant le code source. C'est prévu ainsi — Supabase l'appelle
//  d'ailleurs « publishable key », littéralement « clé publiable »
//  (c'est l'ancienne « clé anon », renommée).
//
//  Ce qui protège tes données, ce sont les règles d'accès écrites dans
//  db/policies.sql — pas la clé. C'est pour ça qu'on a passé du temps
//  dessus : personne ne peut modifier ni supprimer quoi que ce soit,
//  même en connaissant cette clé.
//
//  Les vrais secrets (les « secret keys », dont l'ancienne
//  « service_role ») n'entrent jamais dans ce projet.
// =====================================================================

import { createClient } from '@supabase/supabase-js'

// « import.meta.env » est la façon dont Vite met à disposition le
// contenu du fichier .env. Seules les variables dont le nom commence par
// VITE_ sont accessibles ici — c'est une sécurité de Vite, pour éviter
// qu'une variable sensible se retrouve par accident dans la page.
const adresseDuProjet = import.meta.env.VITE_SUPABASE_URL
const clePublique = import.meta.env.VITE_SUPABASE_ANON_KEY

// Un garde-fou : si le fichier .env est absent ou mal rempli, mieux vaut
// un message clair tout de suite qu'une page blanche inexplicable.
if (!adresseDuProjet || !clePublique) {
  throw new Error(
    "Connexion impossible : il manque VITE_SUPABASE_URL ou " +
    "VITE_SUPABASE_ANON_KEY dans le fichier web/.env. " +
    "Voir web/.env.example pour le modèle."
  )
}

// L'objet « supabase » est notre porte d'entrée vers la base.
// On l'exporte pour que les autres fichiers puissent l'utiliser.
export const supabase = createClient(adresseDuProjet, clePublique)
