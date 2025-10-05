import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateComplaintDto } from "./dto/create-complaint.dto"
import { UpdateComplaintDto } from "./dto/update-complaint.dto"
import { ComplaintPriority, ComplaintStatus } from "@prisma/client"
import { EmailService } from "../email/email.service"
import { generateComplaintStatusUpdateEmail, ComplaintWithRelations } from "../email/email-templates"

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(createComplaintDto: CreateComplaintDto) {
    try {
      // Verificar que la sucursal existe solo si se proporciona branchId
      if (createComplaintDto.branchId) {
        const branchExists = await this.prisma.branch.findUnique({
          where: { id: createComplaintDto.branchId },
        })

        if (!branchExists) {
          throw new NotFoundException(`Branch with ID ${createComplaintDto.branchId} not found`)
        }
      }

      const complaint = await this.prisma.complaint.create({
        data: {
          fullName: createComplaintDto.fullName,
          email: createComplaintDto.email,
          branchId: createComplaintDto.branchId || null,
          areaId: createComplaintDto.areaId || null,
          observationType: createComplaintDto.observationType,
          detail: createComplaintDto.detail,
          priority: createComplaintDto.priority,
          attachments: createComplaintDto.attachments || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return complaint
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error creating complaint: " + error.message)
    }
  }

  async findAll(branchId?: string, areaId?: string, status?: ComplaintStatus, priority?: ComplaintPriority, startDate?: string, endDate?: string, page = 1, limit = 10, userRole?: string) {
    try {
      const where: any = {}

      if (branchId) {
        where.branchId = branchId
      } else if (userRole === 'MANAGER') {
        // Los managers solo pueden ver quejas de su sucursal, no quejas sin sucursal
        where.branchId = { not: null }
      }

      if (areaId) {
        where.areaId = areaId
      }

      if (status) {
        where.status = status
      }

      if (priority) {
        where.priority = priority
      }

      // Filtro por rango de fechas
      if (startDate || endDate) {
        where.createdAt = {}
        
        if (startDate) {
          where.createdAt.gte = new Date(startDate)
        }
        
        if (endDate) {
          // Agregar 23:59:59.999 para incluir todo el día final
          const endDateTime = new Date(endDate)
          endDateTime.setHours(23, 59, 59, 999)
          where.createdAt.lte = endDateTime
        }
      }

      const skip = (page - 1) * limit

      const [complaints, total] = await Promise.all([
        this.prisma.complaint.findMany({
          where,
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
            area: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        this.prisma.complaint.count({ where }),
      ])

      return {
        data: complaints,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new InternalServerErrorException("Error fetching complaints: " + error.message)
    }
  }

  async getStats(branchId?: string, startDate?: string, endDate?: string) {
    try {
      const where: any = branchId ? { branchId } : {}

      // Filtro por rango de fechas
      if (startDate || endDate) {
        where.createdAt = {}
        
        if (startDate) {
          where.createdAt.gte = new Date(startDate)
        }
        
        if (endDate) {
          // Agregar 23:59:59.999 para incluir todo el día final
          const endDateTime = new Date(endDate)
          endDateTime.setHours(23, 59, 59, 999)
          where.createdAt.lte = endDateTime
        }
      }

      const [
        totalComplaints,
        pendingComplaints,
        inProcessComplaints,
        resolvedComplaints,
        rejectedComplaints,
        highPriorityComplaints,
        mediumPriorityComplaints,
        lowPriorityComplaints,
      ] = await Promise.all([
        this.prisma.complaint.count({ where }),
        this.prisma.complaint.count({ where: { ...where, status: "PENDING" } }),
        this.prisma.complaint.count({ where: { ...where, status: "IN_PROGRESS" } }),
        this.prisma.complaint.count({ where: { ...where, status: "RESOLVED" } }),
        this.prisma.complaint.count({ where: { ...where, status: "REJECTED" } }),
        this.prisma.complaint.count({ where: { ...where, priority: "HIGH" } }),
        this.prisma.complaint.count({ where: { ...where, priority: "MEDIUM" } }),
        this.prisma.complaint.count({ where: { ...where, priority: "LOW" } }),
      ])

      return {
        total: totalComplaints,
        byStatus: {
          pending: pendingComplaints,
          inProcess: inProcessComplaints,
          resolved: resolvedComplaints,
          rejected: rejectedComplaints,
        },
        byPriority: {
          high: highPriorityComplaints,
          medium: mediumPriorityComplaints,
          low: lowPriorityComplaints,
        },
        resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
      }
    } catch (error) {
      throw new InternalServerErrorException("Error fetching complaint stats: " + error.message)
    }
  }

  async findOne(id: string) {
    try {
      const complaint = await this.prisma.complaint.findUnique({
        where: { id },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
            },
          },
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!complaint) {
        throw new NotFoundException(`Complaint with ID ${id} not found`)
      }

      return complaint
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error fetching complaint: " + error.message)
    }
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto) {
    try {
      // Obtener la queja actual para comparar el estado
      const currentComplaint = await this.prisma.complaint.findUnique({
        where: { id },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!currentComplaint) {
        throw new NotFoundException(`Complaint with ID ${id} not found`);
      }

      const updatedComplaint = await this.prisma.complaint.update({
        where: { id },
        data: {
          ...updateComplaintDto,
          updatedAt: new Date(),
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Verificar si el estado cambió y enviar email de notificación
      if (updateComplaintDto.status && currentComplaint.status !== updateComplaintDto.status) {
        console.log(`📧 Estado de queja ${id} cambió de ${currentComplaint.status} a ${updateComplaintDto.status}`);
        
        try {
          // Transformar el complaint para que sea compatible con ComplaintWithRelations
          const complaintForEmail: ComplaintWithRelations = {
            ...updatedComplaint,
            attachments: Array.isArray(updatedComplaint.attachments) ? updatedComplaint.attachments as any[] : [],
            resolutionAttachments: Array.isArray(updatedComplaint.resolutionAttachments) ? updatedComplaint.resolutionAttachments as any[] : [],
          };
          
          await this.sendStatusChangeEmail(complaintForEmail, currentComplaint.status, updateComplaintDto.status);
        } catch (emailError) {
          console.error('❌ Error enviando email de cambio de estado:', emailError);
          // No lanzamos el error para no interrumpir la actualización
        }
      }

      return updatedComplaint;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === "P2025") {
        throw new NotFoundException(`Complaint with ID ${id} not found`);
      }
      throw new InternalServerErrorException("Error updating complaint: " + error.message);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.complaint.delete({
        where: { id },
      })

      return { message: "Complaint deleted successfully" }
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Complaint with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error deleting complaint: " + error.message)
    }
  }

  private async sendStatusChangeEmail(complaint: ComplaintWithRelations, oldStatus: ComplaintStatus, newStatus: ComplaintStatus) {
    try {
      console.log('📧 ENVIANDO EMAIL DE CAMBIO DE ESTADO');
      console.log('📋 Datos de la queja:', {
        id: complaint.id,
        fullName: complaint.fullName,
        email: complaint.email,
        branchId: complaint.branchId,
        branchName: complaint.branch?.name || 'Todas las sucursales',
        oldStatus,
        newStatus,
        attachments: complaint.attachments,
        resolutionAttachments: complaint.resolutionAttachments
      });

      // Generar HTML del email usando el template
      const emailHtml = generateComplaintStatusUpdateEmail(complaint, oldStatus, newStatus);

      // Obtener metadata para determinar destinatarios
      let metadata;
      if (complaint.branchId) {
        // Queja específica de sucursal - obtener managers de la sucursal
        const branchManagers = await this.getBranchManagers(complaint.branchId);
        metadata = {
          branchId: complaint.branchId,
          branchName: complaint.branch?.name || 'Local',
          managers: branchManagers,
          type: 'status_update' as const,
          entityId: complaint.id
        };
      } else {
        // Queja general - obtener supervisores y administradores
        const supervisorsAndAdmins = await this.getSupervisorsAndAdmins();
        metadata = {
          branchName: 'Todas las sucursales',
          managers: supervisorsAndAdmins,
          type: 'status_update' as const,
          entityId: complaint.id
        };
      }

      console.log('📊 Metadata para cambio de estado:', {
        branchId: metadata.branchId,
        branchName: metadata.branchName,
        managersCount: metadata.managers?.length || 0,
        managers: metadata.managers?.map(m => ({ name: m.name, email: m.email })) || []
      });

      // Enviar email
      await this.emailService.sendEmail({
        to: complaint.email,
        subject: `🔄 Actualización de Sugerencia - ID: ${complaint.id}`,
        html: emailHtml,
        from: {
          name: 'Sistema de Sugerencias',
          address: 'noreply@siclo.com'
        },
        metadata
      });

      console.log('✅ Email de cambio de estado enviado exitosamente');
      console.log('📬 Destinatario principal:', complaint.email);
      console.log('👥 Copias enviadas a:', metadata.managers?.map(m => `${m.name} (${m.email})`).join(', ') || 'Ninguna');
      console.log('🏢 Sucursal:', metadata.branchName);
      console.log('📝 Motivo: Cambio de estado de sugerencia');

    } catch (error) {
      console.error('❌ Error en sendStatusChangeEmail:', error);
      throw error;
    }
  }

  private async getBranchManagers(branchId: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          role: 'MANAGER',
          branches: {
            some: {
              id: branchId
            }
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });

      return users.map(user => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Manager',
        email: user.email
      }));
    } catch (error) {
      console.error('Error obteniendo managers del branch:', error);
      return [];
    }
  }

  private async getSupervisorsAndAdmins() {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          role: {
            in: ['SUPERVISOR', 'ADMIN']
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      });

      return users.map(user => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
        email: user.email
      }));
    } catch (error) {
      console.error('Error obteniendo supervisores y administradores:', error);
      return [];
    }
  }
}
