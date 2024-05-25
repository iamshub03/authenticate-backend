import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(
    phone: number,
    password: string,
  ): Promise<{ success: boolean; access_token?: string; message?: string }> {
    const user = await this.userService.findOne(phone);

    if (user?.id) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return {
          success: false,
          message: 'Incorrect password. Please check and try again!',
        };
      }

      return {
        success: true,
        access_token: await this.jwtService.signAsync({
          id: user.id,
        }),
      };
    } else {
      return {
        success: false,
        message: 'User does not exist. Please check your number.',
      };
    }
  }
}
