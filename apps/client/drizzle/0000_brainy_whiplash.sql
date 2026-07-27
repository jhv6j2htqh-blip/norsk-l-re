CREATE TABLE `ai_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`scenario_tag` text NOT NULL,
	`cefr_level` text NOT NULL,
	`started_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content_nb` text,
	`content_fr` text,
	`corrections` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`level_code` text NOT NULL,
	`order_index` integer NOT NULL,
	`title_fr` text NOT NULL,
	`title_nb` text NOT NULL,
	`theme` text NOT NULL,
	`description_fr` text NOT NULL,
	`icon` text,
	FOREIGN KEY (`level_code`) REFERENCES `levels`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cultural_items` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title_fr` text NOT NULL,
	`content_fr` text NOT NULL,
	`region` text,
	`cefr_level` text NOT NULL,
	`media_url` text,
	`date_relevant` text
);
--> statement-breakpoint
CREATE TABLE `dialogues` (
	`id` text PRIMARY KEY NOT NULL,
	`situation_tag` text NOT NULL,
	`cefr_level` text NOT NULL,
	`turns` text NOT NULL,
	`vocabulary_ids` text NOT NULL,
	`context_fr` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grammar_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`title_fr` text NOT NULL,
	`cefr_level` text NOT NULL,
	`explanation_fr` text NOT NULL,
	`examples` text NOT NULL,
	`fr_contrast` text NOT NULL,
	`common_errors` text NOT NULL,
	`related_rule_ids` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lesson_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`title_fr` text NOT NULL,
	`title_nb` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`objectives` text NOT NULL,
	`xp_reward` integer NOT NULL,
	`prerequisites` text NOT NULL,
	`situation_tag` text,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_chapter` ON `lessons` (`chapter_id`,`order_index`);--> statement-breakpoint
CREATE TABLE `levels` (
	`code` text PRIMARY KEY NOT NULL,
	`title_fr` text NOT NULL,
	`description_fr` text NOT NULL,
	`order_index` integer NOT NULL,
	`target_word_count` integer NOT NULL,
	`estimated_hours` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL,
	`synced_at` integer,
	`retry_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sync_pending` ON `sync_queue` (`synced_at`);--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`earned_at` integer,
	`progress` real DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `achievement_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_errors` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`error_type` text NOT NULL,
	`grammar_rule_id` text,
	`vocabulary_id` text,
	`user_answer` text NOT NULL,
	`expected_answer` text NOT NULL,
	`explanation_shown` text NOT NULL,
	`context_lesson_id` text,
	`occurred_at` integer NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`grammar_rule_id`) REFERENCES `grammar_rules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vocabulary_id`) REFERENCES `vocabulary`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`context_lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_errors_user_type` ON `user_errors` (`user_id`,`error_type`,`resolved`);--> statement-breakpoint
CREATE TABLE `user_lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`status` text DEFAULT 'locked' NOT NULL,
	`score` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`time_spent_seconds` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`last_block_index` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_passport_stamps` (
	`user_id` text NOT NULL,
	`situation_tag` text NOT NULL,
	`earned_at` integer NOT NULL,
	`mastery_score` integer NOT NULL,
	PRIMARY KEY(`user_id`, `situation_tag`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`persona` text NOT NULL,
	`goal` text NOT NULL,
	`target_level` text NOT NULL,
	`deadline` text,
	`daily_minutes` integer NOT NULL,
	`current_level` text NOT NULL,
	`known_languages` text NOT NULL,
	`reminder_time` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`tts_voice` text,
	`tts_speed` real DEFAULT 1 NOT NULL,
	`stt_enabled` integer DEFAULT true NOT NULL,
	`llm_mode` text DEFAULT 'local' NOT NULL,
	`notifications_enabled` integer DEFAULT true NOT NULL,
	`download_over_wifi_only` integer DEFAULT true NOT NULL,
	`font_scale` real DEFAULT 1 NOT NULL,
	`reduced_motion` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`minutes_studied` integer DEFAULT 0 NOT NULL,
	`lessons_completed` integer DEFAULT 0 NOT NULL,
	`words_learned` integer DEFAULT 0 NOT NULL,
	`exercises_correct` integer DEFAULT 0 NOT NULL,
	`exercises_total` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `date`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_stats_user_date` ON `user_stats` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `user_streaks` (
	`user_id` text PRIMARY KEY NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	`freeze_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_vocabulary` (
	`user_id` text NOT NULL,
	`vocabulary_id` text NOT NULL,
	`stability` real DEFAULT 0 NOT NULL,
	`difficulty` real DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`last_reviewed_at` integer,
	`review_count` integer DEFAULT 0 NOT NULL,
	`lapse_count` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'new' NOT NULL,
	PRIMARY KEY(`user_id`, `vocabulary_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vocabulary_id`) REFERENCES `vocabulary`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_vocab_due` ON `user_vocabulary` (`user_id`,`due_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`password_hash` text,
	`display_name` text NOT NULL,
	`avatar_id` text,
	`locale` text DEFAULT 'fr' NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsecond') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vocabulary` (
	`id` text PRIMARY KEY NOT NULL,
	`nb` text NOT NULL,
	`fr` text NOT NULL,
	`fr_alternatives` text NOT NULL,
	`pos` text NOT NULL,
	`gender` text,
	`inflections` text,
	`ipa` text NOT NULL,
	`audio_path` text,
	`example_nb` text NOT NULL,
	`example_fr` text NOT NULL,
	`cefr_level` text NOT NULL,
	`frequency_rank` integer NOT NULL,
	`tags` text NOT NULL,
	`fr_pitfall` text
);
--> statement-breakpoint
CREATE INDEX `idx_vocab_search` ON `vocabulary` (`nb`);--> statement-breakpoint
CREATE INDEX `idx_vocab_level` ON `vocabulary` (`cefr_level`,`frequency_rank`);