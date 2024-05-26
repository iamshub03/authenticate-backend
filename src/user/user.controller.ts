import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { UserGuard } from 'src/auth/user.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { MarkSpamDTO } from './dto/mark-spam.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const response = await this.userService.register(createUserDto);
    res.statusCode = response.code;
    res.send({
      success: response.success,
      message: response.message,
    });
  }

  @UseGuards(UserGuard)
  @ApiOperation({
    security: [
      {
        bearerAuth: [],
      },
    ],
  })
  @Post('mark-spam')
  async markSpam(@Req() req, @Res() res: Response, @Body() data: MarkSpamDTO) {
    const response = await this.userService.markSpam(req.user.id, data);

    if (response.success) {
      res.statusCode = 200;
      res.send({
        success: response.success,
        message: response.message,
      });
    } else {
      res.statusCode = 200;
      res.send({
        success: response.success,
        message: response.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @ApiOperation({
    security: [
      {
        bearerAuth: [],
      },
    ],
  })
  @ApiQuery({
    name: 'search',
  })
  @Get('search-name')
  async searchByName(
    @Req() req,
    @Res() res: Response,
    @Query('search') search: string,
  ) {
    const response = await this.userService.searchByName(search, req.user.id);

    if (response.success) {
      res.statusCode = response.code;
      res.send({
        success: response.success,
        data: response.data,
      });
    } else {
      res.statusCode = response.code;
      res.send({
        success: response.success,
        message: response.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @ApiOperation({
    security: [
      {
        bearerAuth: [],
      },
    ],
  })
  @ApiQuery({
    name: 'phone',
  })
  @Get('search-phone')
  async searchByPhone(
    @Req() req,
    @Res() res: Response,
    @Query('phone') phone: string,
  ) {
    const response = await this.userService.searchByPhone(+phone, req.user.id);

    if (response.success) {
      res.statusCode = response.code;
      res.send({
        success: response.success,
        data: response.data,
      });
    } else {
      res.statusCode = response.code;
      res.send({
        success: response.success,
        message: response.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @ApiOperation({
    security: [
      {
        bearerAuth: [],
      },
    ],
  })
  @ApiQuery({
    name: 'id',
  })
  @ApiQuery({
    name: 'type',
  })
  @Get('search-phone-details')
  async searchByPhoneDetails(
    @Req() req,
    @Res() res: Response,
    @Query('id') id: string,
    @Query('type') type: 'user' | 'user-contact',
  ) {
    const response = await this.userService.searchByPhoneDetails(
      +id,
      type,
      req.user.id,
    );

    if (response.success) {
      res.statusCode = response.code;
      res.send({
        success: response.success,
        data: response.data,
      });
    } else {
      res.statusCode = response.code;
      res.send({
        success: response.success,
        message: response.message,
      });
    }
  }
}
