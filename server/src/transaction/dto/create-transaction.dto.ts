import { IsNotEmpty, IsNumber, IsOptional } from "class-validator"
import { Category } from "src/category/entities/category.entity"
import { User } from "src/user/entities/user.entity"

export class CreateTransactionDto {
	@IsNotEmpty()
	title: string

	@IsNotEmpty()
	@IsNumber()
	amount: number

	@IsNotEmpty()
	type: 'expense' | 'income'

	@IsNotEmpty()
	category: Category

	@IsOptional()
	user?: User
}
