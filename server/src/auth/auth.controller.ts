import { Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenService } from 'src/token/token.service';
import { Request, Response } from 'express'
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokenService
	){}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	async login(@Req() req, @Res() res: Response) {
		const { user, accessToken } = await this.authService.login(req.user);
		await this.tokenService.generateRefreshToken(user, res);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, createdAt, updatedAt, ...currentUser } = user as Partial<User>;
		return res.json({ user: currentUser, accessToken })
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	getProfile(@Req() req) {
		return req.user;
	}

	@Post('refresh')
	@UseGuards(JwtAuthGuard)
	async refreshToken(@Req() req: Request, @Res() res: Response) {
			const {user, cookies} = req
			const refreshToken = cookies.refreshToken


			if (!refreshToken) {
					throw new UnauthorizedException('Refresh token is missing');
			}

			const userData = await this.tokenService.verifyRefreshToken(refreshToken);

			if (!userData) {
				throw new UnauthorizedException('Invalid refresh token');  }

			const accessToken = await this.tokenService.refreshToken(refreshToken);
			await this.tokenService.generateRefreshToken(userData, res);
			return res.json({ user, accessToken });
	}
}
