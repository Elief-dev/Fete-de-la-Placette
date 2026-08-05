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
| Hébergement de la page | à décider |

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

Les cinq histoires du socle v1 (1a, 8, 2, 9, 10) sont donc couvertes.
L'application tourne en local.

**Reste à faire pour la v1**

- La mise en ligne, puis le QR code et l'affiche

**Point de vigilance en suspens** : sur le plan gratuit, un projet
Supabase inactif est mis en veille. À régler avant d'imprimer l'affiche,
sinon le QR code peut mener à une page endormie.

## Organisation des fichiers

```
CLAUDE.md              Le contexte du projet : décisions, réglages,
                       mode de collaboration. À lire en premier.
docs/
  user-stories.md      Le besoin, histoire par histoire, priorisé.
db/
  schema.sql           Structure de la base. Exécuté le 2026-08-04.
  policies.sql         Droits d'accès. Exécuté le 2026-08-04.
web/                   L'application (Vite + TypeScript)
  index.html           La page, presque vide : le contenu vient du code
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

Au préalable : copier `web/.env.example` en `web/.env` et y renseigner
l'adresse du projet Supabase et sa clé publique. Sans ce fichier, la
page affiche un message d'erreur explicite.

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
