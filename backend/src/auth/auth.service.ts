import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DevLoginDto, LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('이미 가입된 이메일입니다.');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        nickname: dto.nickname,
        passwordHash: this.hashPassword(dto.password),
      },
    });
    return this.issueToken(user.id, user.email, user.nickname);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    return this.issueToken(user.id, user.email, user.nickname);
  }

  async devLogin(dto: DevLoginDto) {
    const rawId = dto.deviceId?.trim() || 'local-device';
    const suffix = createHash('sha1').update(rawId).digest('hex').slice(0, 10);
    const email = `dev-${suffix}@tripick.local`;
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        nickname: 'TRIPICK 로컬 사용자',
        passwordHash: this.hashPassword(randomBytes(12).toString('hex')),
      },
    });
    return this.issueToken(user.id, user.email, user.nickname);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nickname: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    return user;
  }

  private issueToken(id: string, email: string, nickname: string) {
    return {
      accessToken: this.jwtService.sign({ sub: id, email }),
      user: { id, email, nickname },
    };
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const incoming = pbkdf2Sync(password, salt, 120000, 32, 'sha256');
    const expected = Buffer.from(hash, 'hex');
    return incoming.length === expected.length && timingSafeEqual(incoming, expected);
  }
}
