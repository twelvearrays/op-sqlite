import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let sqlite3 = null;
const log = console.log;
const error = console.error;
let isInitialized = false;
const ports = new Set();

// Initialize SQLite when the worker starts
const initSQLite = async () => {
  try {
    sqlite3 = await sqlite3InitModule({print: log, printErr: error});

    console.log('SQLite initialized in SharedWorker');

    ports.forEach(port => {
      port.postMessage({
        type: 'sqlite-ready',
        dbId,
      });
    });
  } catch (error) {
    console.error('Failed to initialize SQLite:', error);
  }
};

// // Handle new connections
// self.addEventListener('connect', event => {
//   const port = event.ports[0];
//   ports.add(port);

//   console.log(`New connection to SharedWorker. Total ports: ${ports.size}`);

//   port.addEventListener('message', async event => {
//     const {type, id, ...data} = event.data;
//     console.log('Received message:', type, id);

//     try {
//       if (!promiser || !isInitialized) {
//         port.postMessage({
//           type: 'error',
//           id,
//           error: 'SQLite not initialized',
//         });
//         return;
//       }

//       switch (type) {
//         case 'exec':
//           const result = await promiser('exec', {dbId, ...data});
//           port.postMessage({type: 'result', id, result});
//           break;

//         case 'export':
//           const exportResult = await promiser('export', {dbId});
//           port.postMessage({type: 'result', id, result: exportResult});
//           break;

//         default:
//           port.postMessage({
//             type: 'error',
//             id,
//             error: `Unknown message type: ${type}`,
//           });
//       }
//     } catch (error) {
//       console.error('Error processing message:', error);
//       port.postMessage({
//         type: 'error',
//         id,
//         error: error.message,
//       });
//     }
//   });

//   port.start();

//   // If SQLite is already ready, notify immediately
//   if (isInitialized && promiser && dbId) {
//     console.log('SQLite already ready, notifying new port immediately');
//     port.postMessage({type: 'sqlite-ready', dbId});
//   } else {
//     console.log('SQLite not ready yet, port will be notified when ready');
//   }

//   // Handle port disconnection
//   port.addEventListener('close', () => {
//     ports.delete(port);
//     console.log(`Port disconnected. Remaining ports: ${ports.size}`);
//   });
// });

// Initialize SQLite when the worker loads
initSQLite();

onconnect = e => {
  console.log('New connection to SharedWorker');
  const port = e.ports[0];
  port.onmessage = async event => {
    const {type, id, ...data} = event.data;
    console.log('Received message:', type, id);

    // try {
    //   if (!promiser || !isInitialized) {
    //     port.postMessage({
    //       type: 'error',
    //       id,
    //       error: 'SQLite not initialized',
    //     });
    //     return;
    //   }

    //   switch (type) {
    //     case 'exec':
    //       const result = await promiser('exec', {dbId, ...data});
    //       port.postMessage({type: 'result', id, result});
    //       break;

    //     case 'export':
    //       const exportResult = await promiser('export', {dbId});
    //       port.postMessage({type: 'result', id, result: exportResult});
    //       break;

    //     default:
    //       port.postMessage({
    //         type: 'error',
    //         id,
    //         error: `Unknown message type: ${type}`,
    //       });
    //   }
    // } catch (error) {
    //   console.error('Error processing message:', error);
    //   port.postMessage({
    //     type: 'error',
    //     id,
    //     error: error.message,
    //   });
    // }
  };
  // port.addEventListener('message', async event => {
  //   const workerResult = event.data;
  //   port.postMessage({
  //     type: 'worker-result',
  //     result: workerResult,
  //   });
  // });
  // ports.add(port);
  // console.log(`New connection to SharedWorker. Total ports: ${ports.size}`);
  // port.start();
  // Notify the port that SQLite is ready
  if (isInitialized && promiser && dbId) {
    console.log('SQLite already ready, notifying new port immediately');
    port.postMessage({type: 'sqlite-ready', dbId});
    ports.add(port);
  } else {
    console.log('SQLite not ready yet, port will be notified when ready');
    // port.postMessage({
    //   error: 'SQLite not initialized',
    // });
  }
};
