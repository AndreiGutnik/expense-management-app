import { IsNotEmpty, IsOptional } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreateTokenDto {
	@IsNotEmpty()
	refreshToken: string

	@IsOptional()
	user?: User
}
