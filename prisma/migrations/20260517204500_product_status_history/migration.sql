-- AlterTable
-- Existing products remain visible; new products default to draft.
ALTER TABLE "Product" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'draft';

-- CreateTable
CREATE TABLE "ProductChange" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER,
    "productName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductChange_productId_createdAt_idx" ON "ProductChange"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProductChange" ADD CONSTRAINT "ProductChange_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
