import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { Token } from './entities/token.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
		TypeOrmModule.forFeature([Token]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: ()=>({}),
			inject: [ConfigService]
		})
],
  providers: [TokenService],
  exports: [TokenService, TypeOrmModule]
})
export class TokenModule {}
