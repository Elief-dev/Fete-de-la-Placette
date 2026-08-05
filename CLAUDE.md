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
synthèse).

Base vidée de ses données de test le 2026-08-05, après validation du
formulaire et de la liste. Elle ne contient plus que les 25 types de
référence. Prête à recevoir de vraies inscriptions.

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

# L'application web (créée le 2026-08-05)

Vite + TypeScript, dans le dossier web/. Installée en local uniquement,
pas encore hébergée.

UNE SEULE PAGE : le formulaire d'inscription, et juste en dessous la
liste des inscrits avec la synthèse. Pas de navigation entre pages —
le voisin voit ce que les autres apportent pendant qu'il remplit son
propre formulaire, ce qui est tout l'intérêt de l'histoire 9.

  src/supabase.ts     la connexion à la base
  src/main.ts         la page, le formulaire, l'enregistrement
  src/proposition.ts  dictionnaire de mots-clés : texte libre → type
  src/liste.ts        la liste des inscrits et la synthèse

Conventions à respecter dans tout ajout de code :

- TOUT texte saisi par un utilisateur passe par la fonction echapper()
  de liste.ts avant d'être inséré dans la page. Le risque d'injection
  est réel : l'écriture en base est ouverte au public. Vérifié le
  2026-08-05 en tentant d'injecter une balise script.
- Le type d'une contribution est PROPOSÉ, jamais imposé. Une ligne
  décrite sans type choisi est refusée à l'envoi, jamais ignorée en
  silence : une perte silencieuse est le pire des comportements.
- La date et le lieu de la fête sont du texte en dur, dans la constante
  LA_FETE en haut de src/main.ts. Pas de table pour ça, ça change une
  fois par an. Actuellement : samedi 12 juin 2027, La Placette, Ansouis.

# Environnement de travail

Poste professionnel Windows, sans droits administrateur.

- Node.js et npm sont installés. MAIS la politique de sécurité
  PowerShell interdit l'exécution du script npm.ps1. Il faut écrire
  « npm.cmd run dev » et non « npm run dev ».
  Ne JAMAIS proposer de modifier Set-ExecutionPolicy : c'est un réglage
  imposé par l'entreprise, et le .cmd règle le problème sans rien
  toucher.
- Emma lance elle-même le serveur de développement depuis le terminal
  intégré de VS Code (View → Terminal), après « cd web ».
- Les autorisations OAuth vers des services tiers peuvent être bloquées
  (constaté avec la connexion GitHub depuis Supabase). Prévoir un
  contournement par inscription email classique.

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
- À la fin de chaque étape aboutie, mets à jour la section « Où en est
  le projet » du README.md, et consigne dans ce fichier les décisions
  structurantes prises en chemin. Entre deux sessions, le contenu du
  repo est ta seule mémoire du projet : ce qui n'y est pas écrit est
  perdu.
