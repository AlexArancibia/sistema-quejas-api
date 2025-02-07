import { 
  BadRequestException,
  ConflictException,
  Injectable, 
  InternalServerErrorException, 
  Logger, 
  NotFoundException 
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentTransactionDto } from './dto/create-payment-transaction.dto';
import { UpdatePaymentTransactionDto } from './dto/update-payment-transaction.dto';

@Injectable()
export class PaymentTransactionService {
  private readonly logger = new Logger(PaymentTransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  private formatError(context: string, error: any, details?: Record<string, any>) {
    const errorInfo = {
      context,
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name,
      errorCode: error.code,
      errorMessage: error.message,
      stack: error.stack,
      meta: error.meta,
      ...details
    };

    this.logger.error(JSON.stringify(errorInfo, null, 2));
    return errorInfo;
  }

  private handlePrismaError(context: string, error: any, details?: Record<string, any>) {
    const errorInfo = this.formatError(context, error, details);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const field = error.meta?.target?.[0];
          throw new ConflictException(`Conflicto en campo único: ${field}`, {
            cause: error,
            description: `Restricción única falló en [${error.meta?.target}]`
          });

 

        case 'P2003':
          const fieldName = error.meta?.field_name;
          throw new BadRequestException(`Relación inválida: ${fieldName}`, {
            cause: error,
            description: `Falla en restricción de clave foránea para ${fieldName}`
          });

        default:
          throw new InternalServerErrorException(`Error de base de datos: ${error.code}`, {
            cause: error,
            description: `Código de error Prisma: ${error.code}`
          });
      }
    }

    if (error instanceof NotFoundException || 
        error instanceof BadRequestException || 
        error instanceof ConflictException) {
      throw error;
    }

    throw new InternalServerErrorException('Error inesperado', {
      cause: error,
      description: errorInfo.errorMessage
    });
  }

  async create(createPaymentTransactionDto: CreatePaymentTransactionDto) {
    const { orderId, paymentProviderId, currencyId, ...transactionData } = createPaymentTransactionDto;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        try {
          // Validar relaciones
          await this.validateRelationsExist(prisma, {
            orderId,
            paymentProviderId,
            currencyId
          });

          // Crear transacción
          return await prisma.paymentTransaction.create({
            data: {
              ...transactionData,
              order: { connect: { id: orderId } },
              paymentProvider: { connect: { id: paymentProviderId } },
              currency: { connect: { id: currencyId } },
            },
            include: this.getTransactionIncludes()
          });
        } catch (error) {
          this.handlePrismaError('Creación de transacción', error, {
            transactionData,
            relatedIds: { orderId, paymentProviderId, currencyId }
          });
        }
      });
    } catch (error) {
      throw this.handlePrismaError('Transacción de creación de pago', error);
    }
  }

  private async validateRelationsExist(
    prisma: Prisma.TransactionClient,
    ids: { orderId: string; paymentProviderId: string; currencyId: string }
  ) {
    try {
      await Promise.all([
        prisma.order.findUniqueOrThrow({ where: { id: ids.orderId } }),
        prisma.paymentProvider.findUniqueOrThrow({ where: { id: ids.paymentProviderId } }),
        prisma.currency.findUniqueOrThrow({ where: { id: ids.currencyId } })
      ]);
    } catch (error) {
      this.handlePrismaError('Validación de relaciones', error, { relatedIds: ids });
    }
  }

  async findAll() {
    try {
      return await this.prisma.paymentTransaction.findMany({
        include: this.getTransactionIncludes()
      });
    } catch (error) {
      throw this.handlePrismaError('Consulta de todas las transacciones', error);
    }
  }

  async findOne(id: string) {
    try {
      const transaction = await this.prisma.paymentTransaction.findUnique({
        where: { id },
        include: this.getTransactionIncludes()
      });

      if (!transaction) {
        throw new NotFoundException(`Transacción de pago con ID ${id} no encontrada`);
      }

      return transaction;
    } catch (error) {
      throw this.handlePrismaError('Consulta de transacción', error, { transactionId: id });
    }
  }

  async update(id: string, updatePaymentTransactionDto: UpdatePaymentTransactionDto) {
    const { orderId, paymentProviderId, currencyId, ...updateData } = updatePaymentTransactionDto;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        try {
          // Validar existencia de la transacción
          const existingTransaction = await prisma.paymentTransaction.findUniqueOrThrow({
            where: { id }
          });

          // Validar nuevas relaciones si se proporcionan
          if (orderId || paymentProviderId || currencyId) {
            await this.validateUpdateRelations(prisma, {
              orderId,
              paymentProviderId,
              currencyId
            });
          }

          return await prisma.paymentTransaction.update({
            where: { id },
            data: {
              ...updateData,
              ...(orderId && { order: { connect: { id: orderId } } }),
              ...(paymentProviderId && { paymentProvider: { connect: { id: paymentProviderId } } }),
              ...(currencyId && { currency: { connect: { id: currencyId } } }),
            },
            include: this.getTransactionIncludes()
          });
        } catch (error) {
          this.handlePrismaError('Actualización de transacción', error, {
            transactionId: id,
            updateData
          });
        }
      });
    } catch (error) {
      throw this.handlePrismaError('Transacción de actualización de pago', error, { transactionId: id });
    }
  }

  private async validateUpdateRelations(
    prisma: Prisma.TransactionClient,
    ids: Partial<{ orderId: string; paymentProviderId: string; currencyId: string }>
  ) {
    try {
      const checks = [];
      
      if (ids.orderId) {
        checks.push(prisma.order.findUniqueOrThrow({ where: { id: ids.orderId } }));
      }
      if (ids.paymentProviderId) {
        checks.push(prisma.paymentProvider.findUniqueOrThrow({ where: { id: ids.paymentProviderId } }));
      }
      if (ids.currencyId) {
        checks.push(prisma.currency.findUniqueOrThrow({ where: { id: ids.currencyId } }));
      }

      await Promise.all(checks);
    } catch (error) {
      this.handlePrismaError('Validación de relaciones en actualización', error, { relatedIds: ids });
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        try {
          const deletedTransaction = await prisma.paymentTransaction.delete({
            where: { id }
          });

          return {
            message: `Transacción ${id} eliminada correctamente`,
            deletedTransaction
          };
        } catch (error) {
          this.handlePrismaError('Eliminación de transacción', error, { transactionId: id });
        }
      });
    } catch (error) {
      throw this.handlePrismaError('Transacción de eliminación de pago', error, { transactionId: id });
    }
  }

  private getTransactionIncludes() {
    return {
      order: true,
      paymentProvider: true,
      currency: true
    };
  }
}