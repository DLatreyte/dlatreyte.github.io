---
title: "Exercices"
subtitle: "Chapitre 6,2"
author: ""
type: ""
date: 2020-10-13T05:08:27+04:00
draft: false
toc: true
tags: ["Dictionnaire", "Liste"]
categories: ["Terminales Spé NSI", "Informatique"]
image: ""
solution_est_visible: true
auto_numbering: true
---


## Itérer sur les éléments d'un dictionnaire

Au zoo de Beauval, il y a 5 éléphants d'Asie, 17 écureuils d'Asie, 2 pandas d'Asie, etc.    
On représente cet inventaire à l'aide d'un dictionnaire, de façon suivante :
```python
zoo_Beauval={
    'éléphant': ('Asie', 5),
    'écureuil': ('Asie', 17),
    'panda': ('Asie', 2),
    'hippopotame': ('Afrique', 7),
    'girafe': ('Afrique', 4)
    }
``` 
On représente de la même façon le zoo de La Flèche :
```python
zoo_LaFleche = {
    'ours': ('Europe', 4),
    'tigre': ('Asie', 7),
    'girafe': ('Afrique', 11),
    'hippopotame': ('Afrique', 3)
    }
```
On souhaite se doter d'une fonction `plus_grand_nombre()` qui prend un zoo en paramètre et qui renvoie le nom de l'animal le plus représenté dans ce zoo.  
Par exemple
```python
assert plus_grand_nombre(zoo_LaFleche) == 'girafe'
assert plus_grand_nombre(zoo_Beauval) == 'écureuil'
``` 

1. Quel type de boucle peut-on envisager pour le code de cette fonction ?
    - `for cle in dico.keys()` 
    - `for valeur in dico.values()`
    - `for (cle, valeur) in dico.items()` 
    - Aucune boucle.

2. Écrire le corps de cette fonction.

On souhaite se doter d'une fonction `nombre_total` qui prend un zoo en paramètre ainsi que le nom d'un continent, et qui renvoie le nombre d'animaux originaires de ce continent dans le zoo.    
Par exemple :
```python 
assert nombre_total(zoo_LaFleche, 'Afrique') == 14
assert nombre_total(zoo_Beauval, 'Asie') == 24
``` 
3. Quel type de boucle peut-on envisager pour le code de cette fonction ? 
    - `for cle in dico.keys()`
    - `for valeur in dico.values()`
    - `for (cle,valeur) in dico.items()`
    - Aucune boucle.

4. Écrire le code de cette fonction.

On souhaite se doter d’une fonction nombre qui prend un zoo en paramètre ainsi que le nom d’un animal, et qui renvoie le nombre de représentants de cet animal dans le zoo.   
Par exemple :
```python
assert nombre(zoo_LaFleche, 'panda') == 0
assert nombre(zoo_Beauval, 'panda') == 2
```

5. Quel type de boucle peut-on envisager pour le code de cette fonction ? 
    - `for cle in dico.keys()` 
    - `for valeur in dico.values()` 
    - `for (cle,valeur) in dico.items()`
    - Aucune boucle.

6. Écrire le code de cette fonction.

{{% solution "Solution" %}}
```python
from typing import List, Dict, Tuple


def plus_grand_nombre(dic: Dict[str, Tuple[str, int]]) -> str:
    """
    Prend un zoo en paramètre et qui renvoie le nom de l’animal le plus représenté dans ce zoo.
    """
    v_max = 0
    for cle in dic.keys():
        if dic[cle][1] > v_max:
            v_max = dic[cle][1]
            cle_max = cle
    return cle_max


def nombre_total(dic: Dict[str, Tuple[str, int]], continent: str) -> int:
    """
    Prend un zoo en paramètre ainsi que le nom d’un continent, et  renvoie le nombre d’animaux originaires de ce continent dans le zoo. 
    """
    nbre = 0
    for cle in dic.keys():
        animal = dic[cle]  # tuple(continent, nombre)
        if animal[0] == continent:  # continent
            nbre_animaux_dans_continent = dic[cle][1]
            nbre = nbre + nbre_animaux_dans_continent
    return nbre


def nombre(dic: Dict[str, Tuple[str, int]], animal: str) -> int:
    """
    Prend un zoo en paramètre ainsi que le nom d’un animal, et renvoie le nombre de représentants de cet animal dans le zoo.
    """
    if animal in dic.keys():
        nbre = dic[animal][1]
    else:
        nbre = 0
    return nbre


if __name__ == "__main__":
    zoo_Beauval = {
        'éléphant': ('Asie', 5),
        'écureuil': ('Asie', 17),
        'panda': ('Asie', 2),
        'hippopotame': ('Afrique', 7),
        'girafe': ('Afrique', 4)
    }

    zoo_LaFleche = {
        'ours': ('Europe', 4),
        'tigre': ('Asie', 7),
        'girafe': ('Afrique', 11),
        'hippopotame': ('Afrique', 3)
    }

    assert plus_grand_nombre(zoo_LaFleche) == 'girafe'
    assert plus_grand_nombre(zoo_Beauval) == 'écureuil'

    assert nombre_total(zoo_LaFleche, 'Afrique') == 14
    assert nombre_total(zoo_Beauval, 'Asie') == 24

    assert nombre(zoo_LaFleche, 'panda') == 0
    assert nombre(zoo_Beauval, 'panda') == 2
```
{{% /solution %}}