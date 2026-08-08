import type { DifficultyResult, Recipe } from "./types";

const ATTENTION_TAGS = ["constant-stir", "multiple-pans", "deep-fry"];
const ATTENTION_BONUS_PER_TAG = 1;
const MAX_SCORE = 10;

export function getDifficulty(recipe: Recipe): DifficultyResult {
  const attentionTagBonus = recipe.tags.filter((tag) =>
    ATTENTION_TAGS.includes(tag)
  ).length * ATTENTION_BONUS_PER_TAG;

  const activeScore = Math.min(
    MAX_SCORE,
    (recipe.activeMinutes / 45) * 8 + attentionTagBonus
  );
  const timeScore = Math.min(MAX_SCORE, (recipe.totalMinutes / 60) * 10);

  const difficulty = Math.round(activeScore * 0.7 + timeScore * 0.3);

  let label: DifficultyResult["label"] = "Easy";
  if (difficulty >= 7) label = "Hard";
  else if (difficulty >= 4) label = "Medium";

  return { activeScore, timeScore, difficulty, label };
}
