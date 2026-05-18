-- AlterTable
-- Existing products remain visible; new products default to draft.
ALTER TABLE "Product" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'draft';
