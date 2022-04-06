# Lucchetto

Client side JavaScript helper utilities for working with [pay2my.app](https://pay2my.app) widgets leveraging [Armadietto+Lucchetto](https://github.com/overhide/armadietto/tree/master/lucchetto) RS server implementations such as [overhide.io](https://overhide.io#baas).



## [The Documentation](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html)

[Read the docs](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html) and see its simple use in the:

- [pay2my.app demos](https://www.npmjs.com/package/pay2my.app/v/latest#demos)
- [*Remote Storage* Tutorial](https://github.com/overhide/remotestorage-tutorial) 



## Usage

### Bring It In

In your `package.json`:

```
  "dependencies": {
    ..
    "lucchetto": "^1.0.11",
    ..
  }
```



Or from a CDN:

```
 <script src="https://cdn.jsdelivr.net/npm/lucchetto/dist/lucchetto.js"></script>
```



### Onboard Your In-App Purchase SKUs

First you'll likely want to [get familiar with the onboarding process](https://github.com/overhide/armadietto/tree/master/lucchetto#onboard-to-us-dollars-ledger--as-the-dev-receiving-).

You setup your back-end data with the help of the [Lucchetto SKU Onboard](https://overhide.github.io/armadietto/lucchetto/onboard.html#) app.

Simply connect to the application with your [overhide.io](https://overhide.io#baas) account (or whatever other [Armadietto+Lucchetto](https://github.com/overhide/armadietto/tree/master/lucchetto) RS server account).

You might also want to read the last section of the [*Remote Storage* Tutorial](https://github.com/overhide/remotestorage-tutorial).



### Use It In Any of Your Applications

See the [How-To Tutorial Guide](https://github.com/overhide/pay2my.app/blob/master/howto/intro/README.md) but skip the "Leveraging a Back-End" section:  after all you're here leveraging this *lucchetto.js* with a hosted back-end.

Once available, in your source code call the back-end:

``` 
 var lucchetto = new Lucchetto(null, true, document.getElementById('hub-id-in-dom'));
 ...
 window.addEventListener('pay2myapp-appsell-sku-clicked', async (e) => { 
   ...
   const result = await lucchetto.getSku(`https://test.rs.overhide.io`, e.detail);
   console.log(`got SKU results`, { sku: e.detail.sku , result });
   ...
 }, false);
```



> ⚠ Take not of the `null` *remoteStorage* (first) constructor parameter: our users are not connecting with the RS mechanism in our non-RS apps.



The `https://test.rs.overhide.io` is the [Armadietto+Lucchetto](https://github.com/overhide/armadietto/tree/master/lucchetto) RS server you're storing your IAP SKUs on, can be one of:

-  [https://test.rs.overhide.io](https://test.rs.overhide.io/) for testnet / fake money / coding
-  [https://rs.overhide.io](https://rs.overhide.io/) for live / production deployment



### Use It In Your *Remote-Storage* Application

Use in conjunction with [remotestorage.js](https://github.com/remotestorage/remotestorage.js) within your *remotestorage* (RS) enabled application.

See the [*Remote Storage* Tutorial](https://github.com/overhide/remotestorage-tutorial).

> ⚠ *Lucchetto* is useful in support of in-app purchases when your RS app users connect to a regular RS server; but extra useful when users connect storage from an *extended* *Lucchetto* RS server.



Once available, in your source code make *Lucchetto* work off of  [remotestorage.js](https://github.com/remotestorage/remotestorage.js) :

``` 
 var rsClient = new RemoteStorage();
 var lucchetto = new Lucchetto(rsClient, true, document.getElementById('hub-id-in-dom'));
 ...
 window.addEventListener('pay2myapp-appsell-sku-clicked', async (e) => { 
   ...
   const result = await lucchetto.getSku(`https://test.rs.overhide.io`, e.detail);
   console.log(`got SKU results`, { sku: e.detail.sku , result });
   ...
 }, false);
```



*Lucchetto* will respond to connections against *remotestorage.js* and update it's state.  



The `https://test.rs.overhide.io` is the [Armadietto+Lucchetto](https://github.com/overhide/armadietto/tree/master/lucchetto) RS server you're storing your IAP SKUs on, can be one of:

-  [https://test.rs.overhide.io](https://test.rs.overhide.io/) for testnet / fake money / coding
-  [https://rs.overhide.io](https://rs.overhide.io/) for live / production deployment



[Read the docs](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html) for more.