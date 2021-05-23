---
title: "Arbres Binaires Recherche"
subtitle: "Chapitre 9,3"
author: ""
type: ""
date: 2020-11-10T05:04:12+04:00
draft: false
toc: true
tags: ["Arbres", "Arbres binaires", "Arbres binaires de recherche"]
categories: ["Terminales Spé NSI", "Informatique"]
image: ""
solution_est_visible: true
auto_numbering: true
---


## Introduction

Une utilisation particulière des arbres binaires est la notion d’arbre binaire de recherche. On suppose que les valeurs des nœuds sont des objets comparables entre eux : pour fixer les idées, on considère n’avoir que des entiers.

{{% note tip %}}
Un **arbre binaire de recherche**, ou **ABR**, est un arbre binaire avec la propriété suivante : pour tout nœud $x$, tous les nœuds situés dans le sous-arbre gauche de $x$ ont une valeur $\leqslant val(x)$, et tous ceux situés dans son sous-arbre droit ont une valeur $\geqslant val(x)$.
{{% /note %}}

{{% note normal %}}
Les ABR servent à maintenir un ensemble de valeurs ordonnées, avec une meilleure complexité qu’une liste chaînée par exemple. On commence par la recherche d’un élément. La structure de l’ABR permet d’éviter de le parcourir en entier.
{{% /note %}}

## Un ABR est un arbre

1. Pour représenter un ABR, on va à nouveau utiliser la classe `Noeud`. Écrire à nouveau le code de cette classe.  
Les contraintes sur les valeurs des nœuds ne sont pas codées dans la classe.

2. Écrire à nouveau les spécifications des fonctions `taille`, `hauteur` et `parcours_infixe`.

3. Vérifier que la fonction `parcours_infixe` affiche les valeurs dans l'ordre croissant.

## Recherche dans un ABR

4. Écrire le code de la fonction `appartient` dont la spécification est 
```python
def appartient(a: Noeud, x: int) -> bool:
    """
    Détermine si la valeur x apparaît dans l'arbre a.
    """
```

5. Quelle est la complexité de cette recherche ?

## Ajout d'une valeur dans un ABR

6. Envisager un ABR et, à la main, ajouter un élément.

7. Quel peut-être le code de la fonction `ajoute` dont la spécification est 
```python
def ajoute(a: Noeud, x: int) -> None:
    """
    Ajoute x à l'arbre a (en place).

    HYPOTHÈSE : a n'est pas l'arbre vide.
    """
``` 

8. Quelle est la complexité de cette fonction ?

9. Pour résoudre le problème de l'ajout d'une valeur à un arbre initialement vide et/ou pour ne pas modifier un arbre déjà constitué, il est possible de programmer la fonction `ajoute_copie` dont la spécification est 
```python
def ajoute_copie(n: Noeud, x: int) -> Noeud:
    """
    Ajoute la valeur x à l'ABR n. Un nouvel arbre est créé.
    """
```
Écrire le code de cette fonction.

## Utiliser un arbre binaire de recherche

10. Créer la fonction qui `plus_petit_element` dont la spécification est 
```python
def plus_petit_element(a: Noeud) -> int:
    """
    Retourne le plus petit élément de l'arbre binaire de recherche a.

    Lève une exception si l'arbre est vide.
    """
```

11. Créer la fonction qui `plus_grand_element` dont la spécification est 
```python
def plus_grand_element(a: Noeud) -> int:
    """
    Retourne le plus grand élément de l'arbre binaire de recherche a.

    Lève une exception si l'arbre est vide.
    """
```

12. Créer la fonction qui `est_abr` dont la spécification est 
```python
def est_abr(a: Noeud) -> bool:
    """
    Détermine si l'arbre a est un arbre binaire de recherche.
    """
```


### Corrigé

{{< remote "Corrigé de l'activité" "https://repl.it/@dlatreyte/Arbre-binaire-de-recherche" >}}


## À retenir

{{% note tip %}}
Un **arbre binaire de recherche** est un arbre binaire contenant des **valeurs ordonnées**, tel que tout nœud contient une valeur plus grande (respectivement plus grande ou égale) que les valeurs de tous les nœuds situés dans son sous-arbre gauche. Cette organisation permet de procéder par **dichotomie**, en n'ayant à considérer qu'un seul sous-arbre pendant une opération.   
Lorsqu'ils sont **équilibrés**, les arbres binaires de recherche constituent une méthode très efficace pour stocker et rechercher de l'information.
{{% /note %}}