# Projet : La Fête de la Placette

Application de gestion d'une fête annuelle de rue/quartier.

Fonctionnalités principales visées :
- Inscription des participants
- Indication du nombre de personnes venant par foyer/inscription
- Indication de ce que chacun apporte pour le repas partagé
- Synthèse pour l'organisatrice : nombre total de participants, 
  répartition des plats (salé / sucré), boissons (alcoolisées / 
  non alcoolisées)

# Choix techniques (validés le 2026-08-03)

Usage visé : les voisins s'inscrivent eux-mêmes depuis leur téléphone,
via un lien WhatsApp et un QR code sur une affiche. L'app doit donc
être en ligne, avec une base de données centrale.

- Langage : TypeScript (JavaScript + vérification des types)
- Base de données : PostgreSQL, en version hébergée via Supabase
- Serveur maison : aucun pour l'instant. La page communique directement
  avec Supabase. À reconsidérer plus tard comme étape d'apprentissage.
- Hébergement : à décider (point de vigilance : les offres gratuites
  mettent les projets inactifs en veille, or le QR code doit rester
  fonctionnel pendant toute la période d'inscription).

Écarté : les frameworks type React/Next.js, trop de concepts d'un coup
pour un premier projet de cette taille.

Points de vigilance :
- Données personnelles : ne collecter que le strict nécessaire et
  prévoir l'effacement de la base après la fête.
- Sécurité : une page publique donne accès à la base. Il faudra
  configurer les droits pour éviter que n'importe qui puisse lire ou
  effacer toutes les inscriptions.

# Projet Supabase (créé le 2026-08-04)

Projet « Fete-de-la-Placette », plan gratuit, région West EU (Paris).

Réglages de sécurité choisis à la création — ils déterminent le SQL des
étapes suivantes, ne pas les redécouvrir à l'aveugle :

- Enable Data API : ACTIVÉ. Indispensable, c'est par là que la page web
  parlera à la base sans serveur maison.
- Automatically expose new tables : DÉSACTIVÉ. Recommandation de Supabase
  lui-même. Les tables ne sont donc pas exposées à l'API tant qu'on n'a
  pas accordé les droits explicitement (GRANT).
- Enable automatic RLS : ACTIVÉ. Toute nouvelle table est verrouillée
  d'office.

Conséquence : il y avait DEUX verrous à ouvrir, pas un.
  1. les droits d'accès (GRANT) — parce que l'exposition auto est coupée
  2. les règles RLS (POLICY) — parce que le verrou est activé
Les deux sont ouverts depuis le 2026-08-04, voir db/policies.sql.

Structure créée : voir db/schema.sql, exécuté et vérifié le 2026-08-04
par huit essais (clé étrangère, contrainte check, cascade, jointure de
synthèse). Base vide depuis.

Droits accordés au rôle « anon » (le visiteur non connecté), vérifiés le
2026-08-04 en basculant le rôle dans l'éditeur SQL :

  Table                  Lire   Créer   Modifier   Supprimer
  types_contribution      oui     non      non         non
  inscriptions            oui     oui      non         non
  contributions           oui     oui      non         non

Ni update ni delete ne sont accordés à personne d'autre qu'à
l'organisatrice via le tableau de bord Supabase. C'est ce qui couvre en
v1 les histoires 4, 5 et 11 sans écrire une ligne de code.

Ne JAMAIS mettre la clé « service_role » dans la page web : elle ignore
toutes ces règles. Seule la clé publique (anon) y a sa place.

À traiter avant d'imprimer l'affiche avec le QR code : la mise en veille
des projets inactifs sur le plan gratuit.

# Mode de collaboration

Mon objectif principal est d'apprendre, pas d'aller vite. Priorité à 
la compréhension sur la vitesse d'exécution.

- Avant toute étape structurante (choix d'architecture, nouvelle 
  dépendance, organisation des fichiers), explique ton raisonnement 
  et propose, sans exécuter.
- Attends toujours ma validation explicite avant de passer à l'étape 
  suivante.
- Découpe le travail en petites étapes, pas en un bloc unique.
- Si tu vois plusieurs façons raisonnables de faire, présente-les 
  brièvement avec leurs avantages/inconvénients, au lieu de choisir 
  seule.
- Je ne suis pas développeuse. Vulgarise les termes techniques la 
  première fois que tu les utilises.
