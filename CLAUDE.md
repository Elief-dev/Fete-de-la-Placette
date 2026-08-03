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
