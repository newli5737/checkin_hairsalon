import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FaceServiceService } from './face-service.service';

@Module({
    imports: [HttpModule],
    providers: [FaceServiceService],
    exports: [FaceServiceService],
})
export class FaceServiceModule { }
