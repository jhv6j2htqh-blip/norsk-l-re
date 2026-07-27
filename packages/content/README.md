# @norsk-laere/content

Contenu pédagogique au format défini par `spec/content-schema.md`.

Ce package est un squelette vide à ce stade (Phase 0). Le contenu réel
(niveaux, chapitres, leçons, vocabulaire, grammaire, dialogues, culture, audio)
est ajouté à partir de la Phase 1, en transformant `content/grammaire-A1-C2.md`
et les autres sources en JSON validé par Zod, conformément au schéma défini
dans `spec/content-schema.md`.

Le script `pnpm content:build` (à écrire avec le premier contenu réel) validera
les fichiers JSON puis générera `content.sqlite`, embarqué dans l'application.
