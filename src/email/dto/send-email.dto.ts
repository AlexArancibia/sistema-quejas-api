export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  from?: {
    name?: string;
    address?: string;
  };
  metadata?: {
    branchId?: string;
    branchName?: string;
    managers?: Array<{
      id: string;
      name: string;
      email: string;
    }>;
    type?: 'complaint' | 'rating' | 'status_update';
    entityId?: string;
  };
} 