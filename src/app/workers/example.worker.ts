/// <reference lib="webworker" />

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';


addEventListener('message', async ({ data }) => {
  const response = `worker response to ${data}`;

  
  const log = (...args: any[]) => postMessage({ type: 'log', payload: args.join(' ') });
  const error = (...args: any[]) => postMessage({ type: 'error', payload: args.join(' ') });
  
  log('Chrome Version: ', navigator.userAgent)
  
  const root = await navigator.storage.getDirectory();
  const draftHandle = await root.getFileHandle("draft.txt", { create: true });
  // Get sync access handle
  const accessHandle = await draftHandle.createSyncAccessHandle();
 
  log('Sync access Handle: ', accessHandle)

  accessHandle.close();

  const start = function (sqlite3: any) {
    log('Running SQLite3 version', sqlite3.version.libVersion);
    let db;
    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3');
      log('OPFS is available, created persisted database at', db.filename);
    } else {
      db = new sqlite3.oo1.DB('/mydb.sqlite3', 'ct');
      log('OPFS is not available, created transient database', db.filename);
    }
    try {
      log('Creating a table...');
      db.exec('CREATE TABLE IF NOT EXISTS t(a,b)');
      log('Insert some data using exec()...');
      for (let i = 20; i <= 25; ++i) {
        db.exec({
          sql: 'INSERT INTO t(a,b) VALUES (?,?)',
          bind: [i, i * 2],
        });
      }
      log('Query data with exec()...');
      db.exec({
        sql: 'SELECT a FROM t ORDER BY a LIMIT 3',
        callback: (row: any) => {
          log(row);
          postMessage(response);
        },
      });
    } finally {
      db.close();
    }
  };

  log('Loading and initializing SQLite3 module...');
  sqlite3InitModule({
    print: log,
    printErr: error,
  }).then((sqlite3) => {
    log('Done initializing. Running demo...');
    try {
      start(sqlite3);
    } catch (err: any) {
      error(err.name, err.message);
    }
  });
});
