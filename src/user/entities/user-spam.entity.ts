import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Spam } from './spam.entity';
import { User } from './user.entity';

@Entity('user-spams')
export class UserSpam {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Spam, (spam) => spam.id)
  @JoinColumn({ name: 'spam_id' })
  spam: Spam;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
