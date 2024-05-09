/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `Tweet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tweet_createdAt_id_key" ON "Tweet"("createdAt", "id");
