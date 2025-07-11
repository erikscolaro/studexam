import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CategoryEntity {
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
    nullable: true
  })
  description?: string;

  @Expose()
  @OneToMany(() => CategoryEntity, (category) => category.parentCategory)
  childCategories: CategoryEntity[];

  @Expose()
  @ManyToOne(() => CategoryEntity, (category) => category.childCategories, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  parentCategory: CategoryEntity;

  // disabled relationship with package entity
  //@Expose()
  //@OneToMany(
  //  ()=>PackageEntity,
  //  (packageEntity)=> packageEntity.parentCategory
  //)
  //childPackages: PackageEntity[];
}
