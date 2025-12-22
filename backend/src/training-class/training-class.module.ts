import { Module } from '@nestjs/common';
import { TrainingClassService } from './training-class.service';
import { TrainingClassController } from './training-class.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [TrainingClassController],
    providers: [TrainingClassService],
    exports: [TrainingClassService],
})
export class TrainingClassModule { }
