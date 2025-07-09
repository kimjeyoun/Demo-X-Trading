import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { WalletsService } from '../wallets/wallets.service';
import * as bcrypt from 'bcrypt';

// 서비스 메소드의 반환 타입을 명시적으로 정의 (비밀번호 제외)
type UserWithoutPassword = Omit<User, 'password'>;

// inject : 주입하다.
@Injectable()
export class UsersService {
  constructor(
    // Repository의 제네릭 타입으로 User를 명시
    @InjectRepository(User)
    // usersRepository는 데이터베이스의 users 테이블과 직접적으로 소통하는 객체
    private readonly usersRepository: Repository<User>,
    private readonly walletsService: WalletsService,
  ) {}

  /**
   * 새로운 사용자를 생성하고 데이터베이스에 저장합니다.
   * @param createUserDto 사용자 생성을 위한 데이터 전송 객체
   * @returns 생성된 사용자 정보 (비밀번호 제외)
   */
  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { email, password, nickname } = createUserDto;

    // 1. 이메일 중복 확인
    // findOne은 User | null 타입을 반환하므로 타입이 안전합니다.
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 2. 비밀번호 암호화
    // bcrypt.hash는 string을 반환하므로 타입이 안전합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 새로운 사용자 엔티티 생성
    // create 메소드는 User 엔티티의 인스턴스를 생성합니다.
    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });

    try {
      // 4. 데이터베이스에 저장
      // save의 결과는 저장된 엔티티입니다. user.entity.ts에서 password에 select: false를
      // 설정했더라도, save 직후의 반환값에는 password가 포함될 수 있습니다.
      // 하지만 우리가 정의한 반환 타입(UserWithoutPassword) 덕분에 최종 반환 시에는
      // password가 자동으로 제외(타입 체크)됩니다.
      const savedUser = await this.usersRepository.save(newUser);

      // 사용자 생성 후, 해당 사용자의 지갑을 생성합니다.
      await this.walletsService.createWallet(savedUser);

      // 반환하기 전에 명시적으로 password를 제거해주는 것이 가장 안전하고 확실합니다.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = savedUser;

      return result;
    } catch (error) {
      // DB 관련 에러(예: 유니크 제약조건 이중 체크) 등 모든 예외 상황 처리
      // error 변수의 타입을 명시적으로 unknown으로 다루는 것이 안전합니다.
      if (error instanceof Error) {
        console.error('사용자 생성 중 오류 발생:', error.message);
      } else {
        console.error('알 수 없는 오류 발생:', error);
      }
      throw new InternalServerErrorException(
        '사용자를 생성하는 동안 오류가 발생했습니다. 다시 시도해 주세요.',
      );
    }
  }

  /**
   * ID를 기준으로 사용자를 찾습니다.
   * @param id 사용자 ID (UUID)
   * @returns 사용자 엔티티 또는 찾지 못한 경우 null
   */
  async findById(id: string): Promise<User | null> {
    // findOneBy는 주어진 조건에 맞는 첫 번째 엔티티를 찾거나, 없으면 null을 반환합니다.
    // 타입-세이프하며 매우 직관적입니다.
    return this.usersRepository.findOneBy({ id });
  }

  /**
   * 이메일을 기준으로 사용자를 찾습니다. (로그인 검증 시 필요)
   * 이 메소드는 비밀번호를 포함하여 반환해야 합니다.
   * @param email 사용자 이메일
   * @returns 비밀번호를 포함한 사용자 엔티티 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    // TypeORM의 QueryBuilder를 사용하여 select: false 옵션을 무시하고
    // password 필드를 명시적으로 선택합니다.
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') // select: false로 숨겨진 password 필드를 선택
      .getOne();
  }
}
