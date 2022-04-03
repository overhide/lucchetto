# Lucchetto

Client side JavaScript helper utilities for working with [remotestorage (RS) servers'](https://remotestorage.io/servers/) token metadata &mdash; only RS servers extended for extra capabilities.

At present, this is a client-side helper library to parse extended token metadata from tokens returned by the [Armadietto+Lucchetto](https://github.com/overhide/armadietto/tree/master/lucchetto) RS server implementation, while handling non-extended tokens graciously.

Normally  [Armadietto](https://github.com/remotestorage/armadietto) servers return tokens sans any metadata.  However, when extended, the server might return metadata that is useful to the client application.

## [The Documentation](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html)

[Read the docs](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html) and see its simple use in the:

- [*Remote Storage* Tutorial](https://github.com/overhide/remotestorage-tutorial) 



## Use Cases

### [*Lucchetto* extension](https://github.com/overhide/armadietto/tree/master/lucchetto)

At present, [Armadietto](https://github.com/remotestorage/armadietto), the Node.js RS implementation, is the only implementation extended to use https://pay2my.app login and in-app purchase widgets.  This extension returns useful metadata for additional *pay2my.app* widgets within the client app &mdash; above and beyond those used for the regular RS login.  Namely, additional widgets for payments to the application developer for in-app purchased items.

Provides the following keys:

- **p2ma_address** &mdash; the pay2my.app address iff pay2myapp extension enabled in armadietto server:  this is the defacto remotestorage.js username
- **p2ma_token** &mdash; the pay2my.app token iff pay2myapp extension enabled in armadietto server
- **p2ma_signature** &mdash; the pay2my.app p2ma_token signed by p2ma_address
- **p2ma_imparter** &mdash; imparter for use with a [pay2myapp-hub API](https://github.com/overhide/pay2my.app#pay2myapp-hub-) and others, if you need to go that low

## Usage

Use in conjunction with [remotestorage.js](https://github.com/remotestorage/remotestorage.js) within your *remotestorage* (RS) enabled application.

See the [*Remote Storage* Tutorial](https://github.com/overhide/remotestorage-tutorial).

> ⚠ *Lucchetto* is useful in support of in-app purchases when your RS app users connect to a regular RS server; but extra useful when users connect storage from an *extended* *Lucchetto* RS server.



```
  "dependencies": {
    ..
    "lucchetto": "^1.0.8",
    ..
  }
```



Or from a CDN:

```
 <script src="https://cdn.jsdelivr.net/npm/lucchetto/dist/lucchetto.js"></script>
```



Once available, in your source code make *Lucchetto* work off of  [remotestorage.js](https://github.com/remotestorage/remotestorage.js) :

``` 
 var rsClient = new RemoteStorage();
 var lucchetto = new Lucchetto(rsClient, true, document.getElementById('hub-id-in-dom'));
 ...
 window.addEventListener('pay2myapp-appsell-sku-clicked', async (e) => { 
   ...
   const result = await lucchetto.getSku(`https://rs.overhide.io`, e.detail);
   console.log(`got SKU results`, { sku: e.detail.sku , result });
   ...
 }, false);
```



*Lucchetto* will respond to connections against *remotestorage.js* and update it's state.  

[Read the docs](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html) for more.