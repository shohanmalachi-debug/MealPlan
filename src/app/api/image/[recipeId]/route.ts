import { NextRequest, NextResponse } from "next/server";
import { getRecipeById } from "@/lib/recipes";
import { getRecipeImageUrl } from "@/lib/images";

export async function GET(
  _req: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  const recipe = getRecipeById(params.recipeId);
  if (!recipe) {
    return NextResponse.json({ error: "recipe not found" }, { status: 404 });
  }

  const url = await getRecipeImageUrl(recipe.id, recipe.imageQuery);
  return NextResponse.json({ url });
}
