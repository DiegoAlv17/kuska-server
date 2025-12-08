-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "lider_id" TEXT,
    "proyecto_id" TEXT,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "fecha_eliminacion" TIMESTAMP(3),

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miembros_equipo" (
    "id" TEXT NOT NULL,
    "equipo_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "fecha_union" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_salida" TIMESTAMP(3),

    CONSTRAINT "miembros_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitaciones_equipo" (
    "id" TEXT NOT NULL,
    "equipo_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitado_por" TEXT,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "expira_en" TIMESTAMP(3) NOT NULL,
    "fecha_aceptacion" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitaciones_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos_equipo" (
    "id" TEXT NOT NULL,
    "equipo_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "permiso_id" TEXT NOT NULL,
    "otorgado_por" TEXT,
    "expira_en" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permisos_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "proyecto_id" TEXT,
    "equipo_id" TEXT,
    "es_privado" BOOLEAN NOT NULL DEFAULT false,
    "creado_por" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_eliminacion" TIMESTAMP(3),

    CONSTRAINT "canales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miembros_canal" (
    "canal_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'miembro',
    "fecha_union" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "miembros_canal_pkey" PRIMARY KEY ("canal_id","usuario_id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" TEXT NOT NULL,
    "canal_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "contenido" TEXT NOT NULL,
    "tipo_mensaje" TEXT NOT NULL DEFAULT 'texto',
    "mensaje_padre_id" TEXT,
    "esta_editado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_edicion" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_eliminacion" TIMESTAMP(3),

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reacciones_mensaje" (
    "id" TEXT NOT NULL,
    "mensaje_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reacciones_mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presencia_usuario" (
    "usuario_id" TEXT NOT NULL,
    "canal_id" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'desconectado',
    "esta_escribiendo" BOOLEAN NOT NULL DEFAULT false,
    "ultima_actividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presencia_usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'accepted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_equipos_proyecto" ON "equipos"("proyecto_id");

-- CreateIndex
CREATE INDEX "idx_equipos_lider" ON "equipos"("lider_id");

-- CreateIndex
CREATE INDEX "idx_miembros_equipo_equipo" ON "miembros_equipo"("equipo_id");

-- CreateIndex
CREATE INDEX "idx_miembros_equipo_usuario" ON "miembros_equipo"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "miembros_equipo_equipo_id_usuario_id_key" ON "miembros_equipo"("equipo_id", "usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitaciones_equipo_token_key" ON "invitaciones_equipo"("token");

-- CreateIndex
CREATE INDEX "idx_invitaciones_token" ON "invitaciones_equipo"("token");

-- CreateIndex
CREATE INDEX "idx_invitaciones_email_estado" ON "invitaciones_equipo"("email", "estado");

-- CreateIndex
CREATE INDEX "idx_permisos_equipo_usuario" ON "permisos_equipo"("equipo_id", "usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_equipo_equipo_id_usuario_id_permiso_id_key" ON "permisos_equipo"("equipo_id", "usuario_id", "permiso_id");

-- CreateIndex
CREATE INDEX "idx_canales_proyecto" ON "canales"("proyecto_id");

-- CreateIndex
CREATE INDEX "idx_canales_equipo" ON "canales"("equipo_id");

-- CreateIndex
CREATE INDEX "idx_miembros_canal_usuario" ON "miembros_canal"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_mensajes_canal_fecha" ON "mensajes"("canal_id", "fecha_creacion");

-- CreateIndex
CREATE INDEX "idx_mensajes_padre" ON "mensajes"("mensaje_padre_id");

-- CreateIndex
CREATE INDEX "idx_reacciones_mensaje" ON "reacciones_mensaje"("mensaje_id");

-- CreateIndex
CREATE UNIQUE INDEX "reacciones_mensaje_mensaje_id_usuario_id_emoji_key" ON "reacciones_mensaje"("mensaje_id", "usuario_id", "emoji");

-- CreateIndex
CREATE INDEX "idx_presencia_canal" ON "presencia_usuario"("canal_id");

-- CreateIndex
CREATE INDEX "idx_friendships_user" ON "friendships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_userId_friendId_key" ON "friendships"("userId", "friendId");

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_lider_id_fkey" FOREIGN KEY ("lider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_equipo" ADD CONSTRAINT "miembros_equipo_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_equipo" ADD CONSTRAINT "miembros_equipo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitaciones_equipo" ADD CONSTRAINT "invitaciones_equipo_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitaciones_equipo" ADD CONSTRAINT "invitaciones_equipo_invitado_por_fkey" FOREIGN KEY ("invitado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canales" ADD CONSTRAINT "canales_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canales" ADD CONSTRAINT "canales_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canales" ADD CONSTRAINT "canales_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_canal" ADD CONSTRAINT "miembros_canal_canal_id_fkey" FOREIGN KEY ("canal_id") REFERENCES "canales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_canal" ADD CONSTRAINT "miembros_canal_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_canal_id_fkey" FOREIGN KEY ("canal_id") REFERENCES "canales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_mensaje_padre_id_fkey" FOREIGN KEY ("mensaje_padre_id") REFERENCES "mensajes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacciones_mensaje" ADD CONSTRAINT "reacciones_mensaje_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "mensajes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacciones_mensaje" ADD CONSTRAINT "reacciones_mensaje_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presencia_usuario" ADD CONSTRAINT "presencia_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presencia_usuario" ADD CONSTRAINT "presencia_usuario_canal_id_fkey" FOREIGN KEY ("canal_id") REFERENCES "canales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
