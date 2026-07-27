-- Index partiels — voir spec/data-model.md §5.
-- drizzle-kit ne sait pas générer d'index partiel (clause WHERE) à partir du
-- schéma TypeScript : migration écrite à la main.
--
-- NOTE : la table virtuelle FTS5 `vocabulary_fts` prévue par data-model.md §5
-- n'est PAS créée ici. Le binaire WASM officiel de `wa-sqlite` (paquet npm
-- `wa-sqlite@1.0.0`, builds `dist/wa-sqlite.wasm` et `dist/wa-sqlite-async.wasm`)
-- ne compile pas l'extension FTS5 (vérifié : aucune occurrence de "fts5" dans
-- les deux binaires). Créer la table maintenant casserait le démarrage de
-- l'app sur le driver web. Le dictionnaire (qui a besoin de FTS5) n'arrive
-- qu'en Phase 4 (spec/roadmap.md) : la question est documentée dans
-- spec/progress.md et sera tranchée à ce moment (recompiler wa-sqlite avec
-- FTS5, changer de lib SQLite web, ou recherche `LIKE` en repli sur le web).

DROP INDEX IF EXISTS `idx_user_vocab_due`;
CREATE INDEX `idx_user_vocab_due` ON `user_vocabulary` (`user_id`, `due_at`) WHERE `state` != 'new';
--> statement-breakpoint

DROP INDEX IF EXISTS `idx_sync_pending`;
CREATE INDEX `idx_sync_pending` ON `sync_queue` (`synced_at`) WHERE `synced_at` IS NULL;
