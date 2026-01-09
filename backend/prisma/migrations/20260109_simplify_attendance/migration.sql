-- Step 1: Add isAutoSelected column to ClassSession
ALTER TABLE "class_sessions"
ADD COLUMN IF NOT EXISTS "isAutoSelected" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Set all sessions with name="Ca 1" as auto-selected
UPDATE "class_sessions"
SET "isAutoSelected" = true
WHERE "name" = 'Ca 1' AND "isDeleted" = false;

-- Step 3: Simplify AttendanceStatus enum
-- Create new enum with only PRESENT and ABSENT
CREATE TYPE "AttendanceStatus_new" AS ENUM ('PRESENT', 'ABSENT');

-- First, drop the default constraint
ALTER TABLE "attendances" ALTER COLUMN "status" DROP DEFAULT;

-- Migrate existing data: LATE and LEFT_EARLY become PRESENT (they were present)
ALTER TABLE "attendances"
ALTER COLUMN "status" TYPE "AttendanceStatus_new"
USING (
  CASE
    WHEN "status"::text IN ('PRESENT', 'LATE', 'LEFT_EARLY') THEN 'PRESENT'::"AttendanceStatus_new"
    ELSE 'ABSENT'::"AttendanceStatus_new"
  END
);

-- Set new default
ALTER TABLE "attendances" ALTER COLUMN "status" SET DEFAULT 'ABSENT'::"AttendanceStatus_new";

-- Drop old enum and rename new one
DROP TYPE "AttendanceStatus";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";

-- Note: We're keeping check-out columns and registrationDeadline for backward compatibility
-- These can be removed in a future migration if needed
