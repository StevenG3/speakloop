import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.example" });

const prisma = new PrismaClient();
const demoPasswordHash = bcrypt.hashSync("demo12345", 10);
const adminPasswordHash = bcrypt.hashSync("admin12345", 10);

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: "demo@speakloop.dev" },
    update: { password_hash: demoPasswordHash },
    create: {
      email: "demo@speakloop.dev",
      password_hash: demoPasswordHash,
      profile: { create: { display_name: "Demo Learner", native_language: "en" } },
      roles: { create: { role: "user" } },
      settings: {
        create: {
          target_language: "ko",
          level: "beginner",
          goal: "Everyday conversation",
          default_speed: 1,
          theme: "system"
        }
      }
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@speakloop.dev" },
    update: { password_hash: adminPasswordHash },
    create: {
      email: "admin@speakloop.dev",
      password_hash: adminPasswordHash,
      profile: { create: { display_name: "Admin", native_language: "en" } },
      roles: { create: { role: "admin" } },
      settings: {
        create: {
          target_language: "ko",
          level: "intermediate",
          goal: "Coach learners",
          default_speed: 1,
          theme: "system"
        }
      }
    }
  });

  const session = await prisma.conversationSession.create({
    data: { user_id: demo.id, target_language: "ko", mode: "free_talk", level: "beginner", speed: 1 }
  });
  const message = await prisma.conversationMessage.create({
    data: { session_id: session.id, role: "user", text: "안녕하세요. 오늘 연습하고 싶어요." }
  });
  const vocab = await prisma.vocabularyItem.create({
    data: {
      user_id: demo.id,
      language: "ko",
      term: "연습",
      reading: "yeonseup",
      meaning: "practice",
      source_message_id: message.id,
      examples: { create: { sentence: "오늘 연습하고 싶어요.", translation: "I want to practice today." } }
    }
  });
  await prisma.reviewCard.create({
    data: { user_id: demo.id, vocabulary_item_id: vocab.id, ease: 2.5, interval_days: 0, repetitions: 0, due_at: new Date() }
  });

  await prisma.aiProviderConfig.upsert({
    where: { id: "seed-llm-provider" },
    update: { vendor: "mock", model: "mock-chat", role: "primary", is_active: true },
    create: { id: "seed-llm-provider", vendor: "mock", model: "mock-chat", role: "primary", is_active: true }
  });
  await prisma.sttProviderConfig.upsert({
    where: { id: "seed-stt-provider" },
    update: { vendor: "mock", model: "mock-stt", role: "primary", is_active: true },
    create: { id: "seed-stt-provider", vendor: "mock", model: "mock-stt", role: "primary", is_active: true }
  });
  await prisma.ttsProviderConfig.upsert({
    where: { id: "seed-tts-provider" },
    update: { vendor: "mock", model: "mock-tts", voice_id: "alloy", role: "primary", is_active: true },
    create: { id: "seed-tts-provider", vendor: "mock", model: "mock-tts", voice_id: "alloy", role: "primary", is_active: true }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
