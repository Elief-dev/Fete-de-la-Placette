# User stories — La Fête de la Placette

## À quoi sert ce fichier

Une *user story* décrit ce que quelqu'un veut faire et **pourquoi**, sans
dire comment le construire. Format :

> **En tant que** [qui] **je veux** [quoi] **afin de** [pourquoi].

Le « afin de » est le morceau important : c'est lui qui permet, plus tard,
de décider si une fonctionnalité mérite d'exister.

Ce fichier est la référence du projet. Il dit ce qu'on construit, dans
quel ordre, et ce qu'on a délibérément écarté.

Rédigé le 2026-08-03.

## Les rôles

- le voisin qui s'inscrit
- le voisin déjà inscrit qui veut changer quelque chose
- le voisin qui consulte avant de choisir quoi apporter
- le voisin sans smartphone, ou qui ne veut pas cliquer
- l'organisatrice, qui suit les inscriptions et peut saisir pour autrui

## Décisions produit prises en écrivant ces histoires

- **La liste des inscriptions est publique.** Un voisin peut voir qui vient
  et ce que chacun apporte, pour éviter les doublons.
- **Conséquence : pas de moyen de contact.** Ni email, ni numéro de
  téléphone. Le lien sera affiché dans la rue, donc lisible par
  n'importe quel passant.
- **Le complément est libre, et peut contenir un nom de famille.**
  Révision du 2026-08-05 : le texte d'exemple du champ suggère
  « Martin », donc certains en renseigneront un, et il sera public.
  Assumé — distinguer deux Sophie prime ici sur la discrétion du
  patronyme. Le champ reste facultatif.
- **Pas d'authentification par numéro de téléphone.** Un numéro qu'on tape
  soi-même identifie sans prouver quoi que ce soit : n'importe qui pourrait
  modifier l'inscription d'un voisin. Un vrai code par SMS serait payant et
  disproportionné pour un apéro de rue.
- **Piste retenue pour revenir modifier son inscription : le lien secret.**
  À la validation, l'app génère une adresse unique impossible à deviner que
  le voisin conserve. En cas de perte, l'organisatrice corrige (histoire 5).
- **La catégorie du plat est proposée, pas imposée ni devinée en silence.**
  Voir histoire 8.

---

## v1 — le socle

La première version qui fonctionne de bout en bout. Tout le reste attend.

### 1a — S'inscrire

> En tant que **voisin qui découvre l'affiche dans la rue**, je veux
> **m'inscrire immédiatement depuis mon téléphone sans créer de compte**,
> afin de **ne pas remettre à plus tard et oublier**.

Critères d'acceptation :

- Le formulaire est lisible et remplissable sur un écran de téléphone
- Aucun mot de passe ni email obligatoire n'est demandé
- Après validation, un message confirme que l'inscription est enregistrée

### 8 — Décrire ce qu'on apporte sans se prendre la tête

> En tant que **voisin qui remplit le formulaire**, je veux **décrire ce que
> j'apporte en langage naturel**, afin de **ne pas avoir à réfléchir à des
> catégories qui ne sont pas mon problème**.

Solution retenue : l'app **propose** une catégorie (salé / sucré / boisson
sans alcool / boisson avec alcool) à partir du texte saisi, déjà
sélectionnée, et le voisin peut la corriger d'un geste.

Pourquoi pas une détection 100 % automatique : par mots-clés elle se trompe
en silence (« cake » peut être salé ou sucré) et corrompt la synthèse ; par
intelligence artificielle elle exigerait un serveur maison, écarté du
projet. La proposition corrigeable rend l'erreur visible et gratuite.

### 2 — Suivre les inscriptions

> En tant qu'**organisatrice**, je veux **voir d'un coup d'œil combien de
> personnes viennent et comment se répartissent les plats et les boissons**,
> afin de **repérer les manques et solliciter les voisins encore indécis**.

Critère d'acceptation : la synthèse est consultable à tout moment, sans
manipulation particulière.

### 9 — Consulter avant de choisir

> En tant que **voisin**, je veux **consulter la liste des participants et la
> synthèse de ce que les autres ont prévu d'amener**, afin de **ne pas
> démultiplier les mêmes mets**.

Conséquence : la page de synthèse de l'histoire 2 est publique.

### 10 — Savoir ce qui sera visible

> En tant que **voisin qui hésite à remplir**, je veux **savoir clairement ce
> qui sera visible par les autres avant de valider**, afin de **décider en
> connaissance de cause**.

---

## v2 — le confort

À ajouter avant la fête si le temps le permet. En attendant, ces besoins
sont couverts par un message à l'organisatrice, qui corrige à la main.

### 1b — Repartir avec un moyen de revenir

> En tant que **voisin qui vient de s'inscrire**, je veux **repartir avec un
> moyen simple de retrouver mon inscription plus tard**, afin de **pouvoir la
> corriger si mes plans changent, sans déranger l'organisatrice**.

### 4 — Modifier ou annuler

> En tant que **voisin déjà inscrit**, je veux **annuler simplement ou
> modifier mon inscription** (nombre de personnes de mon foyer, contenu de ce
> que j'apporte), afin de **tenir compte de l'évolution de ma situation et
> d'en informer l'organisatrice**.

Dépend de 1b.

### 5 — Saisir pour le compte d'un tiers

> En tant qu'**organisatrice**, je veux **saisir une inscription pour le compte
> d'un tiers, y compris ce qu'il apporte**, afin de **n'exclure personne, qu'il
> s'agisse d'un voisin sans smartphone ou de quelqu'un qui a perdu son lien**.

### 3 — Participer sans smartphone

> En tant que **voisine âgée sans smartphone**, je veux **pouvoir participer en
> donnant ma réponse de vive voix à l'organisatrice**, afin de **ne pas être
> exclue de la fête de ma propre rue**.

Cette histoire n'appelle pas de développement : elle est satisfaite par
l'histoire 5. À conserver pour se souvenir de qui on travaille.

### 7 — La liste du jour J

> En tant qu'**organisatrice le jour de la fête, dans la rue**, je veux **une
> liste nominative de qui vient et de ce que chacun apporte, consultable
> facilement sur mon téléphone ou imprimable**, afin de **pointer les arrivées
> et repérer ce qui manque sans dépendre du réseau**.

Distincte de l'histoire 2 : la 2 donne des chiffres agrégés pour décider,
la 7 donne une liste nominative pour pointer.

Le fonctionnement **sans réseau** est un travail à part entière : reporté
au-delà de v2. L'impression, elle, est quasi gratuite.

### 11 — Effacer après la fête

> En tant qu'**organisatrice, après la fête**, je veux **effacer toutes les
> inscriptions**, afin de **ne pas conserver les données de mes voisins sans
> raison**.

Peut se faire à la main dans l'interface de la base de données. Reste une
histoire à part entière pour ne pas l'oublier.

---

## Plus tard

### 12 — Repartir l'année suivante

> En tant qu'**organisatrice, l'année suivante**, je veux **repartir d'une app
> vide sans tout reconstruire**, afin de **réutiliser mon travail d'une année
> sur l'autre**.

Rien à construire maintenant, mais à garder en tête au moment de concevoir
la base : la fête est annuelle.

---

## Hors périmètre

### 6 — Relancer les voisins qui n'ont pas répondu

> En tant qu'**organisatrice, avant le jour J**, je veux **relancer les
> personnes qui n'ont pas encore répondu**, afin de **maximiser le nombre de
> participants**.

La relance se fera dans WhatsApp, hors de l'application.

Conservée parce qu'elle révèle un besoin caché : pour savoir *qui* n'a pas
répondu, il faudrait que l'app connaisse la liste des foyers de la
placette. Décision : **ne pas construire ça**. Maintenir une liste de foyers
dans l'app serait beaucoup de travail pour remplacer la mémoire de
l'organisatrice, qui connaît sa rue.
