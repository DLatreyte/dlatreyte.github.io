---
title: "Modéliser les notes des élèves"
subtitle: "Chapitre 6,3"
author: ""
type: ""
date: 2020-10-13T05:06:51+04:00
draft: false
toc: true
tags: ["Dictionnaire", "Liste"]
categories: ["Terminales Spé NSI", "Informatique"]
image: ""
solution_est_visible: true
auto_numbering: true
---

## Partie 1 : Modélisation simpliste

On modélise les notes d'une élève de la faon suivante :
```python
notes_de_lea = [12, 14, 3, 16, 17, 2, 13, 19]
``` 
1. Quel est le type de `notes_de_lea` ?
    - un `int`
    - une liste
    - un tuple
    - un dictionnaire
    - autre chose
2. Que vaut l'expression `notes_de_lea[2]` ?
    - 3
    - 14
    - 6
    - 5
    - autre chose
3. Quelle instruction permet d'ajouter une note de 15 à cette structure de données ?
    - `notes_de_lea.append(15)` 
    - `notes_de_lea[8] = 15` 
    - `notes_de_lea.append([15])` 
    - `notes_de_lea = notes_de_lea + 15` 
4. On propose le code suivant :
{{< highlight py3 "linenos=table" >}}
def fonction(liste_de_notes):
    """
    'liste_de_notes' est une liste de nombres qui modélise
    les notes d’un élève.
    Cette fonction renvoie ???
    """
    compteur1 = 0
    compteur2 = 0
    for note in liste_de_notes:
        if note >= 10:
            compteur1 = compteur1 + 1
        else:
            compteur2 = compteur2 + 1
    return (compteur1, compteur2)
    
notes_de_lea = [12, 14, 3, 16, 17, 2, 13, 19]
assert fonction(notes_de_lea) == ???
{{< / highlight >}}
    - Quel est le type de retour de cette fonction ?
    - Recopier et compléter la ligne 17 de ce code.
    - Recopier et compléter la ligne 5 de ce code. On demande ici d'expliquer en quelques mots ce que fait cette fonction.

## Partie 2 : Modélisation avec une structure de données imbriquées

La modélisation précédente n'est pas satisfaisante si l'on veut conserver les notes de plusieurs élèves dans une même structure de données.    
On propose, dans cette partie, de modéliser les notes des élèves de la façon suivante :
```python
notes_de_la_classe = [('Enzo', 3), ('Emma', 16), ('Lucas', 14), ('Manon', 13)]
``` 

1. Quel est le type de `notes_de_la_classe` ?
    - un `int` 
    - une liste
    - un tuple
    - un dictionnaire
    - autre chose
2. Que vaut l'expression `notes_de_la_classe[2]` ?
    - `14`
    - `'Lucas'`
    - `('Lucas', 14)` 
    - `'Emma'` 
    - `16` 
    - autre chose
3. Quelle instruction permet d'ajouter à cette structure de données une note de 15 obtenue par Farid ?
4. On veut écrire une fonction `nom_du_genie` qui prend une telle structure de données en paramètre et qui renvoie le nom de l'élève qui a eu la meilleure note.
    - Proposer un test pour cette fonction.
    - On donne le code mélangé de cette fonction. À vous de le remettre dans l'ordre !
```python
        note_max = note
    note_max = None
def nom_du_genie(les_notes):
    return genie
        genie = nom
    genie = None
        if note_max == None or note > note_max:
    for (nom, note) in les_notes:
``` 
    - Que vaut l'expression `nom_du_genie([])` ?
        - `None`
        - `''` 
        - `0` 
        - `()` 
        - rien : cette expression génère une erreur

## Partie 3 : Une modélisation plus complète

Dans cette partie, on souhaite modéliser dans une même structure de données les notes des élèves d'une classe en précisant le nom de la matière concernée par la note. On propose la modélisation suivante :
```python
notes = {'Enzo' : ('Math', 3), 'Emma' : ('Math', 16),
        'Lucas' : ('NSI', 14), 'Manon' : ('Math', 3)}
```

1. Quel est le type de `notes` ?
    - un `int` 
    - une liste
    - un tuple
    - un dictionnaire
    - autre chose

2. Que vaut l'expression `notes[2]` ?
    - `14`
    - `'Lucas'` 
    - `('NSI', 14)` 
    - `3`
    - cette expression génère une erreur

3. Quelle instruction permet d'ajouter la note de 15 obtenue par Farid en NSI ?

4. Quel est l'affichage généré par l'exécution du code suivant ?
```python
for (nom, (matiere, note)) in notes.items():
    if note < 15:
        print(nom)
``` 

5. On veut écrire une fonction qui prend une telle structure de données en paramètre et qui renvoie le nom de l'élève qui a eu la moins bonne note, toutes matières confondues.
    - Proposer une test pour cette fonction.
    - Écrire le code de cette fonction.

6. On veut écrire une fonction `tri_par-matiere` qui prend une telle structure de données en paramètre et qui renvoie un dictionnaire dont les clés sont les noms des matières, et les valeurs la liste des notes obtenues par les élèves dans chaque matière.

**Exemple :**
```python
>>> notes = {'Enzo' : ('Math', 3), 'Emma' : ('Math', 16),
        'Lucas' : ('NSI', 14), 'Manon' : ('Math', 3)}
>>> tri_par_matiere(notes)
{'Math': [3, 3, 16], 'NSI': [14]}
``` 
Écrire le code de cette fonction.


