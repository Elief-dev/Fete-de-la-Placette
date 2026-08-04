-- =====================================================================
--  La Fête de la Placette — règles d'accès
-- =====================================================================
--
--  À QUOI SERT CE FICHIER
--  schema.sql a créé les tables et les a verrouillées. Celui-ci décide
--  précisément qui a le droit de faire quoi. C'est le fichier le plus
--  sensible du projet : une erreur ici et n'importe quel passant peut
--  effacer les inscriptions de tes voisins.
--
--  À exécuter APRÈS schema.sql, dans le SQL Editor de Supabase.
--
--  LE PRINCIPE À COMPRENDRE
--  Ta page web contiendra une clé publique Supabase, lisible par
--  quiconque affiche le code source de la page. C'est prévu ainsi.
--  Ce qui protège tes données, ce n'est PAS cette clé — ce sont les
--  règles écrites ici.
--
--  QUI EST « anon » ?
--  C'est le nom du visiteur non identifié : n'importe qui arrivant sur
--  ta page sans s'être connecté. Autrement dit, tous tes voisins.
--
--  ET TOI ?
--  Ces règles ne s'appliquent pas à toi quand tu passes par le tableau
--  de bord Supabase. Tu y gardes tous les droits. C'est ainsi que sont
--  couvertes, en v1, les histoires 5 (saisir pour un tiers), 4 (corriger
--  pour un voisin) et 11 (effacer après la fête).
--
--  CE QU'ON AUTORISE
--
--    Table                  Lire   Créer   Modifier   Supprimer
--    types_contribution      oui     non      non         non
--    inscriptions            oui     oui      non         non
--    contributions           oui     oui      non         non
--
--  Le refus de modification et de suppression est le verrou essentiel :
--  même avec la clé publique, personne ne peut détruire une inscription.
--
--  Version du 2026-08-04.
-- =====================================================================


-- ---------------------------------------------------------------------
--  VERROU 1 sur 2 : LES DROITS D'ACCÈS (GRANT)
-- ---------------------------------------------------------------------
--
--  Premier niveau : « cette table est-elle seulement visible depuis
--  l'extérieur ? »
--
--  Ce verrou existe parce que tu as décoché « Automatically expose new
--  tables » à la création du projet. Sans ces lignes, tes tables
--  resteraient invisibles pour l'API, quelles que soient les règles
--  écrites plus bas.
--
--  Remarque le détail des droits accordés : « select » seul sur les
--  types, « select, insert » sur les deux autres. Ni « update » ni
--  « delete » n'apparaissent nulle part. Ce qui n'est pas accordé est
--  refusé — on n'a pas besoin d'interdire explicitement.

-- Le droit d'utiliser le schéma qui contient nos tables.
-- Probablement déjà en place par défaut chez Supabase, mais l'écrire ne
-- coûte rien et rend le fichier autonome.
grant usage on schema public to anon;

-- La liste de référence : lecture seule. Elle alimente la liste
-- déroulante du formulaire. Personne ne doit pouvoir y ajouter un type.
grant select on types_contribution to anon;

-- Les inscriptions : on peut les lire (liste publique) et en créer
-- (s'inscrire). Pas les modifier, pas les supprimer.
grant select, insert on inscriptions to anon;

-- Les contributions : même logique.
grant select, insert on contributions to anon;


-- ---------------------------------------------------------------------
--  VERROU 2 sur 2 : LES RÈGLES (POLICY)
-- ---------------------------------------------------------------------
--
--  Second niveau, plus fin : « une fois la table visible, quelles LIGNES
--  puis-je voir, et quelles lignes ai-je le droit d'écrire ? »
--
--  Rappel : schema.sql a activé « row level security » sur les trois
--  tables. Tant qu'aucune règle n'existe, ce verrou refuse tout. Les
--  lignes ci-dessous ouvrent, une par une, ce qu'on veut ouvrir.
--
--  DEUX MOTS-CLÉS À NE PAS CONFONDRE
--
--    using      → « quelles lignes existantes ai-je le droit de voir ? »
--                 s'utilise pour la lecture
--
--    with check → « quelles lignes ai-je le droit d'écrire ? »
--                 s'utilise pour la création
--
--  Dans les deux cas, « true » signifie « aucune restriction ». En v2,
--  le lien secret remplacera ces « true » par une vraie condition du
--  type « seulement si tu présentes le bon jeton ».


-- --- types_contribution : lecture seule -------------------------------

create policy "lecture publique des types"
  on types_contribution
  for select
  to anon
  using (true);


-- --- inscriptions -----------------------------------------------------

create policy "lecture publique des inscriptions"
  on inscriptions
  for select
  to anon
  using (true);

create policy "creation publique d une inscription"
  on inscriptions
  for insert
  to anon
  with check (true);


-- --- contributions ----------------------------------------------------

create policy "lecture publique des contributions"
  on contributions
  for select
  to anon
  using (true);

create policy "creation publique d une contribution"
  on contributions
  for insert
  to anon
  with check (true);


-- ---------------------------------------------------------------------
--  CE QU'ON N'ÉCRIT PAS, ET POURQUOI
-- ---------------------------------------------------------------------
--
--  Aucune règle de modification (update) ni de suppression (delete)
--  n'existe dans ce fichier. Ce n'est pas un oubli.
--
--  En v1, un voisin qui veut changer quelque chose te le demande, et tu
--  corriges depuis le tableau de bord. C'est la contrepartie assumée
--  d'une v1 rapide à construire.
--
--  En v2, on AJOUTERA des règles ici — sans rien retirer de ce qui
--  précède. Les règles se cumulent, elles ne se remplacent pas.
--
--
--  TROIS RISQUES ASSUMÉS
--
--  1. N'importe qui peut créer des inscriptions. Un plaisantin pourrait
--     en ajouter cinquante. Tu les supprimes dans le tableau de bord.
--     Pas de parade simple sans obliger les voisins à créer un compte.
--
--  2. On peut rattacher un plat à l'inscription de quelqu'un d'autre.
--     Sans gravité : ni destruction, ni fuite de données.
--
--  3. Les voisins ne peuvent rien modifier eux-mêmes. Voulu en v1.


-- =====================================================================
--  VÉRIFIER QUE ÇA MARCHE
-- =====================================================================
--
--  ATTENTION : dans le SQL Editor, tu travailles normalement en tant que
--  « postgres », un rôle qui IGNORE toutes ces règles. Tes essais
--  réussiraient donc toujours, ce qui ne prouverait rien.
--
--  Pour tester vraiment, utilise le menu déroulant « Role » en haut de
--  l'éditeur et bascule de « postgres » à « anon ». Tu te fais alors
--  passer pour un visiteur ordinaire.
--
--  ==> AVEC Role = anon, ces deux-là doivent RÉUSSIR :
--
--      select * from types_contribution;
--
--      insert into inscriptions (prenom, nb_personnes)
--      values ('Test-Anon', 2);
--
--  ==> ET CES DEUX-LÀ DOIVENT ÉCHOUER :
--
--      update inscriptions set prenom = 'Pirate'
--      where prenom = 'Test-Anon';
--
--      delete from inscriptions where prenom = 'Test-Anon';
--
--  Un refus attendu ici, c'est la preuve que tes voisins sont protégés.
--
--  ==> ENFIN, REPASSE Role = postgres et fais le ménage :
--
--      delete from inscriptions where prenom = 'Test-Anon';
--
--  Cette dernière suppression doit réussir : c'est la démonstration que
--  toi, depuis le tableau de bord, tu gardes bien tous les droits.
-- =====================================================================
