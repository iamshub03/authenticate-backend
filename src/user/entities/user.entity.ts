import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Spam } from './spam.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: number;

  @Column({ nullable: true })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Spam, (spam) => spam.user, { nullable: true })
  @JoinColumn({ name: 'spam_id' })
  spam: Spam;

  @Column({ default: 'user' })
  type: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
