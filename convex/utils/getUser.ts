import { getAuthUserId } from "@convex-dev/auth/server";
import { Auth, GenericQueryCtx } from "convex/server";
import { GenericId } from "convex/values";
import { QueryCtx, MutationCtx } from "../_generated/server";


export async function getUserByCtx(ctx: QueryCtx | MutationCtx) {
  try {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error("User Id is null or undefined");

    const user = await ctx.db.get(userId);

    if (!user) throw new Error("User not found in the database");
    return user;

  } catch (error) {
    console.error("[getUserById] Error:", error);
    return null;
  }
}