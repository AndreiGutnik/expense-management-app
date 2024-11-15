import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/types/types';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
	constructor(
		@InjectRepository(Token)
		private readonly tokenRepository: Repository<Token>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	){}

	async generateAccessToken(user: IUser) {
    const payload = { email: user.email, id: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    return accessToken;
  }

  async generateRefreshToken(user: IUser, res: any) {
    const payload = { email: user.email, id: user.id };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
    // Сохранение refresh token в HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,       // Запрещает доступ к кукам из JavaScript
      // secure: true,         // Включает работу только через HTTPS (уберите, если тестируете локально)
      sameSite: 'strict',   // Политика использования куки
      maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 дней
    });

		const existingToken = await this.tokenRepository.findOne({
      where: {
				user: { id: user.id }
			}
    });

		if (existingToken) {
			existingToken.refreshToken = refreshToken;
			await this.tokenRepository.save(existingToken);
		} else {
			const newToken = this.tokenRepository.create({
				user: { id: user.id },
				refreshToken,
			});
			await this.tokenRepository.save(newToken);
		}

    return refreshToken;
  }

	async refreshToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing');
    }

    const payload = await this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    })

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateAccessToken({ email: payload.email, id: payload.id });
  }

	async verifyRefreshToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
      return this.jwtService.verify(token, { secret });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

}
