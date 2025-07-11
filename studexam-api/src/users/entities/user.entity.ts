import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as argon2 from 'argon2';
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from 'src/common/userRoles';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  @Expose()
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  @Expose()
  email: string;

  @Column({
    type: 'int',
    default: 0,
  })
  @Expose()
  points: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STANDARD,
  })
  @Expose()
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 2,
    default: 'en',
  })
  @Expose()
  language: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  @Exclude()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$argon2')) {
      // semplice check
      this.password = await argon2.hash(this.password);
    }
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return await argon2.verify(this.password, plainPassword);
  }
}
