import { ComplaintStatus } from '@prisma/client';

export interface Attachment {
  filename: string;
  url: string;
}

export interface ComplaintWithRelations {
  id: string;
  fullName: string;
  email: string;
  branchId?: string;
  areaId?: string;
  observationType: string;
  detail: string;
  priority: string;
  status: ComplaintStatus;
  resolution?: string;
  attachments?: Attachment[];
  resolutionAttachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  branch?: {
    id: string;
    name: string;
  };
  area?: {
    id: string;
    name: string;
  };
}

export const generateComplaintStatusUpdateEmail = (
  complaint: ComplaintWithRelations,
  oldStatus: ComplaintStatus,
  newStatus: ComplaintStatus
): string => {
  const statusLabels = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Proceso',
    RESOLVED: 'Resuelta',
    REJECTED: 'Rechazada'
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'RESOLVED': return '#28a745';
      case 'IN_PROGRESS': return '#ffc107';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Actualización de Sugerencia</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0;">Hola ${complaint.fullName},</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Te informamos que tu sugerencia ha sido actualizada:
        </p>
        
        <div style="background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="font-weight: bold; color: #333;">ID de Sugerencia:</span>
            <span style="font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">${complaint.id}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="font-weight: bold; color: #333;">Sucursal:</span>
            <span style="color: #666;">${complaint.branch?.name || 'Todas las sucursales'}</span>
          </div>
          
          ${complaint.area ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="font-weight: bold; color: #333;">Área:</span>
            <span style="color: #666;">${complaint.area.name}</span>
          </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="font-weight: bold; color: #333;">Tipo:</span>
            <span style="color: #666;">${complaint.observationType}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="font-weight: bold; color: #333;">Estado Anterior:</span>
            <span style="background: #6c757d; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${statusLabels[oldStatus]}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: #333;">Nuevo Estado:</span>
            <span style="background: ${getStatusColor(newStatus)}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${statusLabels[newStatus]}</span>
          </div>
        </div>
        
        ${complaint.resolution ? `
          <div style="background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Resolución:</h3>
            <p style="color: #333; margin: 0;">${complaint.resolution}</p>
          </div>
        ` : ''}
        
        ${complaint.attachments && complaint.attachments.length > 0 ? `
          <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Imágenes adjuntas originales:</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
              ${complaint.attachments.map((attachment: Attachment) => `
                <div style="text-align: center;">
                  <img src="${attachment.url}" alt="${attachment.filename || 'Imagen'}" style="max-width: 100%; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                  <p style="font-size: 12px; color: #666; margin: 5px 0 0 0; word-break: break-all;">${attachment.filename || 'Imagen'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${complaint.resolutionAttachments && complaint.resolutionAttachments.length > 0 ? `
          <div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">Imágenes de resolución:</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
              ${complaint.resolutionAttachments.map((attachment: Attachment) => `
                <div style="text-align: center;">
                  <img src="${attachment.url}" alt="${attachment.filename || 'Imagen de resolución'}" style="max-width: 100%; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                  <p style="font-size: 12px; color: #666; margin: 5px 0 0 0; word-break: break-all;">${attachment.filename || 'Imagen de resolución'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Gracias por tu retroalimentación. Continuamos trabajando para mejorar nuestros servicios.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Este es un mensaje automático. Por favor no respondas a este correo.
          </p>
        </div>
      </div>
    </div>
  `;
};
