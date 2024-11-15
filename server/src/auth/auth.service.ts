import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as argon2 from "argon2"
import { IUser } from 'src/types/types';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
	constructor(
    private userService: UserService,
		private readonly tokenService: TokenService
  ) {}

	async validateUser(email: string, password: string): Promise<any> {
		const user = await this.userService.findOne(email);
		const passwordIsMatch = await argon2.verify(user.password, password)
		if (user && passwordIsMatch) {
			return user
		}
		throw new BadRequestException('User or password are incorrect!')
	}

	async login(user: IUser) {
		const accessToken = await this.tokenService.generateAccessToken(user)
    return { user, accessToken }
  }
}
