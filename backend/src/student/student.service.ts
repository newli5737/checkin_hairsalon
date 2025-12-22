import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { FaceServiceService } from '../face-service/face-service.service';
import { AuthService } from '../auth/auth.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { Role } from '@prisma/client';

@Injectable()
export class StudentService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
        private faceService: FaceServiceService,
        private authService: AuthService,
    ) { }

    async createStudent(createStudentDto: CreateStudentDto) {
        // Check if email or studentCode already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createStudentDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email đã tồn tại');
        }

        const existingStudent = await this.prisma.studentProfile.findUnique({
            where: { studentCode: createStudentDto.studentCode },
        });

        if (existingStudent) {
            throw new ConflictException('Mã học viên đã tồn tại');
        }

        // Hash password
        const passwordHash = await this.authService.hashPassword(createStudentDto.password);

        // Create user and student profile
        const user = await this.prisma.user.create({
            data: {
                email: createStudentDto.email,
                passwordHash,
                role: Role.STUDENT,
                studentProfile: {
                    create: {
                        studentCode: createStudentDto.studentCode,
                        fullName: createStudentDto.fullName,
                        phone: createStudentDto.phone,
                    },
                },
            },
            include: {
                studentProfile: true,
            },
        });

        // Upload avatar if provided
        if (createStudentDto.avatarBase64) {
            const avatarUrl = await this.cloudinary.uploadBase64Image(
                createStudentDto.avatarBase64,
                'avatars',
            );

            if (!user.studentProfile) {
                throw new Error('Failed to create student profile');
            }

            await this.prisma.studentProfile.update({
                where: { id: user.studentProfile.id },
                data: { avatarUrl },
            });

            // Register face
            try {
                await this.faceService.registerFace(user.studentProfile.studentCode, createStudentDto.avatarBase64);
                await this.prisma.studentProfile.update({
                    where: { id: user.studentProfile.id },
                    data: { faceRegistered: true },
                });
            } catch (error) {
                // Face registration failed, but student is still created
                console.error('Face registration failed:', error);
            }
        }

        if (!user.studentProfile) {
            throw new Error('Failed to create student profile');
        }

        return this.getStudentById(user.studentProfile.id);
    }

    async updateStudent(id: string, updateStudentDto: UpdateStudentDto) {
        const student = await this.prisma.studentProfile.findUnique({
            where: { id },
        });

        if (!student) {
            throw new NotFoundException('Không tìm thấy học viên');
        }

        const updateData: any = {};

        if (updateStudentDto.fullName) {
            updateData.fullName = updateStudentDto.fullName;
        }

        if (updateStudentDto.phone) {
            updateData.phone = updateStudentDto.phone;
        }

        if (updateStudentDto.dateOfBirth) {
            updateData.dateOfBirth = updateStudentDto.dateOfBirth;
        }

        if (updateStudentDto.identityCard) {
            updateData.identityCard = updateStudentDto.identityCard;
        }

        if (updateStudentDto.trainingClassId) {
            updateData.trainingClassId = updateStudentDto.trainingClassId;
        }

        if (updateStudentDto.identityCardImage) {
            const cccdUrl = await this.cloudinary.uploadBase64Image(
                updateStudentDto.identityCardImage,
                'identity_cards',
            );
            updateData.identityCardImage = cccdUrl;
        }

        if (updateStudentDto.avatarBase64) {
            const avatarUrl = await this.cloudinary.uploadBase64Image(
                updateStudentDto.avatarBase64,
                'avatars',
            );
            updateData.avatarUrl = avatarUrl;

            // Re-register face
            try {
                await this.faceService.registerFace(student.studentCode, updateStudentDto.avatarBase64);
                updateData.faceRegistered = true;
            } catch (error) {
                console.error('Face registration failed:', error);
            }
        }

        await this.prisma.studentProfile.update({
            where: { id },
            data: updateData,
        });

        return this.getStudentById(id);
    }

    async getAllStudents() {
        return this.prisma.studentProfile.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                user: {
                    createdAt: 'desc',
                },
            },
        });
    }

    async getStudentById(id: string) {
        const student = await this.prisma.studentProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException('Không tìm thấy học viên');
        }

        return student;
    }

    async getStudentByUserId(userId: string) {
        const student = await this.prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException('Không tìm thấy học viên');
        }

        return student;
    }
}
