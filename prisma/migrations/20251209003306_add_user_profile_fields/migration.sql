-- AlterTable
ALTER TABLE "equipos" ADD COLUMN     "enlaces" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "organization" TEXT;

-- CreateTable
CREATE TABLE "project_favorites" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salas_llamada" (
    "id" TEXT NOT NULL,
    "nombre" TEXT,
    "equipo_id" TEXT NOT NULL,
    "creado_por" TEXT NOT NULL,
    "esta_activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salas_llamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes_llamada" (
    "id" TEXT NOT NULL,
    "sala_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "esta_muteado" BOOLEAN NOT NULL DEFAULT false,
    "video_apagado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_union" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_salida" TIMESTAMP(3),

    CONSTRAINT "participantes_llamada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_favorites_userId_idx" ON "project_favorites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_favorites_projectId_userId_key" ON "project_favorites"("projectId", "userId");

-- CreateIndex
CREATE INDEX "idx_sala_equipo" ON "salas_llamada"("equipo_id");

-- CreateIndex
CREATE INDEX "idx_sala_activa" ON "salas_llamada"("esta_activa");

-- CreateIndex
CREATE INDEX "idx_participante_sala" ON "participantes_llamada"("sala_id");

-- CreateIndex
CREATE INDEX "idx_participante_usuario" ON "participantes_llamada"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_tareas_due_date_calendar" ON "tareas"("dueDate", "deletedAt");

-- AddForeignKey
ALTER TABLE "project_favorites" ADD CONSTRAINT "project_favorites_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_favorites" ADD CONSTRAINT "project_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salas_llamada" ADD CONSTRAINT "salas_llamada_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salas_llamada" ADD CONSTRAINT "salas_llamada_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_llamada" ADD CONSTRAINT "participantes_llamada_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "salas_llamada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_llamada" ADD CONSTRAINT "participantes_llamada_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
