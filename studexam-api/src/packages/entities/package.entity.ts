import { Exclude, Expose } from 'class-transformer';
import { TagEntity } from 'src/tags/entities/tag.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PackageEntity {
  @Expose()
  @PrimaryGeneratedColumn('identity', {
    type: 'int',
  })
  id: number;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    type: 'integer',
    nullable: false,
  })
  cardsNum: number;

  @Expose()
  @Column({
    type: 'timestamptz',
  })
  createdAt: Date;

  @Expose()
  @Column({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @Expose()
  @Column({
    type: 'varchar',
    length: 2,
  })
  language: string;

  @Expose()
  @ManyToOne(() => UserEntity, { nullable: true })
  author: UserEntity;

  // category search disabled
  //@Expose()
  //@ManyToOne(() => CategoryEntity, (category) => category.childPackages, {
  //  nullable: false,
  //  onDelete: 'CASCADE',
  //  onUpdate: 'CASCADE'
  //})
  //parentCategory: CategoryEntity;

  @Expose()
  @ManyToMany(() => TagEntity, (tag) => tag.packages, {
    nullable: false,
  })
  @JoinTable()
  tags: TagEntity[];
}
