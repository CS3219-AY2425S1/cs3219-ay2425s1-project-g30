import { apiCall } from "./apiClient";
import { SignInDto, SignUpDto } from "@repo/dtos/auth";
import { UserSessionDto, UserDataDto } from "@repo/dtos/users";

export const signUp = async (signUpDto: SignUpDto): Promise<UserSessionDto> =>
  await apiCall("post", "/auth/signup", signUpDto);

export const signIn = async (signInDto: SignInDto): Promise<UserSessionDto> =>
  await apiCall("post", "/auth/signin", signInDto);

export const signOut = async () => await apiCall<void>("post", "/auth/signout");

export const me = async (): Promise<UserDataDto> => await apiCall("get", "/auth/me");

