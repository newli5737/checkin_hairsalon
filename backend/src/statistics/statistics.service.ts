import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class StatisticsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Thống kê học viên vắng mặt trong tuần
     * 1 ngày học viên chỉ cần check-in 1 ca trong 3 ca là được tính có mặt
     */
    async getWeeklyAbsenceStats(startDate: string, endDate: string, classId?: string) {
        // Get all sessions in the date range
        const where: any = {
            date: {
                gte: startDate,
                lte: endDate,
            },
            isDeleted: false,
        };

        if (classId) {
            where.trainingClassId = classId;
        }

        const sessions = await this.prisma.classSession.findMany({
            where,
            include: {
                trainingClass: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Get all enrolled students for the class(es)
        const classIds = classId
            ? [classId]
            : [...new Set(sessions.map(s => s.trainingClassId).filter(Boolean))] as string[];

        const enrolledStudents = await this.prisma.classEnrollmentRequest.findMany({
            where: {
                trainingClassId: { in: classIds },
                status: 'APPROVED',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                trainingClass: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        // Get all attendances in the date range
        const sessionIds = sessions.map(s => s.id);
        const attendances = await this.prisma.attendance.findMany({
            where: {
                sessionId: { in: sessionIds },
                checkInTime: { not: null }, // Only count if they checked in
            },
            select: {
                studentId: true,
                sessionId: true,
                checkInTime: true,
                session: {
                    select: {
                        date: true,
                    },
                },
            },
        });

        // Group sessions by date
        const sessionsByDate = sessions.reduce((acc, session) => {
            if (!acc[session.date]) {
                acc[session.date] = [];
            }
            acc[session.date].push(session.id);
            return acc;
        }, {} as Record<string, string[]>);

        // Calculate absence days for each student
        const absenceStats = enrolledStudents.map((enrollment: any) => {
            const studentId = enrollment.student.id;
            let absentDays = 0;
            let totalDays = 0;

            // For each date, check if student attended at least one session
            Object.entries(sessionsByDate).forEach(([date, sessionIdsForDate]) => {
                totalDays++;
                const hasAttendance = attendances.some(
                    att => att.studentId === studentId && sessionIdsForDate.includes(att.sessionId)
                );
                if (!hasAttendance) {
                    absentDays++;
                }
            });

            return {
                student: enrollment.student,
                class: enrollment.trainingClass,
                absentDays,
                totalDays,
                attendanceRate: totalDays > 0 ? ((totalDays - absentDays) / totalDays) * 100 : 0,
            };
        });

        // Sort by most absent days
        absenceStats.sort((a, b) => b.absentDays - a.absentDays);

        return {
            startDate,
            endDate,
            totalDays: Object.keys(sessionsByDate).length,
            students: absenceStats,
        };
    }

    /**
     * Thống kê học viên check-in xa lớp (dựa vào locationNote)
     */
    async getFarCheckInStats(startDate: string, endDate: string, classId?: string) {
        const where: any = {
            checkInTime: { not: null },
            locationNote: { contains: 'xa lớp học' }, // Filter for far location notes
            session: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                isDeleted: false,
            },
        };

        if (classId) {
            where.session.trainingClassId = classId;
        }

        const farCheckIns = await this.prisma.attendance.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                session: {
                    include: {
                        trainingClass: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                checkInTime: 'desc',
            },
        });

        // Group by student and count far check-ins
        const studentStats = farCheckIns.reduce((acc, attendance) => {
            const studentId = attendance.student.id;

            if (!acc[studentId]) {
                acc[studentId] = {
                    student: attendance.student,
                    class: attendance.session.trainingClass,
                    farCheckIns: [],
                    totalFarCheckIns: 0,
                };
            }

            // Extract distance from locationNote (e.g., "Vị trí xa lớp học (523m)")
            const distanceMatch = attendance.locationNote?.match(/\((\d+)m\)/);
            const distance = distanceMatch ? parseInt(distanceMatch[1]) : 0;

            acc[studentId].farCheckIns.push({
                date: attendance.session.date,
                sessionName: attendance.session.name,
                checkInTime: attendance.checkInTime,
                locationNote: attendance.locationNote,
                distance,
            });
            acc[studentId].totalFarCheckIns++;

            return acc;
        }, {} as Record<string, any>);

        // Convert to array and calculate max/average distance
        const stats = Object.values(studentStats).map((stat: any) => {
            const distances = stat.farCheckIns.map((fc: any) => fc.distance);
            const maxDistance = Math.max(...distances);
            const avgDistance = distances.reduce((sum: number, d: number) => sum + d, 0) / distances.length;

            return {
                ...stat,
                maxDistance,
                avgDistance: Math.round(avgDistance),
            };
        });

        // Sort by most far check-ins
        stats.sort((a, b) => b.totalFarCheckIns - a.totalFarCheckIns);

        return {
            startDate,
            endDate,
            totalFarCheckIns: farCheckIns.length,
            students: stats,
        };
    }

    /**
     * Get overall statistics summary
     */
    async getOverallStats(startDate: string, endDate: string, classId?: string) {
        const where: any = {
            session: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                isDeleted: false,
            },
        };

        if (classId) {
            where.session.trainingClassId = classId;
        }

        // Total attendances
        const totalAttendances = await this.prisma.attendance.count({
            where: {
                ...where,
                checkInTime: { not: null },
            },
        });

        // Total sessions
        const totalSessions = await this.prisma.classSession.count({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                isDeleted: false,
                ...(classId && { trainingClassId: classId }),
            },
        });

        // Present count (simplified - no more late tracking)
        const presentCount = await this.prisma.attendance.count({
            where: {
                ...where,
                status: 'PRESENT',
            },
        });

        // Absent count
        const absentCount = await this.prisma.attendance.count({
            where: {
                ...where,
                status: 'ABSENT',
            },
        });

        // Far check-ins
        const farCheckInCount = await this.prisma.attendance.count({
            where: {
                ...where,
                locationNote: { contains: 'xa lớp học' },
            },
        });

        return {
            startDate,
            endDate,
            totalSessions,
            totalAttendances,
            presentCount,
            absentCount,
            farCheckInCount,
            presentRate: totalAttendances > 0 ? (presentCount / totalAttendances) * 100 : 0,
            absentRate: totalAttendances > 0 ? (absentCount / totalAttendances) * 100 : 0,
            farCheckInRate: totalAttendances > 0 ? (farCheckInCount / totalAttendances) * 100 : 0,
        };
    }
}
