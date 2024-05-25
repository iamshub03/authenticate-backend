import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Spam } from './spam.entity';

@Entity('user_contacts')
export class UserContact {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (contact_of) => contact_of.id)
  @JoinColumn({ name: 'contact_of_id' })
  contact_of: User;

  @Column()
  name: string;

  @Column()
  phone: number;

  @OneToOne(() => Spam, (spam) => spam.user, { nullable: true })
  @JoinColumn({ name: 'spam_id' })
  spam: Spam;

  @Column({ default: 'user-contact' })
  type: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
