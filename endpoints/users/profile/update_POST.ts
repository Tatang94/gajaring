import { z } from "zod";
import { schema } from "./update_POST.schema";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user) {
      throw new NotAuthenticatedError();
    }

    const json = await request.json();
    const validatedInput = schema.parse(json);

    const [updatedUser] = await db
      .updateTable("users")
      .set({
        display_name: validatedInput.displayName,
        bio: validatedInput.bio,
        avatar_url: validatedInput.avatarUrl,
        updated_at: new Date(),
      })
      .where("id", "=", user.id)
      .returning([
        "id",
        "email",
        "display_name as displayName",
        "avatar_url as avatarUrl",
        "role",
        "bio",
      ])
      .execute();

    if (!updatedUser) {
      return Response.json(
        { error: "User not found or update failed." },
        { status: 404 }
      );
    }

    return Response.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role as "admin" | "user",
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid input", issues: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}