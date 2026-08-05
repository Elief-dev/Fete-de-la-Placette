# La Fête de la Placette

Application d'inscription pour une fête de rue annuelle. Les participants
s'inscrivent depuis leur téléphone via un lien WhatsApp ou un QR code sur
une affiche, indiquent combien ils viennent et ce qu'ils apportent.
L'organisatrice suit les inscriptions et la répartition des plats et des
boissons.

Projet d'apprentissage : la priorité est la compréhension, pas la vitesse.

## Comment c'est fait

| | |
|---|---|
| Langage | TypeScript |
| Base de données | PostgreSQL, hébergé chez Supabase (région Paris) |
| Serveur maison | aucun — la page parle directement à Supabase |
| Hébergement de la page | GitHub Pages, gratuit, publication automatique |

Écarté volontairement : les frameworks type React/Next.js, trop de
concepts d'un coup pour un premier projet de cette taille.

## Où en est le projet

**Fait**

- Périmètre défini : 12 user stories, priorisées v1 / v2 / plus tard
- Base de données conçue, créée et vérifiée : 3 tables, 25 types de
  contribution de référence
- Règles d'accès posées et vérifiées : lecture et création publiques,
  **aucune suppression possible** depuis l'extérieur
- Projet web créé (Vite + TypeScript) et **branché sur la base**
- **Le formulaire d'inscription fonctionne** : prénom, nombre de
  personnes, et autant de contributions qu'on veut. Le type se propose
  tout seul à partir du texte saisi, et reste corrigeable
- **La liste et la synthèse s'affichent** sous le formulaire : totaux
  par catégorie, détail regroupé par type, et qui apporte quoi
- **L'application est en ligne**, publiée sur GitHub Pages et mise à
  jour automatiquement à chaque envoi de code sur `main` (voir plus bas
  « Publier une mise à jour ») :
  **https://elief-dev.github.io/Fete-de-la-Placette/**

Les cinq histoires du socle v1 (1a, 8, 2, 9, 10) sont donc couvertes.
L'application est en ligne et accessible à tous.

**Reste à faire pour la v1**

- Le QR code et l'affiche, maintenant que l'adresse est stable

**Point de vigilance en suspens** : sur le plan gratuit, un projet
Supabase inactif est mis en veille. À régler avant d'imprimer l'affiche,
sinon le QR code peut mener à une page endormie.

## Organisation des fichiers

```
CLAUDE.md              Le contexte du projet : décisions, réglages,
                       mode de collaboration. À lire en premier.
.github/
  workflows/deploy.yml Le robot qui construit et publie le site sur
                       GitHub Pages à chaque envoi sur main.
docs/
  user-stories.md      Le besoin, histoire par histoire, priorisé.
db/
  schema.sql           Structure de la base. Exécuté le 2026-08-04.
  policies.sql         Droits d'accès. Exécuté le 2026-08-04.
web/                   L'application (Vite + TypeScript)
  index.html           La page, presque vide : le contenu vient du code
  vite.config.ts       Réglage du sous-dossier d'adresse pour GitHub Pages
  src/supabase.ts      La connexion à la base
  src/main.ts          La page et le formulaire d'inscription
  src/proposition.ts   Le dictionnaire qui devine le type d'un plat
  src/liste.ts         La liste des inscrits et la synthèse
  .env.example         Modèle de configuration à recopier en .env
```

Les deux fichiers SQL sont massivement commentés en français : ils
servent autant de documentation que de code.

## Faire tourner l'application en local

```
cd web
npm install        (la première fois seulement)
npm run dev
```

Puis ouvrir l'adresse affichée, typiquement http://localhost:5173

Sur un poste Windows où la politique de sécurité PowerShell bloque les
scripts, écrire `npm.cmd run dev` au lieu de `npm run dev`.

Au préalable : copier `web/.env.example` en `web/.env` et y renseigner
l'adresse du projet Supabase et sa clé publique. Sans ce fichier, la
page affiche un message d'erreur explicite.

## Publier une mise à jour

Le site en ligne se met à jour seul, il n'y a rien à construire ni à
copier à la main :

```
git add ...
git commit -m "..."
git push
```

Le `push` déclenche automatiquement le robot GitHub Actions, qui
reconstruit le site et le republie sur GitHub Pages, en général en
moins d'une ou deux minutes. On peut suivre sa progression dans
l'onglet **Actions** du dépôt sur GitHub.

## Recréer la base de zéro

Dans l'éditeur SQL de Supabase, en tant que rôle `postgres` :

1. Exécuter `db/schema.sql` — crée les tables et les verrouille
2. Exécuter `db/policies.sql` — ouvre les accès prévus

C'est du PostgreSQL standard : ces fichiers fonctionneraient sur
n'importe quel PostgreSQL, pas seulement chez Supabase.

## Données personnelles

Le strict nécessaire est collecté : un prénom, un complément facultatif
pour distinguer les homonymes, un nombre de personnes. **Ni email, ni
numéro de téléphone** — aucun moyen de contact n'est demandé.

Le champ « complément » est libre et facultatif. Son texte d'exemple
suggère notamment un nom de famille (« Martin »), donc certains
participants en renseigneront un. Décision assumée le 2026-08-05 : sur
une fête entre voisins qui se connaissent, distinguer deux Sophie prime
sur la discrétion d'un patronyme. Chacun reste libre de mettre autre
chose, ou rien.

La liste des inscriptions est publique, c'est un choix assumé — elle
évite que quatre voisins apportent le même taboulé. Corollaire : ce qui
est saisi dans « complément » est visible par tous, y compris par un
passant qui scanne l'affiche.

Les données seront effacées après la fête.
