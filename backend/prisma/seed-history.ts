
import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Ha Noi coordinates as base
const BASE_LAT = 21.0285;
const BASE_LNG = 105.8542;

function getRandomCoordinate(base: number) {
    // Random deviation within ~500m
    return base + (Math.random() - 0.5) * 0.01;
}

function getRandomTime(dateStr: string, startHour: number, endHour: number) {
    const date = new Date(dateStr);
    const hour = startHour + Math.random() * (endHour - startHour);
    date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    return date;
}

async function main() {
    console.log('Starting historical data seeding...');

    // Get all students
    const students = await prisma.studentProfile.findMany();
    if (students.length === 0) {
        console.log('No students found. Please create students first.');
        return;
    }
    console.log(`Found ${students.length} students.`);

    const startDate = new Date('2025-12-10');
    const endDate = new Date('2025-12-17');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        console.log(`Processing date: ${dateStr}`);

        // Create 3 sessions per day
        const sessionsData = [
            { name: 'Ca Sáng', start: '08:00', end: '11:00' },
            { name: 'Ca Chiều', start: '13:00', end: '16:00' },
            { name: 'Ca Tối', start: '18:00', end: '21:00' }
        ];

        for (const s of sessionsData) {
            // Create ClassSession
            const session = await prisma.classSession.create({
                data: {
                    date: dateStr,
                    name: s.name,
                    startTime: s.start,
                    endTime: s.end,
                    registrationDeadline: new Date(`${dateStr}T${s.start}:00.000Z`) // Approximate
                }
            });

            // For each student, decide if they registered/attended
            for (const student of students) {
                // 80% chance to register
                if (Math.random() > 0.2) {
                    await prisma.sessionRegistration.create({
                        data: {
                            studentId: student.id,
                            sessionId: session.id,
                            // Registered randomly 1-3 days before
                            registeredAt: new Date(d.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000)
                        }
                    });

                    // 90% chance to attend if registered
                    if (Math.random() > 0.1) {
                        // Đơn giản hóa: chỉ dùng PRESENT (không còn LATE)
                        const status = AttendanceStatus.PRESENT;

                        await prisma.attendance.create({
                            data: {
                                studentId: student.id,
                                sessionId: session.id,
                                checkInTime: getRandomTime(dateStr, parseInt(s.start.split(':')[0]), parseInt(s.start.split(':')[0]) + 1),
                                checkInLat: getRandomCoordinate(BASE_LAT),
                                checkInLng: getRandomCoordinate(BASE_LNG),
                                checkInFaceScore: 0.85 + Math.random() * 0.15,

                                checkOutTime: getRandomTime(dateStr, parseInt(s.end.split(':')[0]) - 0.5, parseInt(s.end.split(':')[0]) + 0.5),
                                checkOutLat: getRandomCoordinate(BASE_LAT),
                                checkOutLng: getRandomCoordinate(BASE_LNG),
                                checkOutFaceScore: 0.85 + Math.random() * 0.15,

                                status: status
                            }
                        });
                    } else {
                        // Absent (but registered) - logic handles this by absence of record or explicitly absent
                        // For now, let's leave it as no attendance record means absent in viewer usually, 
                        // or we create ABSENT record. The schema has default ABSENT.
                        await prisma.attendance.create({
                            data: {
                                studentId: student.id,
                                sessionId: session.id,
                                status: AttendanceStatus.ABSENT
                            }
                        });
                    }
                }
            }
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
