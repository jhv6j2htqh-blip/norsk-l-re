# Modèle de données

SQLite en local (offline-first), PostgreSQL sur le serveur, **schéma Drizzle unique**.
Types différents uniquement pour : `TEXT`/`UUID`, `INTEGER`/`TIMESTAMPTZ`.

Convention : `snake_case` en base, `camelCase` en TS. Toutes les tables ont
`id TEXT PRIMARY KEY` (UUID v7), `created_at`, `updated_at`.

---

## 1. Utilisateur

### `users`
| champ | type | notes |
|---|---|---|
| id | uuid | |
| email | text unique | nullable si compte local uniquement |
| password_hash | text | Argon2id, nullable |
| display_name | text | |
| avatar_id | text | référence à un avatar prédéfini |
| locale | text | `fr` par défaut |
| created_at / updated_at | timestamp | |

### `user_profiles`
Résultat de l'onboarding — pilote la personnalisation.

| champ | type | valeurs |
|---|---|---|
| user_id | uuid FK | |
| persona | enum | `expatriate` `student` `worker` `traveler` `enthusiast` `family` |
| goal | enum | `live_in_norway` `study` `work` `travel` `pleasure` |
| target_level | enum | `A1`…`C2` |
| deadline | date null | |
| daily_minutes | int | 5 / 10 / 20 / 30 / 60 |
| current_level | enum | issu du test de placement |
| known_languages | json | ex. `["fr","en"]` |
| reminder_time | text null | `HH:mm` |

### `user_settings`
`theme`, `tts_voice`, `tts_speed`, `stt_enabled`, `llm_mode` (`local`/`remote`/`off`),
`notifications_enabled`, `download_over_wifi_only`, `font_scale`, `reduced_motion`.

---

## 2. Contenu pédagogique (lecture seule, livré avec l'app)

### `levels`
`code` (A1…C2), `title_fr`, `description_fr`, `order_index`,
`target_word_count`, `estimated_hours`.

### `chapters`
`level_code` FK, `order_index`, `title_fr`, `title_nb`, `theme`,
`description_fr`, `icon`.

### `lessons`
| champ | type | notes |
|---|---|---|
| id | text | slug stable, ex. `a1-c02-l03` |
| chapter_id | text FK | |
| order_index | int | |
| title_fr / title_nb | text | |
| duration_minutes | int | 5, 10 ou 20 |
| objectives | json | `string[]` |
| xp_reward | int | |
| prerequisites | json | `lessonId[]` |
| situation_tag | text null | lie au Passeport Norvège, ex. `grocery_shopping` |

### `lesson_blocks`
Une leçon = suite ordonnée de blocs. Voir `lesson-engine.md`.

| champ | type |
|---|---|
| lesson_id | text FK |
| order_index | int |
| type | enum : `intro` `objectives` `explanation` `example` `exercise` `dialogue` `pronunciation` `quiz` `summary` |
| payload | json (schéma dépendant de `type`) |

### `vocabulary`
| champ | type | notes |
|---|---|---|
| id | text | |
| nb | text | forme de base |
| fr | text | traduction principale |
| fr_alternatives | json | autres traductions acceptées |
| pos | enum | `noun` `verb` `adj` `adv` `prep` `conj` `pron` `num` `interj` |
| gender | enum null | `en` `ei` `et` (substantifs) |
| inflections | json | voir `content-schema.md` |
| ipa | text | prononciation |
| audio_path | text null | |
| example_nb / example_fr | text | |
| cefr_level | enum | |
| frequency_rank | int | |
| tags | json | `["food","formal"]` |
| fr_pitfall | text null | piège spécifique aux francophones |

### `grammar_rules`
`id`, `title_fr`, `cefr_level`, `explanation_fr` (markdown), `examples` (json),
`fr_contrast` (comparaison avec le français), `common_errors` (json), `related_rule_ids`.

### `dialogues`
`id`, `situation_tag`, `cefr_level`, `turns` (json : `{speaker, nb, fr, audio_path}[]`),
`vocabulary_ids`, `context_fr`.

### `cultural_items`
`id`, `type` (`tradition`|`expression`|`region`|`media`|`fact`), `title_fr`,
`content_fr` (markdown), `region` null, `cefr_level`, `media_url` null, `date_relevant` null.

---

## 3. Progression utilisateur (écriture, synchronisée)

### `user_lesson_progress`
`user_id`, `lesson_id`, `status` (`locked`|`available`|`in_progress`|`completed`),
`score` (0-100), `attempts`, `time_spent_seconds`, `completed_at`, `last_block_index`.
PK composite `(user_id, lesson_id)`.

### `user_vocabulary` — état SRS
| champ | type | notes |
|---|---|---|
| user_id + vocabulary_id | PK composite | |
| stability | real | FSRS |
| difficulty | real | FSRS |
| due_at | timestamp | |
| last_reviewed_at | timestamp null | |
| review_count | int | |
| lapse_count | int | |
| state | enum | `new` `learning` `review` `relearning` |

### `user_errors` — mémoire des erreurs (différenciant clé)
`id`, `user_id`, `error_type` (`grammar`|`vocabulary`|`spelling`|`pronunciation`|`word_order`),
`grammar_rule_id` null, `vocabulary_id` null, `user_answer`, `expected_answer`,
`explanation_shown`, `context_lesson_id`, `occurred_at`, `resolved` bool.

→ alimente les révisions ciblées et l'IA tutrice.

### `user_stats`
Agrégats quotidiens : `user_id`, `date`, `xp_earned`, `minutes_studied`,
`lessons_completed`, `words_learned`, `exercises_correct`, `exercises_total`.

### `user_streaks`
`user_id`, `current_streak`, `longest_streak`, `last_active_date`, `freeze_count`.

### `user_passport_stamps` — Passeport Norvège
`user_id`, `situation_tag`, `earned_at`, `mastery_score`.
Tampons : `grocery_shopping`, `public_transport`, `doctor_visit`, `bank_account`,
`rent_apartment`, `job_interview`, `university`, `making_friends`, `17_mai`,
`restaurant`, `pharmacy`, `phone_call`, `administrative_forms`, `workplace_small_talk`.

### `user_achievements`
`user_id`, `achievement_id`, `earned_at`, `progress`.

### `ai_conversations` / `ai_messages`
`conversation_id`, `user_id`, `scenario_tag`, `cefr_level`, `started_at` ;
messages : `role` (`user`|`tutor`), `content_nb`, `content_fr`, `corrections` (json),
`created_at`.

---

## 4. Synchronisation

### `sync_queue` (local uniquement)
`id`, `table_name`, `record_id`, `operation` (`insert`|`update`|`delete`),
`payload` json, `created_at`, `synced_at` null, `retry_count`.

Résolution de conflit : **last-write-wins par champ** avec `updated_at`,
sauf `user_vocabulary` où l'état SRS le plus avancé (`review_count` max) l'emporte.

---

## 5. Index requis

```sql
CREATE INDEX idx_user_vocab_due ON user_vocabulary(user_id, due_at)
  WHERE state != 'new';
CREATE INDEX idx_vocab_search ON vocabulary(nb);
CREATE INDEX idx_vocab_level ON vocabulary(cefr_level, frequency_rank);
CREATE INDEX idx_lesson_chapter ON lessons(chapter_id, order_index);
CREATE INDEX idx_errors_user_type ON user_errors(user_id, error_type, resolved);
CREATE INDEX idx_stats_user_date ON user_stats(user_id, date DESC);
CREATE INDEX idx_sync_pending ON sync_queue(synced_at) WHERE synced_at IS NULL;
```

Recherche dictionnaire : table FTS5 `vocabulary_fts` sur `nb`, `fr`, `example_nb`.
