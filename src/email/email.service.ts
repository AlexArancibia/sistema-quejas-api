import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {private readonly adminEmail: string

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail = this.configService.get("MAIL_USER", "admin@example.com")
  }

  async sendEmail(options: {
    to: string
    subject: string
    html: string
    from?: { name?: string; address?: string }
  }) {
    const defaultSender = {
      name: this.configService.get("MAIL_FROM_NAME", "Nuestra Tienda"),
      address: this.configService.get("MAIL_FROM_ADDRESS", "contacto@example.com"),
    }

    const sender = {
      name: options.from?.name || defaultSender.name,
      address: options.from?.address || defaultSender.address,
    }

    try {
      const result = await this.mailerService.sendMail({
        from: sender,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      console.log("Email enviado exitosamente:", result)
      return result
    } catch (error) {
      console.error("Error al enviar email:", error)
      throw error
    }
  }

  async sendFormSubmissionNotification(formData: Record<string, string>, customHtml?: string) {
  const htmlContent = customHtml || this.generateFormSubmissionEmailContent(formData)

  await this.sendEmail({
    to: this.adminEmail,
    subject: "Nueva submisión de formulario",
    html: htmlContent,
  })
}

  private generateFormSubmissionEmailContent(formData: Record<string, string>): string {
    const formContent = Object.entries(formData)
      .map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`)
      .join("")

    return `
      <html>
        <body>
          <h1>Nueva submisión de formulario</h1>
          <table>
            <tbody>
              ${formContent}
            </tbody>
          </table>
        </body>
      </html>
    `
  }
}
