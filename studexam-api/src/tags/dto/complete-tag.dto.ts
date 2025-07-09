import { Exclude, Expose } from "class-transformer";
import { UserEntity } from "src/users/entities/user.entity";

export class CompleteTagDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  created_at: Date;

  @Expose()
  author: UserEntity;

  @Expose()
  active: boolean;
}
