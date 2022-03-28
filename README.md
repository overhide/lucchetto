# Lucchetto

Client side JavaScript helper utilities for working with [remotestorage/armadietto](https://github.com/remotestorage/armadietto) (RS) servers' token metadata &mdash; servers extended for extra capabilities.

This is a client-side helper library to parse token metadata from tokens returned by [Armadietto](https://github.com/remotestorage/armadietto) / [Armadietto+Lucchetto](https://github.com/overhide/armadietto/tree/master/lucchetto) authentication.

Normally  [Armadietto](https://github.com/remotestorage/armadietto) servers return tokens sans any metadata.  However, when extended, the server might return metadata that is useful to the client application.

## [The Documentation](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html)

[Read the docs](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html) and see its simple use in:

- [My Favorite Drinks PATCH](TBD)
- ["*Lucchetto* Getting Started" example](https://overhide.github.io/armadietto/lucchetto/index.html#) 

## Use Cases

### [*Lucchetto* extension](https://github.com/overhide/armadietto/tree/master/lucchetto)

When *Armadietto* is extended to use https://pay2my.app login and in-app purchase widgets, it returns useful metadata to help the client application leverage the login for additional *pay2my.app* widgets &mdash; above and beyond those used for *Armadietto* login.  E.g. additional widgets for payments to the application developer for in-app purchased items.

Provides the following keys:

- **p2ma_address** &mdash; the pay2my.app address iff pay2myapp extension enabled in armadietto server:  this is the defacto remotestorage.js username
- **p2ma_token** &mdash; the pay2my.app token iff pay2myapp extension enabled in armadietto server
- **p2ma_signature** &mdash; the pay2my.app p2ma_token signed by p2ma_address
- **p2ma_imparter** &mdash; imparter for use with a [pay2myapp-hub API](https://github.com/overhide/pay2my.app#pay2myapp-hub-) and others, if you need to go that low

## Usage

Use in conjunction with [remotestorage.js](https://github.com/remotestorage/remotestorage.js) within your *remotestorage* (RS) enabled application.

> ⚠ *Lucchetto* is useful in support of in-app purchases when your RS app users connect to a regular RS server; but extra useful when users connect storage from an *extended* *Lucchetto* RS server.



```
  "dependencies": {
    ..
    "lucchetto": "^1.0.0",
    ..
  }
```



Or from a CDN:

```
 <script src="https://cdn.jsdelivr.net/npm/lucchetto/dist/lucchetto.js"></script>
```



Once available, in your source code make *Lucchetto* work off of  [remotestorage.js](https://github.com/remotestorage/remotestorage.js) :

``` 
var lucchetto = new Lucchetto(remoteStorage);
..
var metadata = lucchetto.getMetadata();
```



*Lucchetto* will respond to connections against *remotestorage.js* and update it's state.  

After logging in, you can get latest by retrieving the `getMetadata()` getter:  it's a simple object.  



[Read the docs](https://overhide.github.io/lucchetto/docs/lucchetto.js-rendered-docs/index.html) for more.