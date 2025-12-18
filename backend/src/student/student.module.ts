import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { FaceServiceModule } from '../face-service/face-service.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [FaceServiceModule, AuthModule],
    controllers: [StudentController],
    providers: [StudentService],
    exports: [StudentService],
})
export class StudentModule { }
