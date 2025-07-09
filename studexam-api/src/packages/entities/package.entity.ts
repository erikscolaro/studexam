import { Expose } from 'class-transformer';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
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
  @ManyToOne(() => UserEntity)
  author: UserEntity;

  // category search disabled
  //@Expose()
  //@ManyToOne(() => CategoryEntity, (category) => category.childPackages, {
  //  nullable: false,
  //  onDelete: 'CASCADE',
  //  onUpdate: 'CASCADE'
  //})
  //parentCategory: CategoryEntity;
}
