# Sistema de Llamadas WebRTC

## 🎯 Arquitectura

### Backend
- **Socket.IO**: Señalización WebRTC en tiempo real
- **REST API**: Gestión de salas y participantes
- **Base de datos**: Tracking de llamadas activas e historial

## 📡 Endpoints REST

### Crear sala de llamada
```
POST /api/calls/rooms
Body: { teamId: string, name?: string }
```

### Obtener sala activa de un equipo
```
GET /api/calls/rooms/team/:teamId
```

### Unirse a una sala
```
POST /api/calls/rooms/:roomId/join
```

### Salir de una sala
```
POST /api/calls/rooms/:roomId/leave
```

### Actualizar estado (mute/video)
```
PATCH /api/calls/rooms/:roomId/state
Body: { isMuted?: boolean, isVideoOff?: boolean }
```

## 🔌 Eventos Socket.IO

### Cliente → Servidor

#### `join-room`
```typescript
socket.emit('join-room', { roomId: string });
```

#### `offer` (iniciar conexión)
```typescript
socket.emit('offer', {
  roomId: string,
  signal: RTCSessionDescriptionInit,
  targetUserId: string
});
```

#### `answer` (responder conexión)
```typescript
socket.emit('answer', {
  roomId: string,
  signal: RTCSessionDescriptionInit,
  targetUserId: string
});
```

#### `ice-candidate` (candidatos ICE)
```typescript
socket.emit('ice-candidate', {
  roomId: string,
  signal: RTCIceCandidateInit,
  targetUserId: string
});
```

#### `toggle-audio`
```typescript
socket.emit('toggle-audio', {
  roomId: string,
  isMuted: boolean
});
```

#### `toggle-video`
```typescript
socket.emit('toggle-video', {
  roomId: string,
  isVideoOff: boolean
});
```

#### `leave-room`
```typescript
socket.emit('leave-room', { roomId: string });
```

### Servidor → Cliente

#### `room-participants` (al unirse)
```typescript
socket.on('room-participants', ({ participants: string[] }) => {
  // Lista de IDs de usuarios ya en la sala
});
```

#### `user-joined` (nuevo participante)
```typescript
socket.on('user-joined', ({ userId: string }) => {
  // Iniciar conexión WebRTC con este usuario
});
```

#### `offer` (recibir oferta)
```typescript
socket.on('offer', ({ signal, userId }) => {
  // Crear respuesta WebRTC
});
```

#### `answer` (recibir respuesta)
```typescript
socket.on('answer', ({ signal, userId }) => {
  // Completar conexión WebRTC
});
```

#### `ice-candidate` (recibir candidato ICE)
```typescript
socket.on('ice-candidate', ({ signal, userId }) => {
  // Agregar candidato a peer connection
});
```

#### `user-audio-changed`
```typescript
socket.on('user-audio-changed', ({ userId, isMuted }) => {
  // Actualizar UI
});
```

#### `user-video-changed`
```typescript
socket.on('user-video-changed', ({ userId, isVideoOff }) => {
  // Actualizar UI
});
```

#### `user-left` (usuario se fue)
```typescript
socket.on('user-left', ({ userId: string }) => {
  // Cerrar peer connection y remover de UI
});
```

## 🔐 Autenticación

Socket.IO requiere autenticación mediante JWT:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'tu-jwt-token'
  }
});
```

## 🔄 Flujo de Conexión

1. Usuario A crea sala → `POST /api/calls/rooms`
2. Usuario A se conecta a Socket.IO con token
3. Usuario A emite `join-room`
4. Usuario B ve sala activa → `GET /api/calls/rooms/team/:teamId`
5. Usuario B se une → `POST /api/calls/rooms/:roomId/join`
6. Usuario B emite `join-room`
7. Usuario A recibe `user-joined` con userId de B
8. Usuario A crea RTCPeerConnection y envía `offer` a B
9. Usuario B recibe `offer`, crea RTCPeerConnection y envía `answer`
10. Ambos intercambian `ice-candidate` hasta conectarse
11. Stream de audio/video establecido

## 📊 Base de Datos

### `salas_llamada`
- Sala activa por equipo
- Tracking de inicio/fin
- Quién creó la sala

### `participantes_llamada`
- Quién está en cada sala
- Estado de audio/video
- Cuándo se unió/salió
