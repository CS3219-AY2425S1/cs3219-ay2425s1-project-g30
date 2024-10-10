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

export const signUp = async (signUpDto: SignUpDto): Promise<UserDetails> =>
  await apiCall("post", "/auth/signup", signUpDto);

export const signIn = async (signInDto: SignInDto): Promise<UserDetails> =>
  await apiCall("post", "/auth/signin", signInDto);

export const signOut = async () => await apiCall<void>("post", "/auth/signout");

export const me = async (): Promise<UserDetails> => await apiCall("get", "/auth/me");

export const refreshAccessToken = async () => 
  await apiCall<void>("post", "/auth/refresh-token");
