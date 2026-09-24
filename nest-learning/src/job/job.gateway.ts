import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
})
export class jobGateway {
  @WebSocketServer()
  server!: Server;

  sendProgress(jobId: string, progress: number, stage: string) {
    this.server.emit('job-progress', {
      jobId,
      progress,
      stage,
    });
  }

  sendTestProgress() {
    let progress = 0;

    const emitProgress = () => {
      this.sendProgress(
        'test-job',
        progress,
        progress === 100 ? 'Completed' : 'Testing socket progress',
      );

      if (progress === 100) {
        clearInterval(progressInterval);
      }

      progress += 10;
    };

    emitProgress();
    const progressInterval = setInterval(emitProgress, 250);

    return {
      jobId: 'test-job',
      message: 'Test progress started',
    };
  }
}
