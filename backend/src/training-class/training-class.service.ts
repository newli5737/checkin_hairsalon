import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TrainingClassService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.trainingClass.findMany();
    }

    async create(data: any) {
        return this.prisma.trainingClass.create({
            data: {
                code: data.code,
                name: data.name,
                type: data.type,
                location: data.location
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.trainingClass.findUnique({
            where: { id }
        });
    }
}
