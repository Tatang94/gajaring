import { z } from "zod";
import { User } from "../../../helpers/User";

export const schema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50, "Display name cannot exceed 50 characters."),
  bio: z.string().max(160, "Bio cannot exceed 160 characters.").optional().nullable(),
  avatarUrl: z.string().url("Please enter a valid URL for the avatar.").optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  user: User & { bio?: string | null };
} | {
  error: string;
  issues?: z.ZodIssue[];
};

export const postUsersProfileUpdate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/users/profile/update`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to update profile");
  }
  return result.json();
};