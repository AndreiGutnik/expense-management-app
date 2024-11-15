import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import * as argon2 from "argon2"
import { TokenService } from 'src/token/token.service'
import { generateKey } from 'src/utils/generateKey'
import { MailService } from 'src/mail/mail.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private readonly tokenService: TokenService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService
	){}

	async create(createUserDto: CreateUserDto) {
		const existUser = await this.userRepository.findOne({
			where: {
				email: createUserDto.email,
			}
		})
		if(existUser) throw new BadRequestException('This email already exist')
		const verificationLink = generateKey()
		const newUser = await this.userRepository.save({
			email: createUserDto.email,
			password: await argon2.hash(createUserDto.password),
			verificationLink
		})

		await this.mailService.sendVerifyMail(
      createUserDto.email,
      `${this.configService.get<string>('API_URL')}/api/user/verify/${verificationLink}`
    )

		const accessToken = await this.tokenService.generateAccessToken(newUser);
		return {user: newUser, accessToken}
	}

	async verifyMail(verificationLink) {
    const user = await this.userRepository.findOne({
			where: {
				verificationLink
			}
		});
    if (!user) {
			throw new ConflictException('Verification link is not correct');
		}
		await this.userRepository.update(user.id, {
			verify: true,
			verificationLink: '',
		});
  }

	async findOne(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
			where: {
				email
			}
		})
  }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${id} user`
	}

	async remove(id: number) {
		const user = await this.userRepository.findOne({
			where: {id}
		})
		if(!user) throw new NotFoundException('User not found!')
    await this.userRepository.delete(id)
		return user
	}
}
