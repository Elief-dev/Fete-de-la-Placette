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

**Reste à faire pour la v1**

- Organiser le projet web et le brancher sur Supabase
- La page d'inscription (formulaire)
- La page liste et synthèse
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
```

Les deux fichiers SQL sont massivement commentés en français : ils
servent autant de documentation que de code.

## Recréer la base de zéro

Dans l'éditeur SQL de Supabase, en tant que rôle `postgres` :

1. Exécuter `db/schema.sql` — crée les tables et les verrouille
2. Exécuter `db/policies.sql` — ouvre les accès prévus

C'est du PostgreSQL standard : ces fichiers fonctionneraient sur
n'importe quel PostgreSQL, pas seulement chez Supabase.

## Données personnelles

Le strict nécessaire est collecté : un prénom, un complément facultatif
pour distinguer les homonymes, un nombre de personnes. Ni nom de famille,
ni email, ni numéro de téléphone.

La liste des inscriptions est publique, c'est un choix assumé — elle
évite que quatre voisins apportent le même taboulé.

Les données seront effacées après la fête.
