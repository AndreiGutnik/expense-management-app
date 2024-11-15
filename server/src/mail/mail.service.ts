import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
	private transporter

	constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<string>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerifyMail(to: string, link: string) {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_USER'),
      to,
      subject: 'Account`s verification ' + this.configService.get<string>('API_URL'),
      text: '',
      html: `
				<div>
					<h1>Go to link for verification your e-mail</h1>
					<a href=${link}>${link}</a>
				</div>
			`,
    }

		await this.transporter.sendMail(mailOptions)
    console.log(`Activation email sent to ${to}`)
  }
}