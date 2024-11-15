
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Token {
	@PrimaryGeneratedColumn({name: 'token_id'})
	id: number

	@Column()
	refreshToken: string

	// @ManyToOne(()=>User, user=>user.categories)
	@OneToOne(()=>User, user=>user.token, { onDelete: 'CASCADE' })
	@JoinColumn({name: 'user_id'})
	user: User

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
