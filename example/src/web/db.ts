// @ts-nocheck
import SQLiteWorker from './sqlite-shared.worker.js';

class SQLiteSharedWorkerClient {
  private worker: SharedWorker | null = null;
  private port: MessagePort | null = null;
  private isReady = false;
  private messageId = 0;
  private pendingMessages = new Map<
    number,
    {resolve: Function; reject: Function}
  >();

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('mark0');
        this.worker = new SQLiteWorker();
        // console.log('mark1');
        // this.port = this.worker.port;

        // console.log('mark2');
        // this.port.addEventListener('message', event => {
        //   const {type, id, result, error} = event.data;
        //   console.log('SQLite SharedWorker message received:', event.data);

        //   switch (type) {
        //     case 'sqlite-ready':
        //       this.isReady = true;
        //       console.log('SQLite SharedWorker is ready');
        //       resolve();
        //       break;

        //     case 'sqlite-error':
        //       reject(new Error(error));
        //       break;

        //     case 'result':
        //       const pending = this.pendingMessages.get(id);
        //       if (pending) {
        //         pending.resolve(result);
        //         this.pendingMessages.delete(id);
        //       }
        //       break;

        //     case 'error':
        //       const pendingError = this.pendingMessages.get(id);
        //       if (pendingError) {
        //         pendingError.reject(new Error(error));
        //         this.pendingMessages.delete(id);
        //       }
        //       break;
        //   }
        // });
        // console.log('mark3');

        // this.port.start();
        // console.log('mark4');
        this.worker.port.onmessage = event => {
          const {type, id, result, error} = event.data;
          console.log('SQLite SharedWorker message received:', event.data);

          switch (type) {
            case 'sqlite-ready':
              this.isReady = true;
              console.log('SQLite SharedWorker is ready');
              resolve();
              break;

            case 'sqlite-error':
              reject(new Error(error));
              break;

            case 'result':
              const pending = this.pendingMessages.get(id);
              if (pending) {
                pending.resolve(result);
                this.pendingMessages.delete(id);
              }
              break;

            case 'error':
              const pendingError = this.pendingMessages.get(id);
              if (pendingError) {
                pendingError.reject(new Error(error));
                this.pendingMessages.delete(id);
              }
              break;
          }
        };

        // this.worker.port.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  async exec(sql: string, bind?: any[]): Promise<any> {
    if (!this.isReady || !this.port) {
      throw new Error('SQLite not ready');
    }

    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, {resolve, reject});

      this.port!.postMessage({
        type: 'exec',
        id,
        sql,
        bind: bind || [],
      });
    });
  }

  async export(): Promise<Uint8Array> {
    if (!this.isReady || !this.port) {
      throw new Error('SQLite not ready');
    }

    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, {resolve, reject});

      this.port!.postMessage({
        type: 'export',
        id,
      });
    });
  }
}

// Singleton instance
let sqliteClient: SQLiteSharedWorkerClient | null = null;

export async function testDbInit() {
  console.log('Called testDbInit');
  try {
    console.log('Initializing SQLite SharedWorker client...');

    if (!sqliteClient) {
      sqliteClient = new SQLiteSharedWorkerClient();
      await sqliteClient.init();
    } else {
      console.log('SQLite SharedWorker client already initialized.');
    }

    console.log('Testing database operations...');

    // Create a test table
    await sqliteClient.exec(`
      CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY,
        name TEXT,
        value INTEGER
      )
    `);

    // Insert some data
    await sqliteClient.exec('INSERT INTO test (name, value) VALUES (?, ?)', [
      'test-record',
      42,
    ]);

    // Query the data
    const result = await sqliteClient.exec('SELECT * FROM test');
    console.log('Query result:', result);
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

export {sqliteClient};
