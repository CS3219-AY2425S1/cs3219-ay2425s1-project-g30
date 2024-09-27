import { apiCall } from "./apiClient";
import { SignInDto, SignUpDto } from "@repo/dtos/auth";

export const signUp = (signUpDto: SignUpDto) =>
  apiCall("post", "/auth/signup", signUpDto);

export const signIn = (signInDto: SignInDto) =>
  apiCall("post", "/auth/signin", signInDto);

export const signOut = () => apiCall<void>("post", "/auth/signout");

export const me = () => apiCall("get", "/auth/me");
