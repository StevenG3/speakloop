-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "native_language" TEXT NOT NULL,
    CONSTRAINT "UserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "UserRoleAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "goal" TEXT NOT NULL DEFAULT 'Everyday conversation',
    "default_speed" REAL NOT NULL DEFAULT 1,
    "theme" TEXT NOT NULL DEFAULT 'system',
    CONSTRAINT "UserSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "api_key_encrypted" TEXT,
    "base_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL,
    "last_health" TEXT,
    "last_latency_ms" INTEGER,
    "updated_by" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SttProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "api_key_encrypted" TEXT,
    "base_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL,
    "last_health" TEXT,
    "last_latency_ms" INTEGER,
    "updated_by" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TtsProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "model" TEXT,
    "voice_id" TEXT NOT NULL,
    "voice_gender" TEXT,
    "api_key_encrypted" TEXT,
    "base_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL,
    "last_health" TEXT,
    "last_latency_ms" INTEGER,
    "updated_by" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "speed" REAL NOT NULL,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    CONSTRAINT "ConversationSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audio_url" TEXT,
    "stt_provider" TEXT,
    "llm_provider" TEXT,
    "tts_provider" TEXT,
    "latency_ms" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationMessage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ConversationSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VocabularyItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "reading" TEXT,
    "meaning" TEXT NOT NULL,
    "source_message_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    CONSTRAINT "VocabularyItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VocabularyItem_source_message_id_fkey" FOREIGN KEY ("source_message_id") REFERENCES "ConversationMessage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VocabularyExample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vocabulary_item_id" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "translation" TEXT,
    CONSTRAINT "VocabularyExample_vocabulary_item_id_fkey" FOREIGN KEY ("vocabulary_item_id") REFERENCES "VocabularyItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vocabulary_item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ease" REAL NOT NULL,
    "interval_days" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "due_at" DATETIME NOT NULL,
    "last_reviewed_at" DATETIME,
    CONSTRAINT "ReviewCard_vocabulary_item_id_fkey" FOREIGN KEY ("vocabulary_item_id") REFERENCES "VocabularyItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewCard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "review_card_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "reviewed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prev_interval" INTEGER NOT NULL,
    "next_interval" INTEGER NOT NULL,
    CONSTRAINT "ReviewEvent_review_card_id_fkey" FOREIGN KEY ("review_card_id") REFERENCES "ReviewCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PronunciationFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message_id" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "phoneme_notes" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PronunciationFeedback_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ConversationMessage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderRequestLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_kind" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error_code" TEXT,
    "token_usage" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProviderRequestLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "UserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_user_id_role_key" ON "UserRoleAssignment"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_user_id_key" ON "UserSettings"("user_id");

-- CreateIndex
CREATE INDEX "ConversationMessage_session_id_idx" ON "ConversationMessage"("session_id");

-- CreateIndex
CREATE INDEX "VocabularyItem_user_id_language_deleted_at_idx" ON "VocabularyItem"("user_id", "language", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewCard_vocabulary_item_id_key" ON "ReviewCard"("vocabulary_item_id");

-- CreateIndex
CREATE INDEX "ReviewCard_user_id_due_at_idx" ON "ReviewCard"("user_id", "due_at");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationFeedback_message_id_key" ON "PronunciationFeedback"("message_id");

-- CreateIndex
CREATE INDEX "AuditLog_actor_user_id_created_at_idx" ON "AuditLog"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "ProviderRequestLog_created_at_provider_kind_idx" ON "ProviderRequestLog"("created_at", "provider_kind");
