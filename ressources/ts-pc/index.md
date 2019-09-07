---
layout: page
title: Terminale PC
---

# Programme officiel

- <a href="https://cache.media.education.gouv.fr/file/special_8_men/99/0/physique_chimie_S_195990.pdf">Bulletin Officiel</a>

# Chapitres

- <a href="http://dlatreyte.github.io/ressources/ts-pc/C2_caracteristiques_ondes/C2_1.html"> Chapitre 2,1 :</a> Quelques caractéristiques des ondes mécaniques.

{% assign folder1 = site.pages | where_exp: "item" , "item.path contains 'folder1'"%} 
{% for item in folder1 %} 
{{item.title}} 
{% endfor %} 