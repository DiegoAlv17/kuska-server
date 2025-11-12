-- CreateTable
CREATE TABLE "fases_proyecto" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fases_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hitos" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT,
    "milestoneId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'backlog',
    "priority" TEXT NOT NULL DEFAULT 'media',
    "assignedToId" TEXT,
    "reportedById" TEXT,
    "dueDate" TIMESTAMP(3),
    "estimatedHours" DECIMAL(5,2),
    "spentHours" DECIMAL(5,2),
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "projectId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas_tareas" (
    "taskId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "etiquetas_tareas_pkey" PRIMARY KEY ("taskId","tagId")
);

-- CreateTable
CREATE TABLE "dependencias_tareas" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dependencias_tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_tarea" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "comentarios_tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjuntos_tarea" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileId" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjuntos_tarea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_fases_proyecto" ON "fases_proyecto"("projectId", "order");

-- CreateIndex
CREATE INDEX "idx_hitos_proyecto" ON "hitos"("projectId");

-- CreateIndex
CREATE INDEX "idx_hitos_fecha_limite" ON "hitos"("dueDate");

-- CreateIndex
CREATE INDEX "idx_tareas_proyecto_estado" ON "tareas"("projectId", "status");

-- CreateIndex
CREATE INDEX "idx_tareas_orden" ON "tareas"("order");

-- CreateIndex
CREATE INDEX "idx_etiquetas_proyecto" ON "etiquetas"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_name_projectId_key" ON "etiquetas"("name", "projectId");

-- CreateIndex
CREATE INDEX "idx_etiquetas_tareas_etiqueta" ON "etiquetas_tareas"("tagId");

-- CreateIndex
CREATE INDEX "idx_dependencias_tarea" ON "dependencias_tareas"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "dependencias_tareas_taskId_dependsOnTaskId_key" ON "dependencias_tareas"("taskId", "dependsOnTaskId");

-- CreateIndex
CREATE INDEX "idx_comentarios_tarea" ON "comentarios_tarea"("taskId");

-- CreateIndex
CREATE INDEX "idx_comentarios_padre" ON "comentarios_tarea"("parentCommentId");

-- CreateIndex
CREATE INDEX "idx_adjuntos_tarea" ON "adjuntos_tarea"("taskId");

-- AddForeignKey
ALTER TABLE "fases_proyecto" ADD CONSTRAINT "fases_proyecto_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hitos" ADD CONSTRAINT "hitos_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "fases_proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "hitos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etiquetas_tareas" ADD CONSTRAINT "etiquetas_tareas_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etiquetas_tareas" ADD CONSTRAINT "etiquetas_tareas_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "etiquetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencias_tareas" ADD CONSTRAINT "dependencias_tareas_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencias_tareas" ADD CONSTRAINT "dependencias_tareas_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES "tareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_tarea" ADD CONSTRAINT "comentarios_tarea_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjuntos_tarea" ADD CONSTRAINT "adjuntos_tarea_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
