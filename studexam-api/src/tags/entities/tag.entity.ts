import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TagEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    length: 100,
    unique: true
  })
  slug: string;

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
}