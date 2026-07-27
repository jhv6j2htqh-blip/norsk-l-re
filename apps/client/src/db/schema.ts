// Schéma Drizzle (SQLite local) — voir spec/data-model.md.
// Convention : snake_case en base, camelCase en TS (drizzle mappe automatiquement
// via le second argument de chaque colonne).
import { sql } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsecond') * 1000)`),
};

// ---------------------------------------------------------------------------
// 1. Utilisateur
// ---------------------------------------------------------------------------

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name").notNull(),
  avatarId: text("avatar_id"),
  locale: text("locale").notNull().default("fr"),
  ...timestamps,
});

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  persona: text("persona", {
    enum: ["expatriate", "student", "worker", "traveler", "enthusiast", "family"],
  }).notNull(),
  goal: text("goal", {
    enum: ["live_in_norway", "study", "work", "travel", "pleasure"],
  }).notNull(),
  targetLevel: text("target_level", {
    enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
  }).notNull(),
  deadline: text("deadline"),
  dailyMinutes: integer("daily_minutes").notNull(),
  currentLevel: text("current_level", {
    enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
  }).notNull(),
  knownLanguages: text("known_languages", { mode: "json" }).$type<string[]>().notNull(),
  reminderTime: text("reminder_time"),
});

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme", { enum: ["light", "dark", "system"] })
    .notNull()
    .default("system"),
  ttsVoice: text("tts_voice"),
  ttsSpeed: real("tts_speed").notNull().default(1),
  sttEnabled: integer("stt_enabled", { mode: "boolean" }).notNull().default(true),
  llmMode: text("llm_mode", { enum: ["local", "remote", "off"] })
    .notNull()
    .default("local"),
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  downloadOverWifiOnly: integer("download_over_wifi_only", { mode: "boolean" })
    .notNull()
    .default(true),
  fontScale: real("font_scale").notNull().default(1),
  reducedMotion: integer("reduced_motion", { mode: "boolean" }).notNull().default(false),
});

// ---------------------------------------------------------------------------
// 2. Contenu pédagogique (lecture seule, livré avec l'app)
// ---------------------------------------------------------------------------

export const levels = sqliteTable("levels", {
  code: text("code", { enum: ["A1", "A2", "B1", "B2", "C1", "C2"] }).primaryKey(),
  titleFr: text("title_fr").notNull(),
  descriptionFr: text("description_fr").notNull(),
  orderIndex: integer("order_index").notNull(),
  targetWordCount: integer("target_word_count").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
});

export const chapters = sqliteTable("chapters", {
  id: id(),
  levelCode: text("level_code")
    .notNull()
    .references(() => levels.code),
  orderIndex: integer("order_index").notNull(),
  titleFr: text("title_fr").notNull(),
  titleNb: text("title_nb").notNull(),
  theme: text("theme").notNull(),
  descriptionFr: text("description_fr").notNull(),
  icon: text("icon"),
});

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(), // slug stable, ex. a1-c02-l03
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapters.id),
    orderIndex: integer("order_index").notNull(),
    titleFr: text("title_fr").notNull(),
    titleNb: text("title_nb").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    objectives: text("objectives", { mode: "json" }).$type<string[]>().notNull(),
    xpReward: integer("xp_reward").notNull(),
    prerequisites: text("prerequisites", { mode: "json" }).$type<string[]>().notNull(),
    situationTag: text("situation_tag"),
  },
  (table) => [index("idx_lesson_chapter").on(table.chapterId, table.orderIndex)],
);

export const lessonBlockTypes = [
  "intro",
  "objectives",
  "explanation",
  "example",
  "exercise",
  "dialogue",
  "pronunciation",
  "quiz",
  "summary",
] as const;

export const lessonBlocks = sqliteTable("lesson_blocks", {
  id: id(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  type: text("type", { enum: lessonBlockTypes }).notNull(),
  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
});

export const vocabulary = sqliteTable(
  "vocabulary",
  {
    id: id(),
    nb: text("nb").notNull(),
    fr: text("fr").notNull(),
    frAlternatives: text("fr_alternatives", { mode: "json" }).$type<string[]>().notNull(),
    pos: text("pos", {
      enum: ["noun", "verb", "adj", "adv", "prep", "conj", "pron", "num", "interj"],
    }).notNull(),
    gender: text("gender", { enum: ["en", "ei", "et"] }),
    inflections: text("inflections", { mode: "json" }).$type<Record<string, string> | null>(),
    ipa: text("ipa").notNull(),
    audioPath: text("audio_path"),
    exampleNb: text("example_nb").notNull(),
    exampleFr: text("example_fr").notNull(),
    cefrLevel: text("cefr_level", { enum: ["A1", "A2", "B1", "B2", "C1", "C2"] }).notNull(),
    frequencyRank: integer("frequency_rank").notNull(),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
    frPitfall: text("fr_pitfall"),
  },
  (table) => [
    index("idx_vocab_search").on(table.nb),
    index("idx_vocab_level").on(table.cefrLevel, table.frequencyRank),
  ],
);

export const grammarRules = sqliteTable("grammar_rules", {
  id: id(),
  titleFr: text("title_fr").notNull(),
  cefrLevel: text("cefr_level", { enum: ["A1", "A2", "B1", "B2", "C1", "C2"] }).notNull(),
  explanationFr: text("explanation_fr").notNull(),
  examples: text("examples", { mode: "json" })
    .$type<{ nb: string; fr: string; highlight?: [number, number] }[]>()
    .notNull(),
  frContrast: text("fr_contrast").notNull(),
  commonErrors: text("common_errors", { mode: "json" })
    .$type<{ wrong: string; right: string; whyFr: string }[]>()
    .notNull(),
  relatedRuleIds: text("related_rule_ids", { mode: "json" }).$type<string[]>().notNull(),
});

export const dialogues = sqliteTable("dialogues", {
  id: id(),
  situationTag: text("situation_tag").notNull(),
  cefrLevel: text("cefr_level", { enum: ["A1", "A2", "B1", "B2", "C1", "C2"] }).notNull(),
  turns: text("turns", { mode: "json" })
    .$type<{ speaker: string; nb: string; fr: string; audioPath?: string }[]>()
    .notNull(),
  vocabularyIds: text("vocabulary_ids", { mode: "json" }).$type<string[]>().notNull(),
  contextFr: text("context_fr").notNull(),
});

export const culturalItems = sqliteTable("cultural_items", {
  id: id(),
  type: text("type", { enum: ["tradition", "expression", "region", "media", "fact"] }).notNull(),
  titleFr: text("title_fr").notNull(),
  contentFr: text("content_fr").notNull(),
  region: text("region"),
  cefrLevel: text("cefr_level", { enum: ["A1", "A2", "B1", "B2", "C1", "C2"] }).notNull(),
  mediaUrl: text("media_url"),
  dateRelevant: text("date_relevant"), // format MM-DD
});

// ---------------------------------------------------------------------------
// 3. Progression utilisateur (écriture, synchronisée)
// ---------------------------------------------------------------------------

export const userLessonProgress = sqliteTable(
  "user_lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id),
    status: text("status", {
      enum: ["locked", "available", "in_progress", "completed"],
    })
      .notNull()
      .default("locked"),
    score: integer("score"),
    attempts: integer("attempts").notNull().default(0),
    timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    lastBlockIndex: integer("last_block_index").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.lessonId] })],
);

export const userVocabulary = sqliteTable(
  "user_vocabulary",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    vocabularyId: text("vocabulary_id")
      .notNull()
      .references(() => vocabulary.id),
    stability: real("stability").notNull().default(0),
    difficulty: real("difficulty").notNull().default(0),
    dueAt: integer("due_at", { mode: "timestamp_ms" }).notNull(),
    lastReviewedAt: integer("last_reviewed_at", { mode: "timestamp_ms" }),
    reviewCount: integer("review_count").notNull().default(0),
    lapseCount: integer("lapse_count").notNull().default(0),
    state: text("state", { enum: ["new", "learning", "review", "relearning"] })
      .notNull()
      .default("new"),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.vocabularyId] }),
    index("idx_user_vocab_due").on(table.userId, table.dueAt),
  ],
);

export const userErrors = sqliteTable(
  "user_errors",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    errorType: text("error_type", {
      enum: ["grammar", "vocabulary", "spelling", "pronunciation", "word_order"],
    }).notNull(),
    grammarRuleId: text("grammar_rule_id").references(() => grammarRules.id),
    vocabularyId: text("vocabulary_id").references(() => vocabulary.id),
    userAnswer: text("user_answer").notNull(),
    expectedAnswer: text("expected_answer").notNull(),
    explanationShown: text("explanation_shown").notNull(),
    contextLessonId: text("context_lesson_id").references(() => lessons.id),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(),
    resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [index("idx_errors_user_type").on(table.userId, table.errorType, table.resolved)],
);

export const userStats = sqliteTable(
  "user_stats",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    xpEarned: integer("xp_earned").notNull().default(0),
    minutesStudied: integer("minutes_studied").notNull().default(0),
    lessonsCompleted: integer("lessons_completed").notNull().default(0),
    wordsLearned: integer("words_learned").notNull().default(0),
    exercisesCorrect: integer("exercises_correct").notNull().default(0),
    exercisesTotal: integer("exercises_total").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.date] }),
    index("idx_stats_user_date").on(table.userId, table.date),
  ],
);

export const userStreaks = sqliteTable("user_streaks", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD
  freezeCount: integer("freeze_count").notNull().default(0),
});

export const passportSituationTags = [
  "grocery_shopping",
  "public_transport",
  "doctor_visit",
  "bank_account",
  "rent_apartment",
  "job_interview",
  "university",
  "making_friends",
  "17_mai",
  "restaurant",
  "pharmacy",
  "phone_call",
  "administrative_forms",
  "workplace_small_talk",
] as const;

export const userPassportStamps = sqliteTable(
  "user_passport_stamps",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    situationTag: text("situation_tag", { enum: passportSituationTags }).notNull(),
    earnedAt: integer("earned_at", { mode: "timestamp_ms" }).notNull(),
    masteryScore: integer("mastery_score").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.situationTag] })],
);

export const userAchievements = sqliteTable(
  "user_achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id").notNull(),
    earnedAt: integer("earned_at", { mode: "timestamp_ms" }),
    progress: real("progress").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.achievementId] })],
);

export const aiConversations = sqliteTable("ai_conversations", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scenarioTag: text("scenario_tag").notNull(),
  cefrLevel: text("cefr_level", { enum: ["A1", "A2", "B1", "B2", "C1", "C2"] }).notNull(),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
});

export const aiMessages = sqliteTable("ai_messages", {
  id: id(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "tutor"] }).notNull(),
  contentNb: text("content_nb"),
  contentFr: text("content_fr"),
  corrections: text("corrections", { mode: "json" }).$type<
    { original: string; corrected: string; explanationFr: string }[]
  >(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// 4. Synchronisation (local uniquement — jamais envoyée telle quelle au serveur)
// ---------------------------------------------------------------------------

export const syncQueue = sqliteTable(
  "sync_queue",
  {
    id: id(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    operation: text("operation", { enum: ["insert", "update", "delete"] }).notNull(),
    payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
    retryCount: integer("retry_count").notNull().default(0),
  },
  (table) => [index("idx_sync_pending").on(table.syncedAt)],
);
