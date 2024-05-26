import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { UserContact } from './user-contact.entity';

@Entity('spams')
export class Spam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: number;

  @Column({ default: 0 })
  spam_count: number;

  @OneToOne(() => User, (user) => user.spam, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => UserContact, (user_contact) => user_contact.spam, {
    nullable: true,
  })
  @JoinColumn({ name: 'user_contact_id' })
  user_contact: UserContact;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;
}
