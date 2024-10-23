import { matchRequestMsgSchema } from '@repo/dtos/match';

export const validateMatchParam = (param: string | null) => {
  if (!param) return false;

  try {
    const parsedData = JSON.parse(param);
    const validationResult = matchRequestMsgSchema.safeParse(parsedData);

    if (!validationResult.success) {
      console.log(validationResult.error);
      return false;
    }

    return true;
  } catch (e: any) {
    console.log(e);
    return false;
  }
};
