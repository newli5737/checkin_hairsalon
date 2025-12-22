-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('NAIL', 'HAIR', 'TATTOO');

-- CreateEnum
CREATE TYPE "ClassLocation" AS ENUM ('CAN_THO', 'HO_CHI_MINH');

-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN     "trainingClassId" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "identityCard" TEXT,
ADD COLUMN     "identityCardImage" TEXT,
ADD COLUMN     "trainingClassId" TEXT;

-- CreateTable
CREATE TABLE "training_classes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClassType" NOT NULL,
    "location" "ClassLocation" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_classes_code_key" ON "training_classes"("code");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_trainingClassId_fkey" FOREIGN KEY ("trainingClassId") REFERENCES "training_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_trainingClassId_fkey" FOREIGN KEY ("trainingClassId") REFERENCES "training_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
