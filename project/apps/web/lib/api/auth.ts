import { apiCall } from "./apiClient";
import { SignInDto, SignUpDto } from "@repo/dtos/auth";

// TODO: fix this interface by prob a DTO or sth
export interface UserDetails {
  created_at: string;
  email: string;
  id: string;
  role: string;
  username: string;
}

export const signUp = (signUpDto: SignUpDto) =>
  apiCall("post", "/auth/signup", signUpDto);

export const signIn = (signInDto: SignInDto) =>
  apiCall("post", "/auth/signin", signInDto);

export const signOut = () => apiCall<void>("post", "/auth/signout");

export const me = (): Promise<UserDetails> => apiCall("get", "/auth/me");
