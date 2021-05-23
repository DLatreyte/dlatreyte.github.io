---
title: "Problème du rendu de monnaie"
subtitle: "Chapitre 14,2"
author: ""
type: ""
date: 2021-02-28T05:28:54+04:00
draft: false
toc: true
tags: []
categories: []
image: ""
solution_est_visible: true
auto_numbering: true
---

## Énoncé du problème

Un commerçant cherche à rendre la monnaie à ses clients **de façon optimale**, c'est-à-dire avec le **nombre minimal de pièces et de billets**.

Dans ce problème,
-  On suppose que les clients ne donnent que des sommes entières en euros (pas de centimes pour simplifier) ;
-  Les valeurs des pièces et billets à disposition sont : 1, 2, 5, 10, 20, 50, 100, 200 et 500. On suppose que l'on a autant d'exemplaires que nécessaire de chaque pièce et billet ;
-  Dans la suite, afin de simplifier, on désigne par « pièces » à la fois les pièces et les billets.

## Stratégie gloutonne

Un client nous achète un objet qui coûte 53 euros. Il paye avec un billet de 200 euros. Il faut donc lui rendre 147 euros, par exemple un billet de 100, deux billets de 20, un billet de 5 et une pièce de 2.

Pour minimiser le nombre de pièces à rendre, on peut suivre la stratégie suivante :

- On commence par rendre la pièce de plus grande valeur possible ;
- On déduit cette valeur de la somme (encore) à rendre ;
- On recommence, jusqu'à obtenir une somme nulle.

En procédant ainsi, **on résout le problème étape par étape** et **un choix optimal est effectué à chacune de ces étapes** (la pièce de plus grande valeur). *Cet algorithme fait parti de la catégorie des **algorithmes gloutons** : chercher la solution optimale à partir d'optima locaux.*

<!-- {{% note warning %}}
Le corrigé se trouve à cette adresse : {{< remote "https://repl.it/@dlatreyte/rendudemonnaie" "https://repl.it/@dlatreyte/rendudemonnaie" >}}
{{% /note %}} -->

1. Importer le module typing au début du fichier : 
```python
from typing import List
```

2. Préparer la fonction main suivante et étudier sa structure :
```python 
def main():
    # valeurs des pièces
    pieces = [1, 2, 5, 10, 20, 50, 100]

    prix = int(input("Quel est le prix ? "))
    client = int(input("Combien le client donne-t-il ? "))

    a_rendre = somme_a_rendre(prix, client)
    comment = pieces_a_rendre(a_rendre, pieces)

    reponse = ["{} piece(s) de {}".format(comment[i], pieces[i]) for i in range(len(pieces))]
    print("Je dois rendre : {}".format(a_rendre))
    print("Je donne donc : {}".format(reponse))
``` 

3. Définir la fonction somme_a_rendre dont la spécification est :
```python
def somme_a_rendre(prix: int, montant_client: int) -> int:
    """
    Détermine la somme à rendre à partir du prix et du montant donné par
    le client.
    """
```

4. Définir la fonction pieces_a_rendre dont la spécification est :
```python 
def pieces_a_rendre(somme: int, pieces: List[int]) -> List[int]:
    """
    Détermine les pièces (et leur nombre) à choisir pour rendre la somme
    passée en argument.
    Utilise la division euclidienne et le modulo de façon à pouvoir
    traiter tous les cas.
    """
```

5. Appeler la fonction `main`.

## Programmation dynamique

6. Rappeler quel est l'objectif de la programmation dynamique.

7. On note $S[i][j]$ le nombre optimal de pièces à rendre pour une somme à rendre $j$ et $i$ types de pièces.\
Ce nombre est vérifie la relation de récurrence :
$$
    S[i][j] = 
    \begin{cases}
    0 & \text{ si } j = 0\cr
    0 & \text{ si } i = 0\cr
    min(S[i-1][j] ; 1 + S[i][j - \text{piece}[i]]) & \text{ si } j - \text{piece}[i] \geqslant 0  \cr
    S[i-1][j] & \text{ si } \text{ si } j - \text{piece}[i] < 0 \cr
    \end{cases}
$$
    
    Justifier cette relation.

8. Représenter le tableau $S$ pour une somme à rendre de 12 euros.

9. Quelle est le nombre de pièces optimal en utilisant la programmation dynamique ?

10. Écrire le code de la fonction `sol_dynamique` dont la spécification est :
```python
def construction_S(somme: int, pieces: List[int]) -> List[List[int]]:
    """
    Construit le tableau dynamique S définit par la relation de récurrence donnée.
    """
```

11. Quelle est la complexité de cet algorithme ?

12. À partir du tableau de la question 8, indiquer comment retrouver le découpage conduisant à la solution.

13. Écrire la fonction `recherche_sol` dont la spécification est :
```python
def recherche_sol(somme: int, pieces: List[int], S: List[List[int]]) -> Tuple[int, Dict[int: int]]:
    """
    Recherche la solution et toutes les pièces à rendre pour cette solution.
    La valeur retournée a pour forme (somme, {piece: nombre})
    """
```

