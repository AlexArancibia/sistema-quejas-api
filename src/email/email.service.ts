import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly adminEmail: string

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.adminEmail = this.configService.get("MAIL_USER", "admin@example.com")
  }

  async sendEmail(emailData: SendEmailDto) {
    const defaultSender = {
      name: this.configService.get("MAIL_FROM_NAME", "Nuestra Tienda"),
      address: this.configService.get("MAIL_FROM_ADDRESS", "contacto@example.com"),
    }

    const sender = {
      name: emailData.from?.name || defaultSender.name,
      address: emailData.from?.address || defaultSender.address,
    }

    // Obtener todos los emails para CC
    const ccEmails = await this.getCCEmails(emailData.metadata)

    try {
      const result = await this.mailerService.sendMail({
        from: sender,
        to: emailData.to,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        subject: emailData.subject,
        html: emailData.html,
      })
      console.log("Email enviado exitosamente:", result)
      console.log(`CCs enviados a: ${ccEmails.join(', ')}`)
      return result
    } catch (error) {
      console.error("Error al enviar email:", error)
      throw error
    }
  }

  private async getCCEmails(metadata?: SendEmailDto['metadata']): Promise<string[]> {
    const ccEmails: string[] = []

    try {
      // Siempre incluir supervisores
      const supervisorEmails = await this.getSupervisorEmails()
      ccEmails.push(...supervisorEmails)

      // Incluir managers del branch si están especificados en metadata
      if (metadata?.managers) {
        const managerEmails = metadata.managers
          .map(manager => manager.email)
          .filter(email => email && email.trim() !== '')
        ccEmails.push(...managerEmails)
      }

      // Si se especifica branchId pero no managers, buscar managers del branch
      if (metadata?.branchId && !metadata?.managers) {
        const branchManagerEmails = await this.getBranchManagerEmails(metadata.branchId)
        ccEmails.push(...branchManagerEmails)
      }

      // Remover duplicados y emails vacíos
      return [...new Set(ccEmails)].filter(email => email && email.trim() !== '')
    } catch (error) {
      console.error("Error al obtener emails para CC:", error)
      return []
    }
  }

  private async getSupervisorEmails(): Promise<string[]> {
    try {
      const supervisors = await this.prisma.user.findMany({
        where: {
          role: UserRole.SUPERVISOR,
          isActive: true,
          email: {
            not: null
          }
        },
        select: {
          email: true
        }
      })
      
      return supervisors
        .map(supervisor => supervisor.email)
        .filter((email): email is string => email !== null)
    } catch (error) {
      console.error("Error al obtener emails de supervisores:", error)
      return []
    }
  }

  private async getBranchManagerEmails(branchId: string): Promise<string[]> {
    try {
      const managers = await this.prisma.user.findMany({
        where: {
          role: UserRole.MANAGER,
          isActive: true,
          email: {
            not: null
          },
          branches: {
            some: {
              id: branchId
            }
          }
        },
        select: {
          email: true
        }
      })
      
      return managers
        .map(manager => manager.email)
        .filter((email): email is string => email !== null)
    } catch (error) {
      console.error("Error al obtener emails de managers del branch:", error)
      return []
    }
  }

  // Método de compatibilidad hacia atrás
  async sendEmailLegacy(options: {
    to: string
    subject: string
    html: string
    from?: { name?: string; address?: string }
    excludeSupervisors?: boolean
  }) {
    // Si excludeSupervisors es true, no incluir metadata para evitar CCs automáticos
    const emailData: SendEmailDto = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      from: options.from,
      metadata: options.excludeSupervisors ? undefined : {}
    }

    return this.sendEmail(emailData)
  }

  async sendFormSubmissionNotification(formData: Record<string, string>, customHtml?: string) {
    const htmlContent = customHtml || this.generateFormSubmissionEmailContent(formData)

    const emailData: SendEmailDto = {
      to: this.adminEmail,
      subject: "Nueva submisión de formulario",
      html: htmlContent,
      metadata: {
        type: 'status_update'
      }
    }

    return this.sendEmail(emailData)
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

  // Métodos helper para tipos específicos de correos

  async sendComplaintNotification(options: {
    to: string;
    subject: string;
    html: string;
    branchId: string;
    branchName?: string;
    complaintId: string;
    managers?: Array<{ id: string; name: string; email: string }>;
  }) {
    const emailData: SendEmailDto = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      metadata: {
        branchId: options.branchId,
        branchName: options.branchName,
        managers: options.managers,
        type: 'complaint',
        entityId: options.complaintId
      }
    }

    return this.sendEmail(emailData)
  }

  async sendRatingNotification(options: {
    to: string;
    subject: string;
    html: string;
    branchId: string;
    branchName?: string;
    ratingId: string;
    managers?: Array<{ id: string; name: string; email: string }>;
  }) {
    const emailData: SendEmailDto = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      metadata: {
        branchId: options.branchId,
        branchName: options.branchName,
        managers: options.managers,
        type: 'rating',
        entityId: options.ratingId
      }
    }

    return this.sendEmail(emailData)
  }

  async sendStatusUpdateNotification(options: {
    to: string;
    subject: string;
    html: string;
    branchId?: string;
    branchName?: string;
    entityId?: string;
    managers?: Array<{ id: string; name: string; email: string }>;
  }) {
    const emailData: SendEmailDto = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      metadata: {
        branchId: options.branchId,
        branchName: options.branchName,
        managers: options.managers,
        type: 'status_update',
        entityId: options.entityId
      }
    }

    return this.sendEmail(emailData)
  }
}
