import { Exclude, Expose } from "class-transformer";
import { UserEntity } from "src/users/entities/user.entity";
import { Column, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export class TagEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50
  })
  name: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    unique: true
  })
  slug: string;

  @Exclude()
  @Column({
    type: 'timestamptz'
  })
  created_at: Date;

  @Exclude()
  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  author: UserEntity

  @Exclude()
  @Column({
    type: 'boolean',
    default: true
  })
  active: boolean

}
