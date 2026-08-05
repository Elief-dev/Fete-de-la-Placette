// =====================================================================
//  La page d'inscription
// =====================================================================
//
//  Étape en cours : A2 — le formulaire enregistre réellement dans la
//  base. Reste à faire : la proposition automatique du type (A3).
// =====================================================================

import './style.css'
import { supabase } from './supabase'

// --- Les informations de la fête --------------------------------------
//
// Du texte, pas des données. Ça ne change qu'une fois par an : inutile
// de créer une table pour ça. On modifie ici, et c'est tout.

const LA_FETE = {
  titre: 'La Fête de la Placette 2027',
  quand: 'Samedi 12 juin 2027',
  ou: 'La Placette, Ansouis',
}

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

type TypeContribution = {
  code: string
  libelle: string
  categorie: string
  ordre: number
}

// =====================================================================
//  Fabrication des morceaux de page
// =====================================================================

// Le menu déroulant des types, avec un sous-titre par catégorie.
// « optgroup » est la balise HTML qui crée ces sous-titres — ils ne sont
// pas sélectionnables, ils servent juste à organiser la liste.
function menuDesTypes(types: TypeContribution[]): string {
  let options = '<option value="">Choisir…</option>'

  for (const nomCourt of Object.keys(nomsDesCategories)) {
    const deCetteCategorie = types.filter((t) => t.categorie === nomCourt)
    if (deCetteCategorie.length === 0) continue

    options += `<optgroup label="${nomsDesCategories[nomCourt]}">`
    for (const type of deCetteCategorie) {
      options += `<option value="${type.code}">${type.libelle}</option>`
    }
    options += '</optgroup>'
  }

  return options
}

// Une ligne « ce que j'apporte ». On peut en ajouter autant qu'on veut.
function ligneDeContribution(types: TypeContribution[]): string {
  return `
    <div class="contribution">
      <select class="champ-type">
        ${menuDesTypes(types)}
      </select>
      <input class="champ-quantite" type="number" min="1" value="1"
             aria-label="Quantité" />
      <input class="champ-description" type="text"
             placeholder="précision (facultatif)"
             aria-label="Précision" />
      <button type="button" class="supprimer" aria-label="Retirer">
        × retirer
      </button>
    </div>
  `
}

// =====================================================================
//  Enregistrer une inscription
// =====================================================================
//
//  L'écriture se fait en DEUX temps, parce que les données vivent dans
//  deux tables :
//
//    1. créer la ligne dans « inscriptions », et récupérer son
//       identifiant — c'est la base qui le fabrique, on ne le connaît
//       pas avant
//    2. créer les lignes de « contributions », en y inscrivant cet
//       identifiant : c'est le fil qui les rattache à l'inscription
//
//  Impossible de faire l'inverse : une contribution sans inscription
//  existante serait refusée par la clé étrangère.

// Ce qu'on lit dans une ligne du formulaire.
type ContributionSaisie = {
  type_code: string
  quantite: number
  description: string | null
}

// Parcourt les lignes affichées et en extrait les contributions.
// Les lignes restées sur « Choisir… » sont simplement ignorées : un
// voisin qui ajoute une ligne par erreur ne doit pas être bloqué.
function lireLesContributions(): ContributionSaisie[] {
  const saisies: ContributionSaisie[] = []

  const lignes = document.querySelectorAll<HTMLDivElement>('.contribution')

  for (const ligne of lignes) {
    const type = ligne.querySelector<HTMLSelectElement>('.champ-type')!.value
    if (!type) continue

    const quantite =
      Number(ligne.querySelector<HTMLInputElement>('.champ-quantite')!.value) || 1

    const description = ligne
      .querySelector<HTMLInputElement>('.champ-description')!
      .value.trim()

    saisies.push({
      type_code: type,
      quantite,
      // La base accepte l'absence de description, mais pas une chaîne
      // vide (contrainte « description_non_vide »). D'où ce « null ».
      description: description === '' ? null : description,
    })
  }

  return saisies
}

async function enregistrer(formulaire: HTMLFormElement) {
  const champs = new FormData(formulaire)

  const prenom = String(champs.get('prenom') ?? '').trim()
  const complement = String(champs.get('complement') ?? '').trim()
  const nbPersonnes = Number(champs.get('nb_personnes') ?? 1)

  const contributions = lireLesContributions()

  // --- Temps 1 : l'inscription --------------------------------------
  //
  // « .select('id').single() » demande à Supabase de renvoyer la ligne
  // qui vient d'être créée, pour qu'on récupère son identifiant.
  // C'est possible parce qu'on a accordé le droit de lecture au visiteur.
  const { data: inscription, error: erreurInscription } = await supabase
    .from('inscriptions')
    .insert({
      prenom,
      complement: complement === '' ? null : complement,
      nb_personnes: nbPersonnes,
    })
    .select('id')
    .single()

  if (erreurInscription) {
    throw new Error(erreurInscription.message)
  }

  // --- Temps 2 : les contributions ----------------------------------
  //
  // Un seul appel pour toutes les lignes : on envoie un tableau.
  if (contributions.length > 0) {
    const lignes = contributions.map((c) => ({
      ...c,
      inscription_id: inscription.id,
    }))

    const { error: erreurContributions } = await supabase
      .from('contributions')
      .insert(lignes)

    if (erreurContributions) {
      // Cas rare mais à connaître : l'inscription est créée, les plats
      // non. On ne peut pas annuler l'inscription — le visiteur n'a pas
      // le droit de supprimer, et c'est voulu. On le dit honnêtement.
      throw new Error(
        "L'inscription est enregistrée, mais pas ce que tu apportes. " +
        "Préviens l'organisatrice. (" + erreurContributions.message + ")"
      )
    }
  }

  return contributions.length
}

// =====================================================================
//  La page
// =====================================================================

function afficherLaPage(types: TypeContribution[]) {
  const zone = document.querySelector<HTMLDivElement>('#app')!

  zone.innerHTML = `
    <header>
      <h1>${LA_FETE.titre}</h1>
      <p class="infos-fete">
        <strong>${LA_FETE.quand}</strong><br />
        ${LA_FETE.ou}
      </p>
    </header>

    <form id="formulaire">
      <h2>Je m'inscris</h2>

      <label>
        Prénom
        <input name="prenom" type="text" required maxlength="40" />
      </label>

      <label>
        Précision <span class="facultatif">(facultatif)</span>
        <input name="complement" type="text" maxlength="40"
               placeholder="Martin, amie de Léa, du village…" />
        <small>Utile s'il y a plusieurs personnes du même prénom.</small>
      </label>

      <label>
        Nous serons
        <input name="nb_personnes" type="number" min="1" value="1"
               required />
      </label>

      <fieldset>
        <legend>Ce que j'apporte</legend>
        <p class="aide">
          Tu peux en ajouter plusieurs, ou aucun si tu ne sais pas encore.
        </p>
        <div id="contributions"></div>
        <button type="button" id="ajouter" class="secondaire">
          + Ajouter quelque chose
        </button>
      </fieldset>

      <p class="note">
        Ton prénom, ta précision, le nombre de personnes et ce que tu
        apportes seront <strong>visibles par les autres participants</strong>,
        pour éviter que tout le monde apporte la même chose.
        Rien d'autre n'est demandé.
      </p>

      <button type="submit">Je m'inscris</button>

      <p id="message" role="status"></p>
    </form>
  `

  const listeContributions =
    document.querySelector<HTMLDivElement>('#contributions')!
  const message = document.querySelector<HTMLParagraphElement>('#message')!

  // --- Ajouter une ligne ---
  document
    .querySelector<HTMLButtonElement>('#ajouter')!
    .addEventListener('click', () => {
      listeContributions.insertAdjacentHTML(
        'beforeend',
        ligneDeContribution(types)
      )
    })

  // --- Retirer une ligne ---
  //
  // On écoute les clics sur le conteneur plutôt que sur chaque bouton :
  // les lignes n'existent pas encore au moment où on écrit ce code.
  // C'est une technique courante, appelée « délégation d'événement ».
  listeContributions.addEventListener('click', (evenement) => {
    const cible = evenement.target as HTMLElement
    if (cible.classList.contains('supprimer')) {
      cible.closest('.contribution')?.remove()
    }
  })

  // --- Envoi du formulaire ---
  //
  // « preventDefault » empêche le comportement par défaut du navigateur,
  // qui serait de recharger la page. On veut gérer l'envoi nous-mêmes.
  const formulaire = document.querySelector<HTMLFormElement>('#formulaire')!
  const bouton = formulaire.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  )!

  formulaire.addEventListener('submit', async (evenement) => {
    evenement.preventDefault()

    // On désactive le bouton pendant l'envoi. Sans ça, un voisin
    // impatient qui clique deux fois créerait deux inscriptions —
    // exactement ce qui était arrivé avec la quiche enregistrée en
    // double dans l'éditeur SQL.
    bouton.disabled = true
    bouton.textContent = 'Enregistrement…'
    message.textContent = ''
    message.className = ''

    try {
      const nbContributions = await enregistrer(formulaire)

      message.className = 'ok'
      message.textContent =
        nbContributions === 0
          ? 'Merci ! Ton inscription est enregistrée. À bientôt !'
          : `Merci ! Ton inscription est enregistrée, avec ` +
            `${nbContributions} contribution${nbContributions > 1 ? 's' : ''}. ` +
            `À bientôt !`

      // On vide le formulaire et on repart d'une ligne vierge.
      formulaire.reset()
      listeContributions.innerHTML = ''
      listeContributions.insertAdjacentHTML(
        'beforeend',
        ligneDeContribution(types)
      )
    } catch (erreur) {
      message.className = 'erreur'
      message.textContent =
        erreur instanceof Error ? erreur.message : "Quelque chose a échoué."
    } finally {
      // « finally » s'exécute dans tous les cas, succès comme échec.
      // Sans lui, une erreur laisserait le bouton désactivé pour
      // toujours et le visiteur ne pourrait plus rien faire.
      bouton.disabled = false
      bouton.textContent = "Je m'inscris"
    }
  })

  // Une première ligne de contribution, pour que ce ne soit pas vide.
  listeContributions.insertAdjacentHTML(
    'beforeend',
    ligneDeContribution(types)
  )
}

// =====================================================================
//  Démarrage
// =====================================================================

async function demarrer() {
  const zone = document.querySelector<HTMLDivElement>('#app')!
  zone.innerHTML = '<p>Chargement…</p>'

  const { data, error } = await supabase
    .from('types_contribution')
    .select('*')
    .order('ordre')

  if (error) {
    zone.innerHTML = `
      <h1>Ça n'a pas marché</h1>
      <p>La base a répondu :</p>
      <pre>${error.message}</pre>
    `
    return
  }

  afficherLaPage((data ?? []) as TypeContribution[])
}

demarrer()
