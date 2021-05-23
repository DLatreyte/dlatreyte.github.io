---
title: "Méthodes spéciales"
subtitle: ""
author: ""
type: ""
date: 2020-09-29T09:51:52+04:00
draft: false
toc: true
tags: ["Objet", "Classe", "Attribut", "Méthode", "Instance", "Encapsulation"]
categories: ["Terminales Spé NSI", "Informatique"]
image: ""
solution_est_visible: true
auto_numbering: true
---

Définit une classe nommée `Fraction` pour représenter les nombres rationnels. Cette classe doit posséder deux attributs `num` et `denom`, de type entier, qui représentent respectivement le numérateur et le dénominateur du nombre rationnel.  
On demande que le dénominateur soit un entier positif.

Un corrigé de cette activité se trouve à cette adresse : {{< remote "https://repl.it/@dlatreyte/fraction" "https://repl.it/@dlatreyte/fraction" >}}

1. Écrire le constructeur de cette classe. Une exception de type `ValueError` doit être levée si le dénominateur n'est pas un nombre entier positif.

2. Ajouter une méthode `__str__` qui renvoie une chaîne de caractères de la forme `"12 / 7"`, ou simplement `"12"` lorsque le dénominateur vaut 1.

3. Ajouter les méthodes `__add__` et `__mul__` qui reçoivent une deuxième fraction et qui retournent un nouvel objet de type `Fraction`, représentant respectivement la somme et le produit de deux fractions.

4. Ajouter des méthodes `__eq__` et `__lt__` qui reçoivent une deuxième fraction et qui retournent `True` si la première fraction représente un nombre respectivement égal ou strictement inférieur à la deuxième fraction.

{{% note warning %}}
S'assurer que les fractions sont toujours sous forme réduite.
{{% /note %}}