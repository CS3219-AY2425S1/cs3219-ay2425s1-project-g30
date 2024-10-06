import { Session } from "@supabase/auth-js";

import { Tables } from "./generated/types/auth.types";

export type UserDataDto = Tables<"profiles">;

export type UserSessionDto = { userData: UserDataDto; session: Session };

export type UserAuthRecordDto = {
  id: string;
  email?: string;
  last_sign_in_at?: string;
  role?: string;
};
