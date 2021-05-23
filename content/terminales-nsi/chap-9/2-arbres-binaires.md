---
title: "Les arbres binaires"
subtitle: "Chapitre 9,2"
author: ""
type: ""
date: 2020-11-05T03:38:41+04:00
draft: false
toc: true
tags: ["Arbres", "Arbres binaires"]
categories: ["Terminales Spé NSI", "Informatique"]
image: ""
solution_est_visible: true
auto_numbering: true
---

{{% note normal %}}
Le corrigé de l'activité se trouve {{< remote "ici" "https://repl.it/@dlatreyte/arbres" >}}
{{% /note %}}
## Arbres binaires

### Définition

{{% note tip %}}
- Un **arbre binaire** est un arbre de degré 2 (dont les nœuds sont au plus de degré 2).

- Les enfants d’un nœud sont lus de gauche à droite et sont appelés : *fils gauche* et *fils droit*.
{{% /note %}}

{{% note warning %}}
Pour simplifier la présentation, on va considérer que chaque nœud possède exactement deux fils mais que **ceux-ci peuvent être vides** (`None` par exemple).
{{% /note %}}

{{% note normal %}}
Les arbres binaires forment une *structure de données abstraite qui peut se définir de façon récursive*. 

Un arbre binaire est :
- Soit vide.
- Soit composé d’une racine portant une étiquette (valeur) et d’une paire d’arbres binaires, appelés sous-arbres gauche et droit.
{{% /note %}}

### Relation entre nombre de nœuds et hauteur dans le cas des arbres binaires

{{% note tip %}}
Si $N$ désigne la taille d'un arbre binaire --- c'est à dire son nombre de nœuds non vides --- et $h$ sa hauteur, alors 
$$h \leqslant N \leqslant 2^h - 1$$
{{% /note %}}

1. Dans quel cas a-t-on $N = h$ ?
{{% solution "Réponse" %}}
On a $N = h$ lorsque chaque nœud ne possède qu'un seul nœud fils. Il s'agit donc d'une structure linéaire (liste).
{{% /solution %}}

2. Dans quel cas a-t-on $N = 2^h - 1$ ?
{{% solution "Réponse" %}}
On a $N = 2^h - 1$ lorsque l'arbre binaire est parfait, c'est à dire lorsque toutes les feuilles ont la même profondeur.
{{% /solution %}}

## Spécification des arbres binaires

{{% note tip %}}
- **Créer** un nœud (type)&nbsp;: 
    - fonction&nbsp;: `creer_nœud()` $\longrightarrow$ retourne un nœud &nbsp;;
    - `fils_gauche` et `fils_droit` sont automatiquement initialisés à `None` ;
    - complexité&nbsp;: $O(0)$ (pas tout à fait vrai mais suffisant pour comprendre la suite).
- **Lire** dans le champ `valeur`:
    - fonction&nbsp;: `lire_valeur(n: Noeud[T])` $\longrightarrow$ `T`&nbsp;;
    - complexité&nbsp;: 1 opération élémentaire.
- **Écrire** dans le champ `valeur`:
    - fonction&nbsp;: `modifier_valeur(n: Noeud[T], valeur: T)` $\longrightarrow$ `None`&nbsp;;
    - complexité&nbsp;: 1 opération élémentaire.
- **Lire** dans le champ `fils_gauche`:
    - fonction&nbsp;: `lire_filsG(n: Noeud[T])` $\longrightarrow$ `Noeud[T]`&nbsp;;
    - complexité&nbsp;: 1 opération élémentaire.
- **Écrire** dans le champ `fils_gauche`:
    - fonction&nbsp;: `modifier_filsG(n: Noeud[T], m: Noeud[T])` $\longrightarrow$ `None`&nbsp;;
    - complexité&nbsp;: 1 opération élémentaire.
- **Lire** dans le champ `fils_droit`:
    - fonction&nbsp;: `lire_filsD(n: Noeud[T])` $\longrightarrow$ `Noeud[T]`&nbsp;;
    - complexité&nbsp;: 1 opération élémentaire.
- **Écrire** dans le champ `fils_droit`:
    - fonction&nbsp;: `modifier_filsD(n: Noeud[T], m: Noeud[T])` $\longrightarrow$ `None`&nbsp;;
    - complexité&nbsp;: 1 opération élémentaire.
{{% /note %}}

{{% note warning %}}
*Tout comme on a désigné les listes chaînées par leur première cellule, on va désigner les arbres par leur nœud racine.* 
{{% /note %}}

## Implémentation de la spécification en Python

Il existe de nombreuses façons de d'implémenter la structure d'arbre en Python. Dans cette partie on va utiliser une classe.

2. Écrire le code de la classe `Noeud` respectant la spécification. Les trois attributs seront nommés `valeur`, `gauche`, `droit`.

3. Écrire le code permettant de construire l'arbre :
{{< mermaid >}}
graph TD
  A("A") --> B("B")
  B --> G(None)
  B --> C("C")
  C --> H(None)
  C --> I(None)
  A --> D("D")
  D --> E(None)
  D --> F(None)
{{< /mermaid >}}

4. Quel arbre correspond à ce code ?
```python
Noeud('r', Noeud('a', Noeud('c', None, Noeud('h')), Noeud('d', Noeud('i'),
 Noeud('j', Noeud('m'), None))), Noeud('b', Noeud('e', Noeud('k', None, None),
  None), Noeud('f')))
``` 
{{% solution "Réponse" %}}
<img src="/terminales-nsi/chap-9/chap-9-2-1.svg" alt="" width="100%" />
<img src="/terminales-nsi/chap-9/chap-9-2-2.png" alt="" width="100%" />
{{% /note %}}

5. Écrire la spécification et le code de la fonction `est_vide` qui teste si un arbre est vide.

6. Écrire la spécification et le code de la fonction `ajoute_filsG` qui ajoute un fils à gauche au nœud passé en argument.

7. Écrire la spécification et le code de la fonction `ajoute_filsD` qui ajoute un fils à gauche au nœud passé en argument.

8. Écrire la spécification et le code de la fonction `est_feuille` qui vérifie si un nœud est une feuille.

9. Écrire la spécification et le code de la fonction `nbre_fils` qui compte le nombre de fils que le nœud passé en argument possède.

## Algorithmique des arbres binaires

### Algorithmes récursifs

10. Écrire la spécification et le code de la fonction `taille` qui détermine la taille de l'arbre passé en argument.  

11. Écrire la spécification et le code de la fonction `profondeur` qui détermine la profondeur de l'arbre passé en argument.   

12. Écrire la spécification et le code de la fonction `nbre_feuilles` qui détermine le nombre de feuilles de l'arbre passé en argument.

13. Quelles sont les complexités des algorithmes implémentés dans cette section ?
{{% solution "Réponse" %}}
Les algorithmes parcourent une fois chaque nœud de l'arbre. La complexité est donc proportionnelle au nombre de nœuds.
{{% /solution %}}

### Parcours en profondeur d'un arbre

#### Récursifs

Les fonction écrites jusqu'à présent parcourent en profondeur tous les nœuds des arbres sans que l'ordre dans lequel ce parcourt est effectué ait la moindre importance.

Si on souhaite donner un affichage de l'arbre, la façon dont on le parcourt prend alors une grande importance. On peut :
- Parcourir le sous-arbre gauche, afficher la valeur du nœud puis enfin parcourir le sous-arbre droit. On parle d'un **parcours infixe**.
- Afficher la valeur de chaque nœud avant de parcourir les sous-arbres. On parle d'un **parcours préfixe**.
- Parcourir les sous-arbres puis afficher les valeurs. On parle d'un **parcours suffixe**.

14. Écrire les spécifications et le code des fonctions `affiche_infixe`, `affiche_prefixe` et `affiche_suffixe`.


#### Itératifs

15. Décrire le fonctionnement de l'algorithme suivant
```shell
Fonction parcours_largeur(Noeud racine):
    Pile p = newPile()
    empiler(p, racine)
    Noeud n = newNoeud()
    TantQue non est_vide(p):
        n = p.valeur
        print(depiler(p))
        Si non est_vide(n.filsG):
            empiler(p, n.filsG)
        FinSi
        Si non est_vide(n.filsD):
            empiler(p, n.filsD)
        FinSi
    FinTantQue
FinFonction
``` 

16. Implémenter en Python l'algorithme précédent.

### Parcours en largeur d'un arbre

17. Décrire le fonctionnement de l'algorithme suivant
```shell
Fonction parcours_largeur(noeud racine):
    File f = newFile()
    enfiler(f, racine)
    Noeud n = newNoeud()
    TantQue non est_vide(f):
        n = f.contenu
        print(f.defiler())
        Si non est_vide(n.filsG):
            enfiler(n.filsG)
        FinSi
        Si non est_vide(n.filsD):
            enfiler(n.filsD)
        FinSi
    FinTantQue
FinFonction
```

18. Implémenter en Python l'algorithme précédent.



## À retenir 

{{% note tip %}}
Un **arbre binaire** est une ensemble fini de nœuds, qui est soit **vide**, soit structuré à partir d'un nœud particulier, appelé **racine** de l'arbre, et de deux sous-ensembles de nœuds formant récursivement un **sous-arbre gauche** et un **sous-arbre droit**.   
Un arbre peut-être implémenté en Python avec un objet par nœud, d'une **classe** qui possède trois attributs : la valeur (ou étiquette) du nœud, le sous-arbre gauche et le sous-arbre droit. La valeur `None` est utilisée pour représenter l'arbre vide.
{{% /note %}}




