import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TokenModule } from 'src/token/token.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		TokenModule,
		MailModule
	],
  controllers: [UserController],
  providers: [UserService],
	exports: [UserService]
})
export class UserModule {}
