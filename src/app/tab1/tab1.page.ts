import { Component } from '@angular/core';
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';
declare module '@sqlite.org/sqlite-wasm' {
  export function sqlite3Worker1Promiser(...args: any): any
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor() { }

  testInWorkerWrapper() {
    const log = console.log;
    const error = console.error;

    const initializeSQLite = async () => {
      try {
        log('Loading and initializing SQLite3 module...');

        const promiser: any = await new Promise((resolve) => {
          const _promiser = sqlite3Worker1Promiser({
            onready: () => resolve(_promiser),
          });
        });

        log('Done initializing. Running demo...');

        const configResponse = await promiser('config-get', {});
        log('Running SQLite3 version', configResponse.result.version.libVersion);

        const openResponse = await promiser('open', {
          filename: 'file:mydb.sqlite3?vfs=opfs',
        });
        const { dbId } = openResponse;
        log(
          'OPFS is available, created persisted database at',
          openResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1'),
        );
        // Your SQLite code here.
      } catch (err: any) {
        if (!(err instanceof Error)) {
          err = new Error(err.result.message);
        }
        error(err.name, err.message);
      }
    };

    initializeSQLite();
  }

  testInWorker() {

    if (typeof Worker !== 'undefined') {
      // Create a new Web Worker
      const worker = new Worker(new URL('../workers/example.worker', import.meta.url), { type: 'module' });

      // Send data to the worker
      worker.postMessage(10);

      // Receive data from the worker
      worker.onmessage = ({ data }) => {
        console.log(data)
        // worker.terminate(); // Optionally terminate the worker
      };
    } else {
      console.warn('Web Workers are not supported in this environment.');
    }
  }

}
