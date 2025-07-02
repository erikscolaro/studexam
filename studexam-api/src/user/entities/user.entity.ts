import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as argon2 from 'argon2'

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  PREMIUM = 'premium',
  STANDARD = 'standard',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
		type: "varchar",
		length: 50,
		unique: true
	})
  username: string;

  @Column({
		type: "varchar",
		length: 255,
		unique: true
	})
  email: string;

  @Column({
		type: "int",
		default: 0
	})
  points: number;

  @Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.STANDARD
	})
	role: UserRole

  @Column({
		type: "varchar",
		length: 2,
		default: "en"
	})
  language: string;

  @Column({
		type: "string",
		nullable: false
	})
  password: string;

@BeforeInsert()
@BeforeUpdate()
async hashPassword() {
  if (this.password && !this.password.startsWith('$argon2')) { // semplice check
    this.password = await argon2.hash(this.password);
  }
}

async verifyPassword(plainPassword: string): Promise<boolean> {
	return await argon2.verify(this.password, plainPassword);
}

}

