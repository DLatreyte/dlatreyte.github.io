---
title: "Autour de la suite de Fibonacci"
subtitle: "Chapitre 14,1"
author: ""
type: ""
date: 2021-02-25T04:49:20+04:00
draft: false
toc: true
tags: ["Récursivité", "Récursivité terminale", "Récursivité enveloppée", "Programmation dynamique", "Mémoïsation"]
categories: ["Terminales Spé NSI", "Informatique"]
image: ""
solution_est_visible: true
auto_numbering: true
---

## Rappel : récursivité terminale

La définition de la fonction factorielle est
$$
    n! = 
    \begin{cases}
        0 & \text{if } n = 0 \cr
        n \times (n-1)! & \text{sinon}
    \end{cases}
$$

1. Définir la fonction `fact_env` qui calcule la factorielle d'un entier naturel $n$, *sans oublier le jeu de tests*.\
    La définition de la fonction est :
    ```python
    def fact_env(n: int) -> int
    ```

{{% note normal %}}
En informatique, la **récursion terminale**, aussi appelée, récursion finale, est un *cas particulier de récursivité assimilée à une itération*.\
Une fonction à récursivité terminale (dite tail-recursive en anglais) est une fonction où l'**appel récursif est la dernière instruction à être évaluée**. Cette instruction est alors nécessairement « pure », c'est-à-dire qu'elle consiste en un simple appel à la fonction, et jamais à un calcul ou une composition.\
Les algorithmes récursifs exprimés à l'aide de fonctions à récursion terminale profitent donc d'une optimisation de la pile d'exécution.\
Cette réorganisation économise de l'espace mémoire car aucun état, sauf l'adresse de la fonction appelante, n'a besoin d'être sauvé sur la pile d'exécution. Cela signifie également que le programmeur n'a pas à craindre l'épuisement de l'espace de pile ou du tas pour des récursions très profondes.

<div style="text-align: right;">
    Wikipedia
</div>
{{% /note %}}

2. Définir la fonction `fact_term` qui calcule la factorielle d'un entier naturel $n$, *sans oublier le jeu de tests*.\
    La définition de la fonction est : 
    ```python
    def fact_term(n: int) -> int
    ```
    La fonction `fact_term` est en fait une fonction enveloppe de la fonction `_fact` dont la définition est :
    ```python
    def _fact(n: int, acc: int=1) -> int
    ```
    La fonction `_fact` met en œuvre un raisonnement basé sur la récursivité terminale.

## Autour de la suite de Fibonacci

En mathématiques, la suite de Fibonacci est une suite d'entiers dans laquelle chaque terme est la somme des deux termes qui le précèdent. Elle commence par les termes 0 et 1 si on part de l'indice 0, ou par 1 et 1 si on part de l'indice 1.
$$
    F_n =
    \begin{cases}
        F_0 = 0 \cr
        F_1 = 1 \cr
        F_n = F_{n-1} + F_{n-2}
    \end{cases}
$$

### Résolutions du problème sans programmation dynamique

3. Définir la fonction `fibo_iter` qui calcule le terme de rang $n$ de la suite de Fibonacci, *sans oublier le jeu de tests*. Le raisonnement mis en œuvre doit être itératif.\
    La définition de la fonction est :
    ```python
    def fibo_iter(n: int) -> int:
    ```

4. Quelle est la complexité de l'algorithme itératif ?

5. Définir la fonction `fibo_rec` qui calcule le terme de rang $n$ de la suite de Fibonacci, *sans oublier le jeu de tests*. Le raisonnement mis en œuvre doit être récursif.\
    La définition de la fonction est :
    ```python
    def fibo_rec(n: int) -> int:
    ```

6. Écrire l'arbre des appels récursifs pour $n=5$. En déduire la complexité de l'algorithme récursif.\
Quelle est la raison d'une telle complexité ?

7. En prenant pour exemple la définition de la fonction à la question 2. et l'algorithm itératif, à la question 3., définir la fonction `fib_recT` qui calcule le terme de rang $n$ de la suite de Fibonacci à l'aide d'un algorithme récursif terminal.\
    La définition de la fonction `fib_recT` est :
    ```python
    def fib_recT(n: int) -> int
    ```
    La fonction `fib_recT` est en fait une fonction enveloppe de la fonction `_fibo` dont la définition est :
    ```python
    def _fibo(n: int, a: int=0, b: int=1) -> int
    ```

8. Quelle est la complexité de cet algorithme ?

### Programmation dynamique

{{% note tip %}}
En informatique, la **programmation dynamique** est une méthode algorithmique pour résoudre des **problèmes d'optimisation**. Le concept a été introduit au début des années 1950 par Richard Bellman.

*La programmation dynamique consiste à résoudre un problème en le décomposant en sous-problèmes, puis à résoudre les sous-problèmes, des plus petits aux plus grands **en stockant les résultats intermédiaires**.*

La programmation dynamique s'appuie sur le **principe d'optimalité de Bellman** : *une solution optimale d'un problème s'obtient en combinant des solutions optimales à des sous-problèmes*.

La méthode de **programmation dynamique**, comme la méthode **diviser pour régner**, résout des problèmes en combinant des solutions de sous-problèmes. *Les algorithmes diviser-pour-régner partitionnent le problème en **sous-problèmes indépendants** qu’ils résolvent récursivement, puis combinent leurs solutions pour résoudre le problème initial. La méthode diviser-pour-régner est inefficace si on doit résoudre plusieurs fois le même sous-problème.*
{{% /note %}}

{{% note normal %}}
La programmation dynamique est utilisée pour résoudre des **problèmes d'optimisation**. 
La conception d’un algorithme de programmation dynamique est typiquement découpée en quatre étapes :
- Caractériser la structure d’une solution optimale.
- Définir (souvent de manière récursive) la valeur d’une solution optimale.
- Calculer la valeur d’une solution optimale.
- Construire une solution optimale à partir des informations calculées.
La dernière étape est utile pour calculer une **solution optimale**, et pas seulement la valeur optimale. Un problème d'optimisation peut avoir de nombreuses solutions. Chaque solution a une valeur, et on souhaite trouver une solution ayant la valeur optimale. *Une telle solution optimale au problème n'est pas forcément unique, c'est sa valeur qui l'est*.
{{% /note %}}

Dans le cas du calcul du terme de rang $n$ de la suite de Fibonacci à l'aide d'un raisonnement récursif, le problème a pour origine les multiples calculs de chacun des sous-termes nécessaires. *La programmation dynamique consiste alors à stocker les valeurs des sous-problèmes pour éviter les recalculs*.

{{% note tip %}}
Il existe alors deux méthodes pour calculer effectivement une solution : la **méthode ascendante** (**Bottom-up approach**) et la **méthode descendante** (**Top-down approach**).
- Dans la **méthode ascendante**, on commence par calculer des solutions pour les sous-problèmes les plus petits, puis, de proche en proche, on calcule les solutions des problèmes en utilisant le principe d'optimalité et on mémorise les résultats dans un tableau ou un dictionnaire `F`.
- Dans la **méthode descendante**, on écrit un algorithme récursif mais on utilise la **mémoïsation** pour ne pas résoudre plusieurs fois le même problème, c'est-à-dire que l'on stocke dans un tableau ou un dictionnaire `F` les résultats des appels récursifs.
{{% /note %}}

{{% note normal %}}
Une **fonction mémoïsée** *stocke les valeurs renvoyées par ses appels précédents dans une structure de données adaptée et, lorsqu'elle est appelée à nouveau avec les mêmes paramètres, renvoie la valeur stockée au lieu de la recalculer*. Une fonction peut être mémoïsée seulement si elle est **pure**, c'est-à-dire *si sa valeur de retour ne dépend que de la valeur de ses arguments, sans effet de bord*. En ce cas, la transparence référentielle permet de remplacer l'appel de la fonction directement par sa valeur. À la différence d'une fonction tabulée, où la table est statique, une fonction mémoïsée repose sur une table dynamique remplie à la volée.

*La mémoïsation est une façon de diminuer le temps de calcul d'une fonction, au prix d'une occupation mémoire plus importante. La mémoïsation modifie donc la complexité d'une fonction, en temps comme en espace.*
{{% /note %}}

### Résolutions du problème à l'aide de la programmation dynamique

9. Quel est l'intérêt des structures de données tableau ou dictionnaire pour le stockage des valeurs des sous-problèmes ?

10. Définir la fonction `fibo_memo` qui calcule le terme de rang $n$ de la suite de Fibonacci, *sans oublier le jeu de tests*. Le raisonnement doit être récursif et mettre en œuvre la technique de mémoïsation (méthode descendante).

11. Définir la fonction `fibo_up` qui calcule le terme de rang $n$ de la suite de Fibonacci, *sans oublier le jeu de tests*. Le raisonnement doit mettre en œuvre la méthode ascendante du problème.

## Application

On définit la suite de Tribonacci par la relation de récurrence : 
$$
    u_n =
    \begin{cases}
    u_0 &= u_1 = 0 \cr
    u_2 &= 1\cr
    u_{n+3} &= u_{n+2} + u_{n+1} + u_{n}
    \end{cases}
$$

1. Quel est l’écueil à éviter lorsqu’on programme le calcul du n-ième terme de la suite de Tribonacci de manière récursive ?
{{% solution "Réponse" %}}
Il faut éviter que les appels récursifs calculent plusieurs fois les mêmes valeurs.
{{% /solution %}}

2. Proposer une version itérative du calcul de $u_n$.
{{% solution "Réponse" %}}
```python
def tribo(n: int) -> int:
    u, v, w = 0, 0, 1 
    
    for i in range(n - 2): 
        u, v, w = v, w, u + v + w 
        return w
```
ou, si on n'utilise pas Python,
```python
def tribo(n: int) -> int:
    u, v, w = 0, 0, 1 
    
    for i in range(n - 2):
        x =  u + v + w
        u = v
        v = w
        w = x  
        return w
```
{{% /solution %}}

3. Proposer une version récursive du calcul de $u_n$.
{{% solution "Réponse" %}}
```python
def tribo(n: int) -> int:
    if n < 2: 
        return 0 
    elif n == 2:
        return 1
    
    return tribo(n - 1) + tribo(n - 2) + tribo(n - 3)
```
{{% /solution %}}

4. Proposer une version récursive efficace du calcul de $u_n$ qui utilise la mémoïsation.
{{% solution "Réponse" %}}
```python
def tribo(n: int) -> int: 
    memo_tribo = {0: 0, 1: 0, 2: 1} 
    
    def _tribo(n: int) -> int: 
        if n in memo_tribo.keys(): 
            return memo_tribo[n] 
        else: 
            memo_tribo[n] = _tribo(n - 1) + _tribo(n - 2) + _tribo(n - 3) 
        return memo_tribo[n] 
        
    return _tribo(n)
```
{{% /solution %}}