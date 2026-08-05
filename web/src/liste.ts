// =====================================================================
//  La liste des participants et la synthèse
// =====================================================================
//
//  Deux histoires d'un coup :
//
//    9 — le voisin veut voir ce que les autres apportent, pour ne pas
//        faire le quatrième taboulé
//    2 — l'organisatrice veut les totaux et la répartition
//
//  Les deux regardent les mêmes données, sous deux angles : le détail
//  nominatif d'un côté, les totaux de l'autre. D'où une seule page.
// =====================================================================

import { supabase } from './supabase'

// --- La forme des données qu'on récupère -------------------------------

export type TypeContribution = {
  code: string
  libelle: string
  categorie: string
  ordre: number
}

type ContributionLue = {
  type_code: string
  quantite: number
  description: string | null
}

type InscriptionLue = {
  id: string
  prenom: string
  complement: string | null
  nb_personnes: number
  contributions: ContributionLue[]
}

// --- Neutraliser le texte saisi par les voisins  ← IMPORTANT ----------
//
//  Tout ce qui vient de la base a été tapé par un inconnu, dans un
//  formulaire ouvert à tous. Si quelqu'un y écrivait du code, l'insérer
//  tel quel dans la page le ferait s'exécuter chez tous les visiteurs
//  suivants. C'est une faille classique, appelée « injection ».
//
//  Cette fonction transforme les caractères qui ont un sens spécial en
//  leur équivalent inoffensif. « <script> » s'affichera alors comme du
//  texte ordinaire au lieu d'être interprété.
//
//  Règle à retenir : TOUT texte venant d'un utilisateur passe par ici
//  avant d'être affiché. Sans exception.
function echapper(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')   // celui-ci en premier, sinon il abîmerait
    .replace(/</g, '&lt;')    // les remplacements suivants
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// --- Les libellés lisibles des catégories -----------------------------

const nomsDesCategories: Record<string, string> = {
  sale: 'Salé',
  sucre: 'Sucré',
  boisson_sans_alcool: 'Boissons sans alcool',
  boisson_avec_alcool: 'Boissons avec alcool',
}

// =====================================================================
//  Aller chercher les inscriptions
// =====================================================================
//
//  Une seule requête ramène tout. La partie « contributions(...) » est
//  une commodité de Supabase : parce qu'il connaît la clé étrangère
//  entre les deux tables, il sait rattacher à chaque inscription ses
//  contributions, sans qu'on écrive la jointure nous-mêmes.

async function chargerLesInscriptions(): Promise<InscriptionLue[]> {
  const { data, error } = await supabase
    .from('inscriptions')
    .select(
      'id, prenom, complement, nb_personnes, ' +
      'contributions(type_code, quantite, description)'
    )
    .order('cree_le')

  if (error) throw new Error(error.message)

  // « as unknown as » : on force TypeScript à accepter notre description
  // du résultat.
  //
  // Pourquoi c'est nécessaire ici : la bibliothèque Supabase ne connaît
  // pas la structure de NOTRE base, elle ne peut donc pas deviner la
  // forme d'un résultat imbriqué. On la lui donne à la main.
  //
  // C'est un pis-aller assumé : si on renommait une colonne dans la
  // base, TypeScript ne nous préviendrait pas ici. Il existe un outil
  // Supabase qui génère automatiquement ces descriptions à partir de la
  // vraie base — à envisager le jour où le projet grossira.
  return (data ?? []) as unknown as InscriptionLue[]
}

// =====================================================================
//  Calculer la synthèse
// =====================================================================

type Synthese = {
  personnes: number
  foyers: number
  // Pour chaque catégorie : le total, et le détail par type.
  // On garde une Map pour préserver l'ordre d'insertion.
  parCategorie: Map<string, { total: number; parType: Map<string, number> }>
  // Les descriptions déjà annoncées, rangées par type.
  // C'est ce qui évite le quatrième taboulé (histoire 9).
  descriptions: Map<string, string[]>
}

function calculerLaSynthese(
  inscriptions: InscriptionLue[],
  types: TypeContribution[]
): Synthese {
  // Un accès rapide « code du type → sa ligne de référence ».
  const parCode = new Map(types.map((t) => [t.code, t]))

  const synthese: Synthese = {
    personnes: 0,
    foyers: inscriptions.length,
    parCategorie: new Map(),
    descriptions: new Map(),
  }

  for (const inscription of inscriptions) {
    synthese.personnes += inscription.nb_personnes

    for (const contribution of inscription.contributions ?? []) {
      const type = parCode.get(contribution.type_code)
      if (!type) continue // sécurité : type inconnu, on ignore

      // Le total de la catégorie
      let categorie = synthese.parCategorie.get(type.categorie)
      if (!categorie) {
        categorie = { total: 0, parType: new Map() }
        synthese.parCategorie.set(type.categorie, categorie)
      }
      categorie.total += contribution.quantite

      // Le total du type, à l'intérieur de la catégorie.
      // C'est ici que « 3 rosés » et « 2 rosés » deviennent « 5 ».
      const dejaCompte = categorie.parType.get(type.code) ?? 0
      categorie.parType.set(type.code, dejaCompte + contribution.quantite)

      // Les précisions écrites, pour affichage
      if (contribution.description) {
        const liste = synthese.descriptions.get(type.code) ?? []
        liste.push(contribution.description)
        synthese.descriptions.set(type.code, liste)
      }
    }
  }

  return synthese
}

// =====================================================================
//  Fabriquer l'affichage
// =====================================================================

function htmlDeLaSynthese(
  synthese: Synthese,
  types: TypeContribution[]
): string {
  const parCode = new Map(types.map((t) => [t.code, t]))

  let html = `
    <p class="chiffres">
      <strong>${synthese.personnes}</strong>
      personne${synthese.personnes > 1 ? 's' : ''} attendue${synthese.personnes > 1 ? 's' : ''},
      sur ${synthese.foyers} inscription${synthese.foyers > 1 ? 's' : ''}.
    </p>
  `

  if (synthese.parCategorie.size === 0) {
    html += `<p class="aide">Personne n'a encore annoncé ce qu'il apporte.</p>`
    return html
  }

  // On parcourt les catégories dans l'ordre défini pour l'affichage,
  // pas dans l'ordre où elles sont arrivées dans la base.
  for (const codeCategorie of Object.keys(nomsDesCategories)) {
    const categorie = synthese.parCategorie.get(codeCategorie)
    if (!categorie) continue

    html += `
      <h4>
        ${nomsDesCategories[codeCategorie]}
        <span class="total">${categorie.total}</span>
      </h4>
      <ul class="par-type">
    `

    // Les types les plus nombreux en premier : c'est ce qui saute aux
    // yeux quand on cherche ce qui manque ou ce qui est en trop.
    const tries = [...categorie.parType.entries()].sort((a, b) => b[1] - a[1])

    for (const [codeType, total] of tries) {
      const libelle = parCode.get(codeType)?.libelle ?? codeType
      const precisions = synthese.descriptions.get(codeType) ?? []

      html += `<li><strong>${total}</strong> ${echapper(libelle)}`
      if (precisions.length > 0) {
        html += ` <span class="precisions">— ${precisions
          .map((p) => echapper(p))
          .join(', ')}</span>`
      }
      html += '</li>'
    }

    html += '</ul>'
  }

  return html
}

function htmlDesInscrits(
  inscriptions: InscriptionLue[],
  types: TypeContribution[]
): string {
  const parCode = new Map(types.map((t) => [t.code, t]))

  let html = '<ul class="inscrits">'

  for (const inscription of inscriptions) {
    const nom = echapper(inscription.prenom)
    const complement = inscription.complement
      ? ` <span class="complement">(${echapper(inscription.complement)})</span>`
      : ''

    const apports = (inscription.contributions ?? []).map((c) => {
      const libelle = parCode.get(c.type_code)?.libelle ?? c.type_code
      const quoi = c.description ? echapper(c.description) : echapper(libelle)
      return c.quantite > 1 ? `${c.quantite} × ${quoi}` : quoi
    })

    html += `
      <li>
        <strong>${nom}</strong>${complement}
        <span class="combien">
          ${inscription.nb_personnes} personne${inscription.nb_personnes > 1 ? 's' : ''}
        </span>
        ${
          apports.length > 0
            ? `<div class="apports">${apports.join(' · ')}</div>`
            : `<div class="apports rien">n'a pas encore choisi ce qu'il apporte</div>`
        }
      </li>
    `
  }

  return html + '</ul>'
}

// =====================================================================
//  Le point d'entrée, utilisé par main.ts
// =====================================================================

export async function afficherLaListe(
  zone: HTMLElement,
  types: TypeContribution[]
) {
  zone.innerHTML = '<p class="aide">Chargement…</p>'

  try {
    const inscriptions = await chargerLesInscriptions()

    // Le cas « base vide ». Il arrivera pour de vrai : le jour où tu
    // colles l'affiche, le premier voisin qui scanne verra cette page.
    // Un tableau vide donnerait l'impression d'une panne.
    if (inscriptions.length === 0) {
      zone.innerHTML = `
        <h3>Qui vient ?</h3>
        <p class="aide">
          Personne pour l'instant. Tu peux être la première inscription !
        </p>
      `
      return
    }

    const synthese = calculerLaSynthese(inscriptions, types)

    zone.innerHTML = `
      <h3>Ce qui est prévu</h3>
      ${htmlDeLaSynthese(synthese, types)}
      <h3>Qui vient</h3>
      ${htmlDesInscrits(inscriptions, types)}
    `
  } catch (erreur) {
    zone.innerHTML = `
      <h3>Ce qui est prévu</h3>
      <p class="erreur">
        La liste n'a pas pu être chargée :
        ${echapper(erreur instanceof Error ? erreur.message : 'erreur inconnue')}
      </p>
    `
  }
}
