import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { FaceServiceModule } from '../face-service/face-service.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [FaceServiceModule, AuthModule],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule { }
