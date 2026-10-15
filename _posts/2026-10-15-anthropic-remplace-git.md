---
layout: post
title: "Anthropic remplace Git"
---

Anthropic a publié un papier expliquant pourquoi ils ont dû abandonner Git. Dans ce
papier, publié le 13 octobre, ils décrivent leur longue migration vers leur propre
outil de versioning, « Scion » (scn).

Difficile de comprendre la raison pour laquelle on arrêterait d'utiliser le standard
de l'industrie pour développer son propre outil.

En mai, Anthropic fusionnait environ 2 500 changements par jour dans un mono-repo.
Quatre mois plus tard, c'est 30 000. Le 9 septembre, plus de 30 000 en une seule
journée. Ces chiffres donnent le tournis, et ils sont le fruit de code produit par des
agents.

Les ingénieurs d'Anthropic affirment que les agents codent désormais mieux qu'eux.
Leur travail ne consiste plus à produire du code, mais à savoir dire « non » aux
agents, à poser les compromis de conception et à comprendre la partie inter-systèmes.

Cette immense quantité de code a fait du contrôle de version et de la CI le goulot
d'étranglement :

- 25 millions de checkouts par jour pour la CI, soit plus de 600 Po de trafic Git
  quotidiens s'ils étaient servis naïvement ;
- des checkouts qui se comptent en minutes, et des centaines de miroirs internes de
  plus en plus difficiles à opérer.

Et une des raisons les plus flagrantes, c'est un changement de public. Les agents sont
en ligne 24 h/24 : ils n'ont pas besoin d'un clone. Là où Git était excellent pour le
travail distribué et hors-ligne, pour un agent, la question ne se pose plus.

Un outil conçu par un humain ne s'adapte pas à des méthodes de travail de machines.
(Bien que notre cher Torvalds en soit une.)

Anthropic a donc créé Scion en partant du besoin always-online :

- serveur toujours en ligne ;
- les données ne sont pas stockées sur le client, mais sur le serveur ;
- commits, merges et rebases se font côté serveur ; le client, lui, ne garde que du
  cache ;
- il n'existe jamais de copie complète du dépôt, et les commits sont incrémentaux.

Scion affiche des résultats bien plus sobres que Git : 200 fois moins de CPU et de
mémoire que leur ancienne infrastructure de miroirs Git.

## Mais concrètement, ça fait quoi ?

Dans Git, la donnée vient vers nous : on télécharge le dépôt, on construit notre
commit, puis on le pousse. Dans Scion, elle reste sur le serveur, et on ne paie que ce
qu'on lit. Un exemple : corriger un bug d'une ligne.

- Récupérer le code :
    - Git renvoie un packfile de plusieurs centaines de Mo à plusieurs Go, ou exige des
      miroirs internes et des snapshots.
    - Scion récupère les arbres manquants puis les blobs, objet par objet, chacun
      immuable, donc n'importe quel cache peut répondre. Le checkout est sparse par
      défaut, et parfois virtualisé : les fichiers arrivent sur le disque quand on les
      ouvre.
- Commit :
    - dans Git, on le construit localement (arbre, parents, message).
    - dans Scion, c'est le serveur qui crée le changeset.
- Push :
    - dans Git, c'est l'envoi du packfile. Dans Scion, il n'y a rien à pousser.
    - il ne reste qu'à déplacer main, un compare-and-swap sur une seule ligne, découplé
      de la création des commits.
- CI :
    - sous Git, chaque job clone de quoi obtenir l'arbre, d'où les 600 Po/jour.
    - sous Scion, il demande juste au serveur le diff entre le changeset et sa base de
      merge. Zéro checkout.

Par contre : plus de travail hors-ligne, et un poste qui dépend du serveur pour un
simple blame ou un rebase.

Le papier d'Anthropic :
<https://www.anthropic.com/engineering/redesigning-source-control>
