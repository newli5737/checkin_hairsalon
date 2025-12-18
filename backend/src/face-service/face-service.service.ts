import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface FaceVerifyResponse {
    matched: boolean;
    score: number;
}

@Injectable()
export class FaceServiceService {
    private readonly logger = new Logger(FaceServiceService.name);
    private readonly faceServiceUrl: string;

    constructor(
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
        this.faceServiceUrl = this.configService.get('FACE_SERVICE_URL') || 'http://localhost:8001';
    }

    async registerFace(studentId: string, imageBase64: string): Promise<void> {
        try {
            this.logger.log(`Registering face for student: ${studentId}`);

            const response = await firstValueFrom(
                this.httpService.post(`${this.faceServiceUrl}/register`, {
                    student_id: studentId,
                    image: imageBase64,
                }),
            );

            this.logger.log(`Face registered successfully for student: ${studentId}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to register face for student ${studentId}:`, error.message);
            throw new HttpException(
                'Không thể đăng ký khuôn mặt. Vui lòng thử lại.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async verifyFace(studentId: string, imageBase64: string): Promise<FaceVerifyResponse> {
        try {
            this.logger.log(`Verifying face for student: ${studentId}`);

            const response = await firstValueFrom(
                this.httpService.post(`${this.faceServiceUrl}/verify`, {
                    student_id: studentId,
                    image: imageBase64,
                }),
            );

            this.logger.log(`Face verification result for student ${studentId}: matched=${response.data.matched}, score=${response.data.score}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to verify face for student ${studentId}:`, error.message);
            throw new HttpException(
                'Không thể xác thực khuôn mặt. Vui lòng thử lại.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
