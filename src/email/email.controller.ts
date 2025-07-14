import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PublicKeyGuard } from 'src/auth/guards/public.guard';


class SendEmailDto {
  to: string
  subject: string
  html: string
  from?: {
    name?: string
    address?: string
  }
}

class FormSubmissionDto {
  html?: string
  [key: string]: string | undefined // permite cualquier otro campo además de html
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @UseGuards(PublicKeyGuard)
  async sendEmail(@Body() emailDto: SendEmailDto) {
    try {
      await this.emailService.sendEmail(emailDto);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to send email', error: error.message };
    }
  }
  @UseGuards(PublicKeyGuard)
  @Post('submit-form')
  async handleFormSubmission(@Body() formData: FormSubmissionDto) {
    try {
      const { html, ...data } = formData
      await this.emailService.sendFormSubmissionNotification(data, html)
      return { success: true, message: 'Form submission received and notification sent' }
    } catch (error) {
      return { success: false, message: 'Failed to process form submission', error: error.message }
    }
  }
}

