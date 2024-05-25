import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Res() res: Response, @Body() loginData: LoginDTO) {
    try {
      const response = await this.authService.login(
        loginData.phone,
        loginData.password,
      );

      if (response.success) {
        res.statusCode = 200;
        res.send({
          success: true,
          data: {
            access_token: response.access_token,
          },
        });
      } else {
        res.statusCode = 401;
        res.send({
          success: false,
          message: response.message,
        });
      }
    } catch (error) {
      res.statusCode = 500;
      res.send({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
