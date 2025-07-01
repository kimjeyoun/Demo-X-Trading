import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Controller('auth')
export class UsersController {
  // readonly 키워드 추가
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  // 함수의 반환 타입을 명시적으로 선언
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    // async/await를 사용하여 서비스의 비동기 작업이 완료되기를 기다립니다.
    const user = await this.usersService.create(createUserDto);
    return user;
  }
}
