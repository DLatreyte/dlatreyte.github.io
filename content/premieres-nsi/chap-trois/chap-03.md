---
title: "Variables, affectations"
subtitle: "Chapitre 3"
author: ""
type: "page"
date: 2019-09-28T11:28:37+04:00
draft: false
toc: true
tags: [Informatique, Variables, Chaînes de caractères]
categories: [Cours 1ère]
image: ""
---

## 1. Variables ##

{{% note tip %}}
Une variable est une zone de la mémoire repérée par un **identificateur**. Cet identificateur permet de *modifier ou de faire appel au contenu de cette zone de la mémoire** lors du déroulement du programme.
{{% /note %}}

**Remarque.**  Le langage Python est **sensible à la casse** : `ma_variable`, `maVariable` et `mavariable` sont donc trois identificateurs différents (préférer la première écriture).

**Conventions.** 

- Le premier caractère de l'identificateur doit être une lettre ou un blanc souligné (`_`).

- Les caractères suivant peuvent être alphanumériques ou des blanc soulignés (`_`).

- Les majuscules et les minuscules ne sont pas confondues.

- Le tableau ci-après, contient les **mots-clés** du langage Python. *Il est impossible de choisir un identificateur correspondant à l'un de ces mots-clés*.

    |        |        |        |          |       |      |        |          |        |
    |:------:|:------:|:------:|:--------:|:-----:|:----:|:------:|:--------:|:------:|
    |   and  |   as   | assert |   break  | class |  del |  elif  | continue |   def  |
    |  else  | except |  exec  |  finally |  for  | from | global |    if    | import |
    |   in   |   is   | lambda | nonlocal |  not  |  or  |  pass  |   print  |  raise |
    | return |   try  |  while |   with   | yield | None |  True  |   False  |        |

## 2. Déclaration et affectation des variables ##

### 2.1. Vocabulaire ###

{{% note tip %}}
La **déclaration** d'une variable consiste à réserver un emplacement dans la mémoire pour une utilisation ultérieure.
{{% /note %}}

**Note.**  La déclaration d'une variable doit donc précéder son utilisation.

{{% note tip %}}
L'**affectation** est une opération au cours de laquelle on copie dans une variable *une valeur littérale, le contenu d'une autre variable ou le résultat d'un calcul*.
{{% /note %}}

### 2.2 Affectation d'une valeur à une variable ###

#### 2.2.1. Affectation simple ####

En Python, il est **impossible de déclarer une variable sans l'utiliser** : *la variable est créée lorsqu'on lui affecte une donnée*. On utilise à cet effet l'opérateur `=`.

Python est un langage à **typage dynamique** : *il n'est pas nécessaire de déclarer le type de la valeur référencée par la variable*.

{{< columns >}}
En Python, affectation du littéral 3 à la variable `a` :
```python3
a = 3
```
{{< column >}}
En C, C++, Java, ..., déclaration de la variable « entière » `a` **puis** affectation du littéral 3 à cette variable.
```java
int a;
a = 3;
```
{{< endcolumns >}}

**Remarque.** On peut noter dès à présent qu'*une affectation en Python ne consiste pas au stockage d'une valeur dans une variable*, contrairement à ce qui se passe dans d'autres langages de programmation (pour les types primitifs). En Python, *les objets (entiers, flottants, chaînes de caractères, …) sont **référencés** : lors d'une affectation, c'est une référence à un objet (et non une valeur) qui est définie*, que l'objet vienne d'être créé ou qu'il s'agisse d'un objet préexistant.

{{% note tip %}}
Une variable est, en Python, une **étiquette** qui permet d'accéder à une valeur.
{{% /note %}}

**Exemples.**
```python3
>>> un_entier = 12
>>> une_chaine = 'cartable' 
>>> un_flottant = -2 + 3.12 + 17
```

#### 2.2.2. Affectations multiples

```
>>> x = y = z = 1
>>> x 
1 
>>> y 
1 
>>> z 
1
```

**Remarque.** Pour bien comprendre comment fonctionne l'affectation multiple, ci-dessus, **lire l'instruction de la droite vers la gauche**. Ainsi, on affecte à la variable `z` l'entier 1, à la variable `y` la valeur référencée par la variable `z`, à la variable `x` la valeur référencée par la variable `y`. L'instruction précédente est donc équivalente à l'enchaînement :
```
>>> z = 1
>>> y = z 
>>> x = y
```

#### Affectation de « tuples »

```
>>> a, b, c = 1, 2, 3
>>> a 
1 
>>> b 
2 
>>> c 
3
```

**Remarque.** Le fonctionnement de cette affectation sera détaillé dans un prochain chapitre.

### Opérateurs d'affectation 

Le langage Python possède un certain nombre de raccourcis permettant de très rapidement écrire la mise à jour de la valeur d'une variable à partir d'une expression faisant elle même référence au contenu de la variable. *Ici aussi, il est nécessaire de lire l'instruction de la droite vers la gauche*.

| Opérateur |        Expression       |            Description            |
|:---------:|:-----------------------:|:---------------------------------:|
|     `=`     |  `variable = expression`  |                                   |
|     `+=`    |  `variable += expression` |  `variable = variable + expression` |
|     `-=`    |  `variable -= expression` |  `variable = variable - expression` |
|     `*=`    |  `variable *= expression` |  `variable = variable * expression` |
|     `/=`    |  `variable /= expression` |  `variable = variable / expression` |
|    `//=`    | `variable //= expression` | `variable = variable // expression` |
|     `%=`    |  `variable %= expression` |  `variable = variable % expression` |


## 3. Formatage des chaînes de caractères ##

Comme nous l'avons vu dans le précédent chapitre, une chaîne de caractère est un type pré-défini incontournable du langage Python.

```python
>>> type("abcd")
<class 'str'>
>>> type('abcd')
<class 'str'>
>>> type("Python, c'est super !")
<class 'str'>
>>> type('Python, c'est super !')
    File "<pyshell>", line 1 
       type('Python, c'est super !') 
                         ^
     SyntaxError: invalid syntax
>>> type("2")
<class 'str'>
>>> type("a")
<class 'str'>
>>> type('-2.3')
<class 'str'>
``` 

Il faut donc être capable de manipuler ces chaînes de caractères, et en particulier d'y incorporer le résultat de l'évalution d'expressions.

{{% note tip %}}
La méthode `chaine.format()` permet d'insérer un littéral ou le résultat de l'évaluation d'une expression dans une chaîne de caractères.

Le type du littéral ou du résultat de l'évaluation est déterminé automatiquement ; la conversion vers le type `str` est alors effectuée.
{{% /note %}}

```python3
>>> '{}, {}, {}'.format('a', 'b', 'c')
' a, b, c' 
>>> '{0}, {1}, {2}'.format('a', 'b', 'c') 
' a, b, c' 
>>> "La somme de 1 + 2 est {}".format(1 + 2) 
' La somme de 1 + 2 est 3' 
>>> "La somme de {1} + {2} est {0}".format(2 + 3, 2, 3) 
' La somme de 2 + 3 est 5' 
>>> '{0}{1}{0}'.format('abra', 'cad') 
' abracadabra' 
>>> '{:f}; {:f}'.format(3.14, -3.14) # :f est un marqueur 
'3.140000; -3.140000'
```
