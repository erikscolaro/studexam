import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { TagEntity } from 'src/tags/entities/tag.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class PackageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    length: 255
  })
  name: string;

  @Column({
    type: "text",
    nullable: true
  })
  description: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: true
  })
  version: string;

  @Column({
    type: "boolean",
    default: true
  })
  isPublic: boolean;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP"
  })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: UserEntity;

  @Column()
  @Exclude()
  userId: string;

  @ManyToMany(() => TagEntity)
  @JoinTable({
    name: 'package_tags',
    joinColumn: { name: 'packageId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
  })
  tags: TagEntity[];

  // Computed properties for public exposure
  @Expose()
  get username(): string {
    return this.user?.username;
  }

  @Expose()
  get tagCount(): number {
    return this.tags?.length || 0;
  }
}