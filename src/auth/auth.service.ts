import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { WrongCredentials } from './errors/wrong-credentials.error';
import { EmailInUse } from './errors/email-in-use.error';
import { UserDto } from 'src/user/dto/user.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { authConfig } from './auth.config';
import bcrypt from 'bcrypt';
import { UsersRepository } from 'src/user/user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  USER_CREATED_EVENT_KEY,
  UserCreatedEvent,
} from './events/user-created.event';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private jwtService: JwtService,
    @Inject(authConfig.KEY)
    private auth: ConfigType<typeof authConfig>,
    private eventEmitter: EventEmitter2,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new WrongCredentials();

    const doesPasswordMatch = await bcrypt.compare(password, user.password);

    if (!doesPasswordMatch) throw new WrongCredentials();

    return this.generateAuthToken(user);
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findByEmail(createUserDto.email);

    if (user) throw new EmailInUse();

    const password = await bcrypt.hash(createUserDto.password, this.auth.salt);

    const userId = await this.userRepository.create({
      ...createUserDto,
      password,
    });

    if (!userId) throw new InternalServerErrorException();

    this.eventEmitter.emit(USER_CREATED_EVENT_KEY, {
      ...createUserDto,
      id: userId,
    } satisfies UserCreatedEvent);

    return {
      message: 'success',
    };
  }

  private generateAuthToken(user: UserDto) {
    const payload: JwtPayloadDto = {
      id: user.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      notBefore: '-15s',
      subject: user.id.toString(),
      issuer: this.auth.issuer,
    });

    return { accessToken };
  }
}
