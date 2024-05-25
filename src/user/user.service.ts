import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Like, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { MarkSpamDTO } from './dto/mark-spam.dto';
import { Spam } from './entities/spam.entity';
import { UserContact } from './entities/user-contact.entity';
import { User } from './entities/user.entity';
import { UserSpam } from './entities/user-spam.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(UserContact)
    private userContactsRepository: Repository<UserContact>,

    @InjectRepository(Spam)
    private spamsRepository: Repository<Spam>,

    @InjectRepository(UserSpam)
    private userSpamsRepository: Repository<UserSpam>,
  ) {}

  private readonly saltRounds = 10;

  async register(createUserDto: CreateUserDto) {
    const userExists = await this.usersRepository.findOne({
      where: {
        phone: createUserDto.phone,
      },
    });

    if (userExists) {
      return {
        success: false,
        message: 'User with same phone already exits',
        code: 409,
      };
    }

    //CHECK IF PRESENT IN SPAM
    const spamPresent = await this.spamsRepository.findOne({
      where: {
        phone: createUserDto.phone,
      },
      select: {
        id: true,
      },
    });

    const hashPassword = await this.hashPassword(createUserDto.password);

    const createUser = this.usersRepository.create({
      ...createUserDto,
      password: hashPassword,
      ...(spamPresent && {
        spam: {
          id: spamPresent.id,
        },
      }),
    });

    const saveUser = await this.usersRepository.save(createUser);

    if (saveUser?.id) {
      //ADD USER IN SPAM IF SPAM EXISTS
      if (spamPresent) {
        await this.spamsRepository.update(
          {
            id: spamPresent.id,
          },
          {
            user: { id: saveUser.id },
          },
        );
      }

      return {
        success: true,
        message: 'User registered successfully',
        code: 201,
      };
    } else {
      return {
        success: false,
        message: 'User was not saved. Please check logs for more info',
        code: 500,
      };
    }
  }

  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return hashedPassword;
  }

  async comparePassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isMatch;
  }

  async findOne(phone: number) {
    return await this.usersRepository.findOne({
      where: {
        phone: phone,
      },
    });
  }

  async markSpam(userId: number, spamData: MarkSpamDTO) {
    const spamExists = await this.spamsRepository.findOne({
      where: {
        phone: spamData.phone,
      },
    });

    if (spamExists) {
      //CHECK IF ALREADY MARKED SPAM
      const spamMarked = await this.userSpamsRepository.findOne({
        where: {
          user: {
            id: userId,
          },
          spam: {
            id: spamExists.id,
          },
        },
      });

      if (spamMarked) {
        return {
          success: false,
          code: 404,
          message: 'You have already marked this user as spam.',
        };
      }
      const update = await this.spamsRepository.update(
        {
          id: spamExists.id,
        },
        {
          spam_count: spamExists.spam_count + 1,
        },
      );

      return {
        success: true,
        message: 'Number marked as spam successfully',
      };
    } else {
      //FIND PHONE IN USERS TABLE
      const userPresent = await this.usersRepository.findOne({
        where: {
          phone: spamData.phone,
        },
        select: {
          id: true,
        },
      });

      let userContact: UserContact;

      if (!userPresent) {
        userContact = await this.userContactsRepository.findOne({
          where: {
            phone: spamData.phone,
          },
          select: {
            id: true,
          },
        });
      }

      const spamCreate = this.spamsRepository.create({
        phone: spamData.phone,
        spam_count: 1,
        ...(userPresent && {
          user: {
            id: userPresent.id,
          },
        }),
        ...(userContact && {
          user_contact: {
            id: userContact.id,
          },
        }),
      });

      const save = await this.spamsRepository.save(spamCreate);

      if (userPresent) {
        await this.usersRepository.update(
          {
            id: userPresent.id,
          },
          {
            spam: {
              id: save.id,
            },
          },
        );
      } else if (userContact) {
        await this.userContactsRepository.update(
          {
            id: userContact.id,
          },
          {
            spam: {
              id: save.id,
            },
          },
        );
      }

      const createUserSpam = this.userSpamsRepository.create({
        user: { id: userId },
        spam: { id: save.id },
      });

      const saveUserSpam = await this.userSpamsRepository.save(createUserSpam);

      return {
        success: true,
        message: 'Number marked as spam successfully',
      };
    }
  }

  async searchByName(search: string) {
    const userStarts = await this.usersRepository.find({
      relations: ['spam'],
      where: { name: Like(`${search}%`) },
      select: {
        id: true,
        name: true,
        phone: true,
        type: true,
        spam: {
          spam_count: true,
        },
      },
    });

    let userStartIds: number[] = [];

    if (userStarts.length > 0) {
      userStartIds = userStarts.map((user) => user.id);
    }

    const userContains = await this.usersRepository.find({
      where: {
        name: Like(`%${search}%`),
        ...(userStartIds.length && { id: Not(In(userStartIds)) }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        type: true,
        spam: {
          spam_count: true,
        },
      },
    });

    const users = [...userStarts, ...userContains];

    const userPhones = users.map((user) => user.phone);

    const userContactStarts = await this.userContactsRepository.find({
      relations: ['spam'],
      where: { name: Like(`${search}%`), phone: Not(In(userPhones)) },
      select: {
        id: true,
        name: true,
        phone: true,
        type: true,
        spam: {
          spam_count: true,
        },
      },
    });

    let userContactStartIds: number[] = [];

    if (userContactStarts.length > 0) {
      userContactStartIds = userContactStarts.map((user) => user.id);
    }

    const userContactContains = await this.userContactsRepository.find({
      where: {
        name: Like(`%${search}%`),
        ...(userContactStartIds.length && { id: Not(In(userContactStartIds)) }),
        phone: Not(In(userPhones)),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        type: true,
        spam: {
          spam_count: true,
        },
      },
    });

    const response = [
      ...userStarts,
      ...userContactStarts,
      ...userContains,
      ...userContactContains,
    ];

    if (response.length > 0) {
      return {
        success: true,
        code: 200,
        data: response,
      };
    } else {
      return {
        success: false,
        code: 404,
        message: 'No user prenset',
      };
    }
  }

  async searchByPhone(phone: number) {
    //CHECK IF REGISTERED
    const user = await this.usersRepository.findOne({
      where: {
        phone: phone,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        type: true,
      },
    });

    if (user) {
      return {
        success: true,
        code: 200,
        data: user,
      };
    } else {
      const userContacts = await this.userContactsRepository.find({
        where: {
          phone: phone,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          type: true,
        },
      });

      if (userContacts.length > 0) {
        return {
          success: true,
          code: 200,
          data: userContacts,
        };
      } else {
        return {
          success: false,
          code: 404,
          message: 'No user found',
        };
      }
    }
  }

  async searchByPhoneDetails(
    id: number,
    type: 'user' | 'user-contact',
    userId: number,
  ) {
    if (type === 'user') {
      const person = await this.usersRepository.findOne({
        relations: ['spam'],
        where: { id },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          type: true,
          spam: {
            spam_count: true,
          },
        },
      });

      if (person) {
        const user = await this.usersRepository.findOne({
          where: {
            id: userId,
          },
          select: {
            id: true,
            phone: true,
          },
        });

        const personsContact = await this.userContactsRepository.findOne({
          where: {
            phone: user.phone,
            contact_of: {
              id: person.id,
            },
          },
          select: {
            id: true,
          },
        });

        return {
          success: true,
          code: 200,
          data: {
            id: person.id,
            name: person.name,
            phone: person.phone,
            ...(personsContact && { email: person.email }),
            type: person.type,
            spam_count: person.spam?.spam_count ? person.spam.spam_count : 0,
          },
        };
      } else {
        return {
          success: false,
          code: 404,
          message: 'Invalid user id sent',
        };
      }
    } else {
      const userContact = await this.userContactsRepository.findOne({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          type: true,
          spam: {
            spam_count: true,
          },
        },
      });

      if (userContact) {
        return {
          success: true,
          code: 200,
          data: userContact,
        };
      } else {
        return {
          success: false,
          code: 404,
          message: 'Invalid user id sent',
        };
      }
    }
  }
}
