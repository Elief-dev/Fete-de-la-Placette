// =====================================================================
//  Premier écran : afficher les types de contribution
// =====================================================================
//
//  Cette page ne sert pas encore à s'inscrire. Elle a un seul but :
//  prouver que toute la chaîne fonctionne.
//
//    la page  →  la connexion  →  les droits (GRANT)
//             →  les règles (RLS)  →  la lecture des données
//
//  Si les 25 types s'affichent, c'est que tout le socle invisible
//  construit jusqu'ici fonctionne de bout en bout.
// =====================================================================

import './style.css'
import { supabase } from './supabase'

// --- Les libellés lisibles des quatre catégories ----------------------
//
// En base, les catégories sont écrites sans accent ni espace
// ('boisson_avec_alcool') parce que ce sont des étiquettes techniques.
// Ici on les traduit pour l'affichage.

const nomsDesCategories: Record<string, string> = {
  sale: 'Salé',
  sucre: 'Sucré',
  boisson_sans_alcool: 'Boissons sans alcool',
  boisson_avec_alcool: 'Boissons avec alcool',
}

// --- La forme d'une ligne de la table types_contribution --------------
//
// C'est ici que TypeScript gagne sa place : on décrit à quoi ressemble
// une ligne, et l'éditeur nous prévient si on écrit « libele » au lieu
// de « libelle ».

type TypeContribution = {
  code: string
  libelle: string
  categorie: string
  ordre: number
}

// --- Aller chercher les données et les afficher -----------------------

async function afficherLesTypes() {
  const zone = document.querySelector<HTMLDivElement>('#app')!

  zone.innerHTML = '<p>Chargement…</p>'

  // La requête. En français : « dans la table types_contribution,
  // donne-moi toutes les colonnes, triées par ordre croissant ».
  // C'est l'équivalent du « select * from types_contribution order by
  // ordre » qu'on écrivait dans l'éditeur SQL de Supabase.
  const { data, error } = await supabase
    .from('types_contribution')
    .select('*')
    .order('ordre')

  // Supabase ne déclenche pas d'erreur bloquante : il renvoie soit des
  // données, soit une erreur. À nous de regarder laquelle.
  if (error) {
    zone.innerHTML = `
      <h1>Ça n'a pas marché</h1>
      <p>La base a répondu :</p>
      <pre>${error.message}</pre>
    `
    return
  }

  const types = (data ?? []) as TypeContribution[]

  if (types.length === 0) {
    zone.innerHTML = `
      <h1>Connexion établie</h1>
      <p>Mais la table est vide. As-tu bien exécuté db/schema.sql ?</p>
    `
    return
  }

  // On regroupe les types par catégorie pour l'affichage.
  const parCategorie = new Map<string, TypeContribution[]>()
  for (const type of types) {
    const liste = parCategorie.get(type.categorie) ?? []
    liste.push(type)
    parCategorie.set(type.categorie, liste)
  }

  // On fabrique le HTML, catégorie par catégorie.
  let contenu = `
    <h1>La Fête de la Placette 2027</h1>
    <p class="sous-titre">
      ${types.length} types de contribution lus depuis la base.
    </p>
  `

  for (const [categorie, liste] of parCategorie) {
    const titre = nomsDesCategories[categorie] ?? categorie
    contenu += `<h2>${titre}</h2><ul>`
    for (const type of liste) {
      contenu += `<li>${type.libelle}</li>`
    }
    contenu += '</ul>'
  }

  zone.innerHTML = contenu
}

afficherLesTypes()
