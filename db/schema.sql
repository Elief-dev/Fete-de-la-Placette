-- =====================================================================
--  La Fête de la Placette — structure de la base de données
-- =====================================================================
--
--  À QUOI SERT CE FICHIER
--  Il décrit la structure des tables, pas les inscriptions. C'est le plan
--  de la maison, pas les meubles. Si un jour tout est perdu, réexécuter ce
--  fichier recrée une base vide et correcte.
--
--  COMMENT L'UTILISER
--  Dans Supabase : menu de gauche → « SQL Editor » → coller ce contenu
--  → « Run ».
--
--  Si tu l'exécutes deux fois, PostgreSQL refusera avec un message du
--  type « relation already exists ». C'est voulu : mieux vaut une erreur
--  claire qu'un écrasement silencieux de tes données.
--
--  VOCABULAIRE
--  - une TABLE      = un tableau ; chaque ligne est un enregistrement
--  - une COLONNE    = une information, avec un type imposé
--  - une CONTRAINTE = une règle que la base fait respecter elle-même
--
--  LES TROIS TABLES
--  1. types_contribution : la liste de référence (vin rosé, quiche…)
--  2. inscriptions       : qui vient, et combien ils sont
--  3. contributions      : ce que chacun apporte
--
--  Version du 2026-08-03.
-- =====================================================================


-- ---------------------------------------------------------------------
--  TABLE 1 : types_contribution
--  La liste de référence de tout ce qu'on peut apporter.
-- ---------------------------------------------------------------------
--
--  POURQUOI CETTE TABLE ?
--  Pour que la synthèse puisse dire « Vin rosé : 5 bouteilles ».
--
--  Si chacun décrivait son apport en texte libre, Marc écrirait
--  « 3 bouteilles de rosé », Jean « rosé » et leur voisine « vin rosé de
--  Provence ». Pour un humain c'est la même chose ; pour la base, trois
--  textes différents, impossibles à additionner de façon fiable.
--
--  En choisissant dans une liste, le regroupement devient exact.
--
--  Cette table s'appelle une TABLE DE RÉFÉRENCE : elle ne contient pas
--  les données de la fête, mais le vocabulaire commun qui sert à les
--  décrire. Elle est remplie une fois pour toutes, ci-dessous.

create table types_contribution (

  -- L'étiquette technique, jamais montrée à l'écran : 'vin_rose'.
  -- Ici, pas d'uuid : le code lui-même identifie la ligne, et il reste
  -- lisible quand on regarde la table des contributions.
  code       text     primary key,

  -- Ce que verra le voisin dans la liste déroulante : « Vin rosé ».
  libelle    text     not null,

  -- La catégorie de rattachement. C'est ELLE qui alimente les grands
  -- totaux de la synthèse (salé / sucré / boissons).
  categorie  text     not null,

  -- Pour maîtriser l'ordre d'affichage dans la liste déroulante,
  -- plutôt que de subir l'ordre alphabétique.
  ordre      integer  not null,

  constraint categorie_autorisee
    check (categorie in (
      'sale',
      'sucre',
      'boisson_sans_alcool',
      'boisson_avec_alcool'
    ))
);

-- --- Le contenu de la liste -------------------------------------------
--
--  C'est la seule « donnée » de ce fichier, et elle n'a rien de personnel.
--  Cette liste est faite pour être modifiée : ajoute, retire, renomme.
--  Chaque catégorie se termine par un « Autre » qui sert de porte de
--  sortie — sans lui, quelqu'un qui apporte des sushis serait bloqué.

insert into types_contribution (code, libelle, categorie, ordre) values
  -- Salé
  ('quiche_tarte_salee', 'Quiche, tarte salée',        'sale', 10),
  ('salade',             'Salade',                     'sale', 20),
  ('taboule',            'Taboulé',                    'sale', 25),
  ('charcuterie',        'Charcuterie',                'sale', 30),
  ('fromage',            'Fromage',                    'sale', 40),
  ('apero_grignoter',    'Chips, olives, à grignoter', 'sale', 50),
  ('plat_chaud',         'Plat chaud',                 'sale', 60),
  ('autre_sale',         'Autre plat salé',            'sale', 90),

  -- Sucré
  ('gateau',             'Gâteau',                     'sucre', 110),
  ('tarte_sucree',       'Tarte sucrée',               'sucre', 120),
  ('fruits',             'Fruits, salade de fruits',   'sucre', 130),
  ('glace',              'Glace',                      'sucre', 140),
  ('autre_sucre',        'Autre dessert',              'sucre', 190),

  -- Boissons sans alcool
  ('eau',                'Eau',                'boisson_sans_alcool', 210),
  ('jus',                'Jus de fruits',      'boisson_sans_alcool', 220),
  ('soda',               'Soda, limonade',     'boisson_sans_alcool', 230),
  ('cafe_the',           'Café, thé',          'boisson_sans_alcool', 240),
  ('autre_sans_alcool',  'Autre sans alcool',  'boisson_sans_alcool', 290),

  -- Boissons avec alcool
  ('vin_rouge',          'Vin rouge',          'boisson_avec_alcool', 310),
  ('vin_blanc',          'Vin blanc',          'boisson_avec_alcool', 320),
  ('vin_rose',           'Vin rosé',           'boisson_avec_alcool', 330),
  ('biere',              'Bière',              'boisson_avec_alcool', 340),
  ('cidre',              'Cidre',              'boisson_avec_alcool', 350),
  ('pastis',             'Pastis',             'boisson_avec_alcool', 360),
  ('autre_avec_alcool',  'Autre avec alcool',  'boisson_avec_alcool', 390);


-- ---------------------------------------------------------------------
--  TABLE 2 : inscriptions
--  Une ligne = une personne ou un groupe qui vient ensemble.
-- ---------------------------------------------------------------------

create table inscriptions (

  -- L'identifiant unique de la ligne.
  --
  -- Pourquoi un « uuid » (un long identifiant aléatoire du genre
  -- 3f7a1c8e-...) plutôt qu'un simple numéro 1, 2, 3 ?
  -- Parce qu'un numéro qui se suit est devinable. Le jour où un
  -- identifiant apparaîtra dans une adresse web — ce sera le cas avec le
  -- lien secret prévu en v2 — n'importe qui pourrait essayer le suivant.
  -- Un uuid, non.
  --
  -- « primary key » = c'est LA colonne qui identifie la ligne ; la base
  -- garantit qu'il n'y aura jamais deux fois la même valeur.
  -- « default gen_random_uuid() » = si on ne fournit rien, PostgreSQL en
  -- fabrique un tout seul.
  id            uuid        primary key default gen_random_uuid(),

  -- Le prénom. « not null » = la base refuse une ligne sans prénom.
  prenom        text        not null,

  -- Le complément facultatif qui permet de distinguer deux homonymes :
  -- « 12 », « Saint-Martin », « amie de Léa ».
  -- Pas de « not null » ici : la colonne peut rester vide.
  -- Texte libre, parce que tous les participants ne sont pas des voisins
  -- de la placette — certains viennent des villages alentour.
  complement    text,

  -- Combien de personnes viennent au total sous cette inscription.
  nb_personnes  integer     not null default 1,

  -- La date et l'heure d'inscription, remplies automatiquement.
  -- « timestamptz » mémorise aussi le fuseau horaire, ce qui évite les
  -- surprises au changement d'heure.
  cree_le       timestamptz not null default now(),

  -- --- Les règles que la base fera respecter ---------------------------
  --
  -- Une contrainte « check » est un garde-fou posé dans la base
  -- elle-même. Même si le formulaire a un bug, même si quelqu'un écrit
  -- directement dans la base, ces règles tiennent.

  -- Au moins une personne : « 0 personne qui vient » n'a pas de sens.
  constraint nb_personnes_positif
    check (nb_personnes >= 1),

  -- Subtilité utile : « not null » interdit l'absence de valeur, mais
  -- PAS une chaîne vide ni une suite d'espaces. Il faut donc l'écrire.
  -- « trim » enlève les espaces autour, « length » compte les caractères.
  constraint prenom_non_vide
    check (length(trim(prenom)) > 0)
);


-- ---------------------------------------------------------------------
--  TABLE 3 : contributions
--  Une ligne = UNE chose apportée, avec sa quantité.
--  Une inscription peut en avoir zéro, une ou plusieurs — c'est tout
--  l'intérêt d'avoir séparé les tables plutôt que de prévoir des colonnes
--  fixes « plat1 », « plat2 », « plat3 ».
-- ---------------------------------------------------------------------

create table contributions (

  id              uuid        primary key default gen_random_uuid(),

  -- LA CLÉ ÉTRANGÈRE : le fil qui relie cette contribution à son
  -- inscription. C'est le cœur du « relationnel » de PostgreSQL.
  --
  -- « references inscriptions(id) » : la base REFUSERA une contribution
  -- rattachée à une inscription qui n'existe pas. La cohérence n'est plus
  -- une affaire de confiance dans le code, elle est garantie ici.
  --
  -- « on delete cascade » : si l'inscription est supprimée, ses
  -- contributions disparaissent avec elle, automatiquement. Sans ça, une
  -- annulation laisserait des plats orphelins qui fausseraient la
  -- synthèse.
  inscription_id  uuid        not null
                              references inscriptions(id) on delete cascade,

  -- Le type choisi dans la liste de référence.
  --
  -- Ici PAS de « on delete cascade », et c'est délibéré : le comportement
  -- par défaut est l'inverse. Si tu tentes de supprimer le type
  -- « Vin rosé » alors que des contributions l'utilisent, la base
  -- refusera. Elle protège tes données contre une suppression distraite.
  type_code       text        not null
                              references types_contribution(code),

  -- Combien : 3 bouteilles, 2 quiches, 1 gâteau.
  quantite        integer     not null default 1,

  -- Une précision libre, FACULTATIVE, qui vient enrichir le type :
  -- « rosé de Provence », « tarte aux courgettes », « sans gluten ».
  --
  -- Le type seul suffit à s'inscrire : on peut s'engager sur un plat salé
  -- sans savoir encore lequel. Le type porte le comptage, la description
  -- porte le détail.
  description     text,

  cree_le         timestamptz not null default now(),

  -- Au moins un exemplaire.
  constraint quantite_positive
    check (quantite >= 1),

  -- Une description a le droit d'être absente, pas d'être vide.
  -- Les deux ne se ressemblent qu'en surface.
  constraint description_non_vide
    check (description is null or length(trim(description)) > 0)
);


-- ---------------------------------------------------------------------
--  OÙ EST PASSÉE LA COLONNE « catégorie » ?
-- ---------------------------------------------------------------------
--
--  Elle n'est pas dans cette table, et c'est volontaire.
--
--  La catégorie se DÉDUIT du type : si le type est « vin_rose », la
--  catégorie est forcément « boisson_avec_alcool ». L'information est
--  déjà dans types_contribution ; la stocker une seconde fois ici
--  créerait un risque de contradiction entre les deux.
--
--  Règle générale, valable bien au-delà de ce projet : on ne stocke pas
--  ce qu'on peut déduire. C'est la même raison qui fait qu'il n'y a pas
--  de table « synthèse » — les totaux se calculent à la demande.
--
--  Concrètement, la synthèse fera une JOINTURE : elle rapprochera les
--  contributions de leur type pour retrouver la catégorie. C'est
--  l'opération de base d'une base relationnelle, on la verra en détail
--  au moment de construire la page de synthèse.


-- ---------------------------------------------------------------------
--  INDEX
-- ---------------------------------------------------------------------
--
--  Un index est un répertoire : il permet à la base de retrouver vite
--  toutes les contributions d'une inscription, au lieu de parcourir
--  toute la table.
--
--  Honnêtement : avec trente inscriptions, ça ne changera rien du tout.
--  On les met parce que c'est le bon réflexe — PostgreSQL n'en crée pas
--  automatiquement sur les clés étrangères, contrairement à ce que
--  beaucoup croient.

create index contributions_inscription_id_idx
  on contributions (inscription_id);

create index contributions_type_code_idx
  on contributions (type_code);


-- ---------------------------------------------------------------------
--  VERROU DE SÉCURITÉ  ← à lire attentivement
-- ---------------------------------------------------------------------
--
--  Dans Supabase, une table créée en SQL est par défaut accessible à
--  quiconque possède la clé publique de l'application — en lecture ET en
--  écriture. Autrement dit : grande ouverte.
--
--  Les lignes ci-dessous activent la « sécurité au niveau des lignes »
--  (Row Level Security). Tant qu'aucune règle d'accès n'a été écrite,
--  cela BLOQUE TOUT depuis l'extérieur : personne ne peut lire ni écrire
--  via l'application.
--
--  C'est volontaire. On préfère une base fermée qu'on ouvre ensuite avec
--  discernement, plutôt qu'une base ouverte qu'on pense à fermer un jour.
--
--  Conséquence : tant que l'étape suivante (les règles d'accès) n'est pas
--  faite, la base n'est manipulable que depuis l'interface Supabase. Le
--  formulaire ne fonctionnera pas encore. Ce n'est pas une panne, c'est
--  le verrou.

alter table types_contribution enable row level security;
alter table inscriptions       enable row level security;
alter table contributions      enable row level security;


-- =====================================================================
--  ET APRÈS ?
--
--  1. Vérifier que les trois tables apparaissent dans « Table Editor »,
--     et que types_contribution contient bien ses 25 lignes
--  2. Faire les essais de la checklist (voir la conversation)
--  3. Effacer les données de test
--  4. Étape suivante : écrire les règles d'accès
--
--  Ce qui viendra plus tard, et qui n'est pas ici :
--  - jeton_modification  → le lien secret (histoire 1b, v2)
--  - une colonne « année » → non retenue : on vide les tables après la
--    fête, conformément à l'histoire 11 (effacement des données)
-- =====================================================================
