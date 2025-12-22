import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { TrainingClassService } from './training-class.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('training-classes')
export class TrainingClassController {
    constructor(private readonly trainingClassService: TrainingClassService) { }

    @Get()
    async findAll() {
        return this.trainingClassService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async create(@Body() createDto: any) {
        return this.trainingClassService.create(createDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.trainingClassService.findOne(id);
    }
}
