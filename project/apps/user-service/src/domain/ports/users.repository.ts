import {
  ChangePasswordDto,
  UpdateUserDto,
  UserCollectionDto,
  UserDataDto,
  UserFiltersDto,
} from '@repo/dtos/users';

/**
 * Abstract class representing the UsersRepository.
 * This class defines the methods for interacting with user data and authentication records.
 */
export abstract class UsersRepository {
  /**
   * Retrieves all users.
   * @param filters - The filters to apply to the user query.
   * @returns A promise that resolves to a UserCollectionDto object.
   */
  abstract findAll(filters: UserFiltersDto): Promise<UserCollectionDto>;

  /**
   * Retrieves a user by their unique identifier.
   * @param id - The unique identifier of the user.
   * @returns A promise that resolves to a UserDataDto object.
   */
  abstract findById(id: string): Promise<UserDataDto>;

  /**
   * Updates an existing user's details with the given data.
   * @param updateUserDto - The updated data for the user.
   * @returns A promise that resolves to the updated UserDataDto object.
   */
  abstract updateById(updateUserDto: UpdateUserDto): Promise<UserDataDto>;

  /**
   * Updates an existing user's privilege by their unique identifier.
   * @param id - The unique identifier of the user.
   * @returns A promise that resolves to a UserDataDto object.
   */
  abstract updatePrivilegeById(id: string): Promise<UserDataDto>;

  /**
   * Changes the password for a user by their unique identifier.
   * @param changePasswordDto - The change password data transfer object.
   * @returns A promise that resolves to the updated UserDataDto object.
   */
  abstract changePasswordById(
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserDataDto>;

  /**
   * Deletes an existing by its unique identifier.
   * @param id - The unique identifier of the user to be deleted.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
  abstract deleteById(id: string): Promise<boolean>;
}
