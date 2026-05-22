import type { Language, VocabCandidate } from "./schemas";

export type VocabularyDraft = {
  user_id: string;
  language: Language;
  term: string;
  reading?: string;
  meaning: string;
  source_message_id: string;
  examples: Array<{ sentence: string }>;
};

export function extractVocabularyDrafts(
  candidates: VocabCandidate[],
  context: { user_id: string; language: Language; source_message_id: string }
): VocabularyDraft[] {
  return candidates
    .map((candidate) => {
      const reading = clean(candidate.reading);
      const example = clean(candidate.example);

      return {
        user_id: context.user_id,
        language: context.language,
        term: clean(candidate.term).toLowerCase(),
        ...(reading ? { reading } : {}),
        meaning: clean(candidate.meaning),
        source_message_id: context.source_message_id,
        examples: example ? [{ sentence: example }] : []
      };
    })
    .filter((draft) => draft.term.length > 0 && draft.meaning.length > 0);
}

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}
