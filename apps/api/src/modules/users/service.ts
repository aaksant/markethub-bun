import { User } from "@app/db/schema";
import { UserQueryParams, UsersRepository } from "./repository";
import { NotFoundError } from "../../core/errors/error-types";
import { PaginationResult } from "../../core/pagination";

export class UsersService {
  private readonly usersRepository = new UsersRepository();

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.getById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    return user;
  }

  async list(params: UserQueryParams): Promise<PaginationResult<User>> {
    return await this.usersRepository.getPage(params);
  }
}
