# Ce que j'ai appris en construisant ce projet

Journal d'apprentissage, pas de documentation technique — celle-ci vit
dans `CLAUDE.md`, `README.md` et les fichiers commentés. Ici, ce sont les
notions qui ont demandé un temps d'arrêt pour être comprises, dans
l'ordre où elles sont apparues.

Rédigé le 2026-08-05, à la fin de la première version (v1) de l'app.

## Git et GitHub : deux choses différentes

- Mon dépôt local (sur mon PC) et GitHub sont deux copies du même
  historique. Rien ne se synchronise seul : `git push` envoie mes
  commits vers GitHub ; dans l'autre sens, ce serait `git pull`.
- `git commit` ≠ `git push`. Le commit enregistre une « photo » du code
  **en local seulement**. Rien n'est visible par personne jusqu'au push.
- GitHub, à la base, n'est qu'un endroit qui stocke du code — pas un
  site web. Il a fallu activer « GitHub Pages » explicitement pour qu'il
  en serve un.
- Un message de commit n'est pas du code : c'est une étiquette pour les
  humains, sans effet sur le fonctionnement. Mais des messages clairs
  rendent l'historique utile des mois plus tard — même logique que
  tenir le README à jour.
- Le panneau Source Control de VS Code fait la même chose que les
  commandes `git add` / `commit` / `push` — juste avec des clics au lieu
  de texte à taper.

## Une base de données, ça se construit avec des garde-fous

- **Deux tables reliées** plutôt qu'une seule avec des colonnes
  « plat1, plat2, plat3 » : une inscription peut avoir zéro, une ou
  plusieurs contributions. C'est le sens du mot « relationnel ».
- La **clé étrangère** (`inscription_id` qui pointe vers
  `inscriptions.id`) fait respecter la cohérence par la base
  elle-même : impossible de créer une contribution rattachée à une
  inscription qui n'existe pas.
- Le **`cascade`** : supprimer une inscription supprime ses
  contributions avec elle, automatiquement.
- Les contraintes **`check`** (quantité positive, catégorie parmi
  4 valeurs) sont un filet de sécurité indépendant du code de la page :
  même un bug du formulaire ne peut pas les contourner.
- Une **jointure** (`join`) ne fusionne rien sur le disque : elle
  rapproche temporairement deux tables pour une question donnée. C'est
  elle qui permet de retrouver la catégorie d'une contribution sans la
  stocker deux fois.
- **On ne stocke pas ce qu'on peut déduire.** Pas de colonne
  « catégorie » sur les contributions (déductible du type), pas de table
  « synthèse » (les totaux se calculent à la demande).
- Un `uuid` plutôt qu'un simple numéro 1, 2, 3 : un identifiant qui se
  suit est devinable, ce qui compte dès qu'une page publique y donne
  accès.

## Sécurité et vie privée, appliquées concrètement

- Une clé « publique » n'est pas forcément dangereuse : la clé anon /
  publishable de Supabase est **conçue pour être visible** dans le code
  d'une page web. Ce qui protège les données, ce sont les **règles
  d'accès (RLS)** — pas la confidentialité de la clé. À l'inverse, la
  clé `service_role` ne doit jamais apparaître nulle part dans le code.
- Il y a deux verrous indépendants à ouvrir pour qu'une table soit
  utilisable depuis une page web : les **droits (`GRANT`)** et les
  **règles (`POLICY`)**. Les deux sont nécessaires, l'un sans l'autre ne
  suffit pas.
- **Tout texte saisi par un visiteur doit être neutralisé avant
  d'être affiché** (fonction `echapper()`). Sans ça, quelqu'un pourrait
  écrire du code dans le formulaire et le faire exécuter chez tous les
  visiteurs suivants. Vérifié en tentant d'injecter une balise
  `<script>` — refusée, affichée comme texte brut.
- Avant de rendre le dépôt public (obligatoire pour GitHub Pages
  gratuit), vérifier qu'aucun secret n'est réellement versionné : le
  fichier `.env` était ignoré par Git depuis le début.
- Les secrets **GitHub Actions** jouent le même rôle que le fichier
  `.env` local : garder une configuration hors du code source, dans un
  autre endroit — utile pendant la construction automatique, puisque le
  robot n'a pas accès à mon `.env`.
- L'identité Git (nom + email) devient publique dès que le dépôt l'est
  — bon réflexe à vérifier avant de rendre un dépôt public.

## Le code que j'écris n'est pas ce que le visiteur reçoit

- Le TypeScript doit être **traduit** (« construit », *build*) en
  HTML/CSS/JS brut avant qu'un navigateur puisse l'exécuter — c'est ce
  que fait `npm run build`.
- **npm** est le gestionnaire de paquets de Node : un entrepôt de code
  réutilisable, plus l'outil pour aller y piocher. `package.json` est la
  liste de courses, `node_modules/` les courses livrées (jamais
  versionné — reconstituable par `npm install`).
- **Vite** traduit le TypeScript à la volée pendant le développement, et
  recharge la page automatiquement à chaque enregistrement. C'est un
  outil d'atelier : il ne part jamais en ligne, seul le résultat construit
  (`dist/`) est publié.
- **GitHub Actions**, c'est un robot : un fichier de configuration qui
  dit « à chaque push, fais ceci automatiquement » — ici, construire le
  site et le publier. Ça évite d'oublier de republier après un
  changement.
- Deux contenus n'ont pas forcément besoin du même traitement :
  l'affiche n'a pas besoin de Vite (pas de TypeScript à traduire),
  contrairement à l'application. On a quand même réuni leur publication
  dans le même robot, plutôt que deux mécanismes séparés.
- **Piège classique de GitHub Pages** : le site est servi dans un
  sous-dossier de `github.io` (nommé d'après le dépôt), pas à la racine.
  Sans le préciser à Vite (`base` dans `vite.config.ts`), les fichiers
  CSS/JS cherchent au mauvais endroit et la page reste blanche.

## Écrire une page qui parle à une base de données

- L'écriture d'une inscription se fait **en deux temps** : d'abord
  l'inscription (dont on récupère l'identifiant fabriqué par la base),
  puis les contributions qui s'y rattachent. L'ordre inverse est
  impossible — la clé étrangère le refuserait.
- Une **proposition automatique** (deviner un type à partir d'un texte)
  doit rester **corrigeable**, jamais imposée : une erreur visible et
  facile à corriger vaut mieux qu'une détection silencieuse qui
  fausserait la synthèse.
- Une ligne remplie mais incomplète (texte tapé, aucun type choisi) doit
  être **signalée**, jamais ignorée en silence à l'enregistrement.

## Réflexes pratiques

- Un terminal occupé par `npm run dev` ne peut recevoir aucune autre
  commande : il en faut un second pour Git.
- Sur un poste où la politique de sécurité PowerShell bloque les
  scripts, écrire `npm.cmd run dev` plutôt que `npm run dev` — sans
  jamais toucher à `Set-ExecutionPolicy`, qui est un réglage de
  sécurité de l'entreprise.
- Après chaque `push`, regarder le commit sur GitHub (les lignes
  ajoutées en vert, supprimées en rouge) : voir le changement rend
  concret ce qu'on vient de faire.
