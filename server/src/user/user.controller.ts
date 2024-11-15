import { Controller, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Res, UseGuards, Get } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Response } from 'express'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { TokenService } from 'src/token/token.service'
import { User } from './entities/user.entity'
import { ConfigService } from '@nestjs/config'

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly configService: ConfigService
	) {}

	@Post()
	@UsePipes(new ValidationPipe())
	async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
		const { user, accessToken } = await this.userService.create(createUserDto)
		await this.tokenService.generateRefreshToken(user, res)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, createdAt, updatedAt, ...currentUser } = user as Partial<User>;
		return res.json( {user: currentUser, accessToken} )
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(+id, updateUserDto)
	}

	@Get('/verify/:link')
	async verifyMail(@Param('link') link: string, @Res() res: Response){
		await this.userService.verifyMail(link)
		res.redirect(this.configService.get<string>('CLIENT_URL'))
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	remove(@Param('id') id: string) {
		return this.userService.remove(+id)
	}
}
