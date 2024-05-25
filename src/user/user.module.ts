import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserContact } from './entities/user-contact.entity';
import { Spam } from './entities/spam.entity';
import { UserSpam } from './entities/user-spam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserContact, Spam, UserSpam])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
