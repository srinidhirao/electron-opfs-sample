**Build Instructions**
-

```
$ npm install
$ ionic cordova platform add electron
```

*Set COOP and COEP Headers*
Using [sqlite-wasm](https://github.com/sqlite/sqlite-wasm/tree/main) to integrate OPFS requires these two headers to be set. During development, this can be achieved by setting the headers in 
platforms > electron > platform_www > cdv-electron-main.js

```
app.on('ready', () => {
    //...
    
    // Set COOP and COEP headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Cross-Origin-Opener-Policy': ['same-origin'],
                'Cross-Origin-Embedder-Policy': ['require-corp']
            }
        });
    });
});
```
Include a reference for `session` in the top level imports:

```
const {
    app,
    BrowserWindow,
    protocol,
    ipcMain,
    net,
    session
} = require('electron');
```

Once the headers are set, run the project targeting electron platform with source map and no-build option (to make the loading faster).

```
$ ionic cordova run electron --no-build --source-map
```

**Test Instructions**
-
1. Launch the app.
2. App provides two option to test OPFS. Foreground / Background (using workers)
3. Selecting either option results in an exception which gets printed to the console.

```error
bootstrap:19 OPFS syncer: Error initializing OPFS asyncer: 
ErrorEvent {isTrusted: true, message: 'Uncaught ReferenceError: require is not defined', filename: 'file:///C:/Users/srinidhi/Documents/Vanilla_Ionic_2/platforms/electron/www/4270.bc9b09e757c4ca57.js', lineno: 1, colno: 28, …}
```

![Electron App Error](Electron-app-error-information.PNG)

If you inspect the error, you can see that this file: `sqlite3-opfs-async-proxy.js` has been
transformed into xxxx.xxxx.js file with a require statement at the top.

```
 var L, l = require("C:/../../../../node_modules/@babel/runtime/helpers/asyncToGenerator.js").default;
``` 

This package which I'm trying to integrate [sqlite-wasm](https://github.com/sqlite/sqlite-wasm/tree/main) actually produces a ESM module. It seems like the ionic cordova electron stack seems to be transpiling the JS code to CommonJS module syntax which might be causing an issue while trying to access from the browser front end application.

**Ionic Info**
-
```
$ ionic info

Ionic:

   Ionic CLI                     : 6.20.1 (C:\Users\srinidhi\AppData\Roaming\npm\node_modules\@ionic\cli)
   Ionic Framework               : @ionic/angular 8.0.0
   @angular-devkit/build-angular : 18.1.2
   @angular-devkit/schematics    : 18.1.2
   @angular/cli                  : 18.1.2
   @ionic/angular-toolkit        : 11.0.1

Cordova:

   Cordova CLI       : 11.0.0
   Cordova Platforms : browser 6.0.0, electron 4.0.0
   Cordova Plugins   : cordova-plugin-ionic-keyboard 2.2.0, cordova-plugin-ionic-webview 5.0.0, (and 3 other plugins)

Utility:

   cordova-res : not installed globally
   native-run  : 2.0.1

System:

   NodeJS : v20.16.0 (C:\Users\srinidhi\AppData\Local\Volta\tools\image\node\20.16.0\node.exe)
   npm    : 10.8.1
   OS     : Windows 10
```
