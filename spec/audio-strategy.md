# Stratégie audio — voix norvégiennes

Ce document applique la méthode « Zero-Cost First » définie dans le PRD (chapitre 18) :
comparer plusieurs solutions avant de choisir, sans exclure une option payante si aucune
alternative gratuite ne tient la qualité requise.

## Contrainte de départ

Objectif : des voix norvégiennes **très réalistes**, alors que l'application doit rester
**gratuite pour l'utilisateur** et fonctionner **sans connexion internet**.
En apparence, ces deux exigences se contredisent — la synthèse vocale la plus réaliste
tourne sur des serveurs distants et coûte de l'argent par caractère généré.

## La solution : séparer la production du contenu de l'usage de l'application

Il ne faut pas confondre deux moments différents :

1. **La production du contenu** — un travail ponctuel, fait une seule fois par l'équipe
   du projet, pour créer les centaines de phrases des leçons.
2. **L'usage par l'utilisateur** — répété des millions de fois, doit rester gratuit et
   fonctionner hors ligne.

**Toutes les phrases des leçons sont connues à l'avance** (elles sont écrites dans le
contenu pédagogique, voir `content-schema.md`). On peut donc générer leur audio une fois,
avec le meilleur outil disponible, puis livrer les fichiers `.mp3` avec l'application —
exactement comme s'il s'agissait d'un enregistrement humain classique. Le champ `audioPath`
déjà prévu dans le schéma de contenu ne change pas : peu importe qu'un fichier ait été
enregistré par une vraie personne ou généré par une IA, l'application le lit de la même façon.

Seule une petite partie du contenu est **imprévisible** (un mot tapé au hasard dans le
dictionnaire, une réponse du tuteur IA en conversation) : celle-là ne peut pas être
préparée à l'avance et a besoin d'une solution différente.

---

## Comparatif des outils de génération (production du contenu)

| Solution | Réalisme | Coût | Norvégien Bokmål | Verdict |
|---|---|---|---|---|
| Piper (local, gratuit) | Correct, un peu synthétique | 0 € | Oui, voix `nb_NO` disponible | Trop robotique pour l'objectif "très très réaliste" |
| Coqui XTTS (local, gratuit) | Très bon | 0 € | **Non pris en charge** (langue absente du modèle) | Écarté — le norvégien n'est pas supporté |
| Azure AI Speech (voix neuronales) | Très réaliste | ~15 $ / million de caractères, palier gratuit mensuel | Oui, plusieurs voix `nb-NO` officielles | **Recommandé par défaut** |
| Google Cloud TTS (Neural2 / Studio) | Très réaliste | Palier gratuit mensuel, puis payant | Oui | Bonne alternative à Azure |
| ElevenLabs | Le plus réaliste du marché | Le plus cher | Oui (voix multilingues) | Réservé aux phrases les plus importantes (dialogues clés, avatar du tuteur) si le budget le permet |

## Décision retenue

- **Production des leçons** : génération en une fois avec **Azure AI Speech** (voix
  neuronales norvégiennes), livrée en fichiers audio figés avec l'application.
  Coût maîtrisé car payé une seule fois par phrase, jamais par utilisateur.
- **Cas imprévisibles** (dictionnaire, conversation IA libre) : **Piper local**, gratuit,
  tourne sur l'appareil, aucune connexion requise. Moins parfait, mais acceptable pour
  un usage ponctuel et fonctionnel plutôt qu'un contenu pédagogique figé.
- **Option future, si le budget le permet** : régénérer les dialogues et scènes les plus
  importantes avec **ElevenLabs** pour un rendu encore plus naturel, sans rien changer
  au code — seul le fichier audio change.

## Ce que ça change concrètement pour l'agent de code

- Le code ne doit **jamais** appeler un service de synthèse vocale payant en direct
  pendant qu'un utilisateur suit une leçon — l'audio des leçons est un fichier déjà là.
- La génération des voix devient une **étape du pipeline de contenu**
  (`packages/content/`), pas une fonctionnalité de l'application elle-même :
  un script `pnpm content:generate-audio` prend le texte norvégien de chaque
  `vocabulary`, `dialogue` et `lesson_block`, appelle Azure AI Speech une fois,
  et enregistre le résultat dans `packages/content/audio/`.
- Le service `TtsService` (voir `AGENTS.md` §6) garde son rôle : il sert uniquement
  au texte généré à la volée (dictionnaire, tuteur IA), avec Piper comme implémentation
  locale par défaut.
