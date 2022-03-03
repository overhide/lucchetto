# Lucchetto

Client side JavaScript helper utilities for working with [remotestorage/armadietto](https://github.com/remotestorage/armadietto) servers' token metadata &mdash; servers extended for extra capabilities.

This is a client-side helper library to parse token metadata from tokens returned by [armadietto](https://github.com/remotestorage/armadietto) authentication.

Normally  [armadietto](https://github.com/remotestorage/armadietto) servers return tokens sans any metadata.  However, when extended, the server might return metadata that is useful to the client application.

## Use Cases

### [pay2my.app extension](https://github.com/overhide/armadietto/blob/cd2ef9ce4376b81e82868bd4e843c49caeab8b33/bin/dev-conf.json#L20)

When *armadietto* is extended to use https://pay2my.app login and in-app purchase widgets, it returns useful metadata to help the client application leverage the login for additional *pay2my.app* widgets &mdash; above and beyond those used for *armadietto* login.  E.g. additional widgets for payments to the application developer for in-app purchased items.

Provides the following keys:

- **p2ma_address** &mdash; the pay2my.app address iff pay2myapp extension enabled in armadietto server:  this is the defacto remotestorage.js username
- **p2ma_token** &mdash; the pay2my.app token iff pay2myapp extension enabled in armadietto server
- **p2ma_signature** &mdash; the pay2my.app p2ma_token signed by p2ma_address

## Usage

Use in conjunction with [remotestorage.js](https://github.com/remotestorage/remotestorage.js) within your *remotestorage* enabled application.

> ⚠ *Lucchetto* is only useful when connecting to *extended* [armadietto](https://github.com/remotestorage/armadietto) servers &mdash;  [remotestorage.js](https://github.com/remotestorage/remotestorage.js) is a generic client side library that works with many other servers; for which this library is just a no-op.



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

After logging in, you can get latest by retrievingg the `getMetadata()` getter:  it's a simple object.  See [Use Cases](#use_cases) above for keys and value descriptions.