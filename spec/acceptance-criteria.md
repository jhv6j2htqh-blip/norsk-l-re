# Critères d'acceptation

Format Gherkin léger. Chaque critère doit être vérifiable par un test Playwright
ou une vérification manuelle documentée.

---

## Onboarding

- **Étant donné** un premier lancement, **quand** j'ouvre l'app, **alors** l'onboarding
  s'affiche en 3 écrans max et se termine en moins de 90 secondes.
- **Quand** je choisis le persona « expatrié », **alors** le parcours proposé s'appelle
  « Vivre en Norvège » et les 5 premières leçons portent sur des situations administratives
  et quotidiennes.
- **Quand** je saute le test de niveau, **alors** je démarre en A1 sans blocage.

## Leçon

- **Quand** je termine une leçon, **alors** mon XP augmente et le vocabulaire nouveau
  apparaît en révision le lendemain.
- **Quand** je ferme brutalement l'app au milieu d'une leçon, **alors** à la réouverture
  je reprends exactement à l'exercice où j'étais, avec mes réponses précédentes conservées.
- **Quand** je réponds faux, **alors** je vois : la bonne réponse, une explication en français,
  et un bouton « Pourquoi ? ». Jamais le mot « Incorrect » seul.
- **Quand** j'écris `aa` au lieu de `å`, **alors** la réponse est acceptée.
- **Quand** je fais une faute de frappe d'une lettre sur un mot long, **alors** je reçois
  « presque ! » et je ne perds pas de cœur.

## Bouton « Pourquoi ? »

- **Quand** je clique sur « Pourquoi ? » hors ligne, **alors** j'obtiens une explication
  en moins de 300 ms (contenu pré-écrit ou règle liée).
- **Quand** l'explication concerne une erreur typique des francophones, **alors** le texte
  mentionne explicitement la différence avec le français.
- **Quand** aucun service IA n'est disponible, **alors** je vois quand même une explication
  utile — jamais un message d'erreur technique.

## Révision

- **Quand** j'ai 400 cartes en retard, **alors** la session m'en propose au plus mon quota
  quotidien, avec un message rassurant et non culpabilisant.
- **Quand** je révise le même mot pour la 3ᵉ fois, **alors** le format d'exercice diffère
  des deux précédents.
- **Quand** j'ai fait une erreur de grammaire il y a 3 jours, **alors** un exercice ciblé
  sur cette règle apparaît dans ma prochaine session.

## Hors ligne

- **Quand** j'active le mode avion, **alors** je peux : faire une leçon, réviser, consulter
  le dictionnaire, écouter l'audio, voir mes statistiques.
- **Quand** je reviens en ligne, **alors** ma progression se synchronise sans action de ma part
  et sans doublon.
- **Quand** deux appareils ont modifié la même carte hors ligne, **alors** l'état SRS
  le plus avancé est conservé, sans perte de progression.

## Prononciation

- **Quand** je prononce correctement, **alors** j'obtiens un score ≥ 80 et une validation.
- **Quand** je me trompe sur une voyelle longue, **alors** le mot fautif est surligné
  avec un conseil précis en français.
- **Quand** le micro est refusé, **alors** l'exercice devient facultatif au lieu de bloquer.

## IA

- **Quand** le LLM local est indisponible, **alors** l'app bascule sur l'API distante
  sans message d'erreur visible.
- **Quand** les deux sont indisponibles, **alors** les fonctions IA sont grisées
  avec une explication claire, et le reste de l'app fonctionne normalement.
- **Quand** je discute avec le tuteur, **alors** il corrige mes fautes en expliquant,
  sans jamais donner simplement la réponse.

## Passeport Norvège

- **Quand** je maîtrise toutes les leçons liées à `grocery_shopping` avec ≥ 80 %,
  **alors** j'obtiens le tampon « Faire ses courses » avec une animation discrète.
- **Quand** je consulte mon passeport, **alors** je vois clairement ce que je sais faire
  concrètement en Norvège, pas seulement un pourcentage.

## Performance

- Démarrage à froid < 2 s sur un appareil Android milieu de gamme (2022).
- Transition entre deux exercices < 100 ms.
- Recherche dictionnaire < 50 ms sur 10 000 entrées.
- Taille de l'app avec A1 complet et audio < 150 Mo.
- Aucune requête réseau bloquante au démarrage.

## Accessibilité

- Parcours complet d'une leçon au clavier seul.
- Lecteur d'écran : chaque exercice annonce sa consigne et son état.
- Contraste vérifié automatiquement en CI sur toutes les combinaisons de tokens.
- À `font-scale: 1.5`, aucun texte n'est tronqué ni superposé.

## Vie privée

- Aucun appel réseau vers un tiers non déclaré.
- Aucune donnée d'apprentissage envoyée sans compte créé.
- L'export de compte contient toutes les données en JSON lisible.
- La suppression de compte purge tout sous 30 jours, y compris les sauvegardes.
