/**
 * ClientTopic Entity
 * Stores mapping between Telegram users and their corresponding forum topics
 */

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ClientTopic {
  @PrimaryColumn("bigint", { unique: true })
  userId!: number;

  @Column("varchar")
  username!: string;

  @Column("varchar")
  firstName!: string;

  @Column("int")
  topicId!: number;

  @Column("text")
  topicName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

