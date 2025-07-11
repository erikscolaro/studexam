import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from 'src/users/entities/user.entity';
import { PackageEntity } from 'src/packages/entities/package.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TagEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  slug: string;

  @Exclude()
  @Column({
    type: 'timestamptz',
  })
  created_at: Date;

  @Exclude()
  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  author: UserEntity;

  @Exclude()
  @Column({
    type: 'boolean',
    default: true,
  })
  active: boolean;

  @Exclude()
  @ManyToMany(() => PackageEntity, (pkg) => pkg.tags)
  packages: PackageEntity[];
}
