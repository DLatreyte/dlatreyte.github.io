---
title: "Les tours de Hanoï"
subtitle: "Chapitre 10,3"
author: ""
type: ""
date: 2020-11-24T04:54:14+04:00
draft: false
toc: true
tags: ["Diviser pour régner", "Récursivité"]
categories: ["Terminales Spé NSI", "Informatique"]
image: ""
solution_est_visible: true
auto_numbering: true
---

{{% note normal %}}
Les tours de Hanoï constituent un problème inventé par le mathématicien français Édouard Lucas. Ce jeu mathématique est constitué de trois tiges sur lesquelles sont enfilés $n$ disques de diamètres différents.      
Au début du jeu, ces disques sont tous positionnés sur la premiére tige (du plus grand au plus petit) et *l’objectif est de déplacer tous ces disques sur la troisième tige*, en respectant les règles suivantes :
- *Un seul disque peut être déplacé à la fois ;*
- *On ne peut jamais poser un disque sur un disque de diamètre inférieur.*
{{% /note %}}

<img src="/terminales-nsi/chap-10/chap-10-3-1.png" alt="" width="70%" />

1. Numéroter chaque disque pour un empilement à 4 disques et écrire l'enchaînement des étapes nécessaires à la réalisation de la tâche.

2. Faire émerger le raisonnement récursif qui permet de résoudre le problème.
{{% solution "Réponse" %}}
Pour pouvoir déplacer le dernier disque, il est nécessaire de déplacer les $n − 1$ disques qui le couvrent sur la tige centrale. Une fois ces déplacements effectués, on peut déplacer le dernier disque sur la troisième tige. Il reste alors à déplacer les $n − 1$ autres disques vers la troisième tige.
<img src="/terminales-nsi/chap-10/chap-10-3-2.png" alt="" width="" />
{{% /solution %}}

3. Écrire le code de la fonction dont la spécification est
```python
def hanoi(n: int, debut: int = 1, milieu: int = 2, fin: int = 3) -> None:
    """
    Fonction qui déplace récursivement les disques selon les règles des tours de Hanoï. 
    """
```
Tester cette fonction.


- {{< remote "Accès au corrigé" "https://repl.it/@dlatreyte/hanoi" >}}