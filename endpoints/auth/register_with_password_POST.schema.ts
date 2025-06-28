import { z } from "zod";
import { User } from "../../helpers/User";

export const schema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Name is required"),
});

export type OutputType = {
  user: User;
};

export const postRegister = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/auth/register_with_password`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include", // Important for cookies to be sent and received
  });

  if (!result.ok) {
    let errorMessage = "Registration failed";
    
    try {
      const errorData = await result.json();
      errorMessage = errorData.message || errorMessage;
    } catch (jsonError) {
      // If JSON parsing fails, try to get the raw text response
      try {
        const errorText = await result.text();
        errorMessage = errorText || `Registration failed with status ${result.status}`;
      } catch (textError) {
        errorMessage = `Registration failed with status ${result.status}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return result.json();
};