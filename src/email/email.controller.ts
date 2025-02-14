import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';


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
  [key: string]: string
}


@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @UseGuards(AuthGuard)
  async sendEmail(@Body() emailDto: SendEmailDto) {
    try {
      await this.emailService.sendEmail(emailDto);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to send email', error: error.message };
    }
  }

  @Post('submit-form')
  async handleFormSubmission(@Body() formData: FormSubmissionDto) {
    try {
      await this.emailService.sendFormSubmissionNotification(formData);
      return { success: true, message: 'Form submission received and notification sent' };
    } catch (error) {
      return { success: false, message: 'Failed to process form submission', error: error.message };
    }
  }
}

