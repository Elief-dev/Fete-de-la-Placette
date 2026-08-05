// =====================================================================
//  Proposer un type à partir du texte saisi
// =====================================================================
//
//  Histoire 8 : « je veux décrire ce que j'apporte en langage naturel,
//  afin de ne pas avoir à réfléchir à des catégories qui ne sont pas mon
//  problème ».
//
//  COMMENT ÇA MARCHE
//  Un simple dictionnaire de mots-clés. On cherche dans le texte saisi,
//  et le premier mot-clé trouvé désigne un type.
//
//  POURQUOI PAS MIEUX
//  Une intelligence artificielle ferait ça très bien — mais l'appeler
//  depuis une page publique exigerait un serveur maison, écarté du
//  projet. Le dictionnaire est gratuit, instantané, et tourne dans le
//  navigateur.
//
//  ET QUAND ÇA SE TROMPE ?
//  Ça arrivera. C'est pour ça que le type reste MODIFIABLE : l'app
//  propose, le voisin corrige d'un geste. Une erreur visible et
//  gratuite à corriger vaut mieux qu'une détection silencieuse qui
//  fausserait la synthèse.
// =====================================================================

// Les mots-clés, rangés par type.
//
// Règle importante pour éviter les pièges : les expressions les plus
// LONGUES sont essayées en premier (voir plus bas). C'est ce qui fait
// que « salade de fruits » tombe dans les desserts et non dans les
// salades, alors que les deux contiennent le mot « salade ».
const MOTS_CLES: Record<string, string[]> = {
  // --- Salé ---
  quiche_tarte_salee: [
    'quiche', 'tarte salee', 'tarte aux courgettes', 'tarte aux poireaux',
    'tourte', 'pissaladiere', 'feuillete', 'cake sale', 'pizza',
  ],
  salade: [
    'salade verte', 'salade de riz', 'salade de pates', 'salade composee',
    'salade', 'crudites', 'carottes rapees', 'concombre',
  ],
  taboule: ['taboule', 'semoule', 'boulgour', 'couscous froid'],
  charcuterie: [
    'charcuterie', 'saucisson', 'jambon', 'pate', 'rillettes', 'terrine',
    'chorizo', 'coppa',
  ],
  fromage: [
    'fromage', 'comte', 'chevre', 'brie', 'camembert', 'roquefort',
    'mozzarella', 'feta',
  ],
  apero_grignoter: [
    'chips', 'olives', 'cacahuetes', 'tapenade', 'houmous', 'crackers',
    'gressins', 'apero', 'grignoter', 'tzatziki',
  ],
  plat_chaud: [
    'gratin', 'lasagne', 'paella', 'ratatouille', 'couscous', 'tajine',
    'curry', 'chili', 'soupe', 'plat chaud', 'riz', 'pates', 'brochettes',
    'merguez', 'barbecue',
  ],

  // --- Sucré ---
  gateau: [
    'gateau', 'cake', 'brownie', 'moelleux', 'muffin', 'quatre-quarts',
    'madeleine', 'cookies', 'financier',
  ],
  tarte_sucree: [
    'tarte aux pommes', 'tarte aux fraises', 'tarte au citron',
    'tarte sucree', 'tatin', 'clafoutis', 'crumble', 'flan',
  ],
  fruits: [
    'salade de fruits', 'fruits', 'melon', 'pasteque', 'fraises',
    'cerises', 'abricots', 'raisin',
  ],
  glace: ['glace', 'sorbet', 'esquimau', 'creme glacee'],
  autre_sucre: [
    // Pas de « chocolat » seul : le mot est plus long que « gateau »,
    // il passerait donc avant lui et enverrait « gâteau au chocolat »
    // dans la mauvaise case. Un mot-clé trop générique fait plus de
    // dégâts qu'il n'en évite.
    'mousse au chocolat', 'tiramisu', 'chocolats', 'creme', 'bonbons',
    'dessert', 'compote', 'yaourt',
  ],

  // --- Boissons sans alcool ---
  eau: ['eau plate', 'eau gazeuse', 'eau petillante', 'eau'],
  jus: ['jus de fruits', 'jus d orange', 'jus de pomme', 'jus', 'nectar'],
  soda: [
    'soda', 'limonade', 'coca', 'orangina', 'ice tea', 'sirop',
    'diabolo', 'perrier',
  ],
  cafe_the: ['cafe', 'the glace', 'the', 'infusion', 'tisane'],

  // --- Boissons avec alcool ---
  vin_rouge: ['vin rouge', 'rouge', 'bordeaux', 'cotes du rhone', 'merlot'],
  vin_blanc: ['vin blanc', 'blanc', 'chardonnay', 'muscat', 'sauvignon'],
  vin_rose: ['vin rose', 'rose', 'clairet'],
  biere: ['biere', 'ipa', 'blonde', 'pils', 'ambree'],
  cidre: ['cidre', 'poire'],
  pastis: ['pastis', 'ricard', 'anisette', 'anis'],
  autre_avec_alcool: [
    'champagne', 'cremant', 'mousseux', 'prosecco', 'sangria', 'punch',
    'whisky', 'rhum', 'kir', 'vodka', 'gin', 'hypocras',
  ],
}

// --- La table de recherche, préparée une fois pour toutes -------------
//
// On aplatit le dictionnaire en une simple liste [mot-clé, type], triée
// du mot le plus long au plus court. Le tri est ce qui garantit que
// « salade de fruits » (16 caractères) est essayé avant « salade » (6).

const TABLE: { mot: string; code: string }[] = Object.entries(MOTS_CLES)
  .flatMap(([code, mots]) => mots.map((mot) => ({ mot, code })))
  .sort((a, b) => b.mot.length - a.mot.length)

// --- Nettoyer le texte avant de chercher ------------------------------
//
// « Tarte aux Courgettes » et « tarte aux courgettes » doivent se
// comporter pareil. On passe donc tout en minuscules et on retire les
// accents.
//
// « normalize('NFD') » sépare les lettres de leurs accents (é devient
// e + ´), et « \p{Diacritic} » supprime ensuite les accents laissés
// seuls. Le « u » à la fin active cette écriture.
function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/**
 * Cherche un type correspondant au texte saisi.
 * Renvoie le code du type, ou null si rien ne correspond —
 * auquel cas le voisin choisira lui-même.
 */
export function proposerUnType(description: string): string | null {
  const texte = normaliser(description)
  if (texte.length < 3) return null

  for (const { mot, code } of TABLE) {
    if (texte.includes(mot)) return code
  }

  return null
}
