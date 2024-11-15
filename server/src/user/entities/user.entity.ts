import { Category } from "src/category/entities/category.entity";
import { Token } from "src/token/entities/token.entity";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	email: string

	@Column()
	password: string

	@Column({ default: false })
	verify: boolean

	@Column({ nullable: true })
	verificationLink: string

	@OneToMany(() => Category, category=>category.user, {onDelete: 'CASCADE'})
	categories: Category[]

	@OneToMany(()=>Transaction, transaction=>transaction.user, {onDelete: 'CASCADE'})
	transaction: Transaction[]

	@OneToOne(()=>Token, token=>token.user, {onDelete: 'CASCADE'})
	token: Token

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
