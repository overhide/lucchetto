
/**
 * @ignore
 */
const METADATA_REGEX = /,metadata=([^,]*)/;

/**
 * ⚠ This may only be useful when connecting to users' *remote-storage* instances through a non-null `remoteStorage` constructor parameter.
 * 
 * List of lucchetto providing servers for production:  these are shown as options in the 
 * [RS widget](https://www.npmjs.com/package/remotestorage-widget) dropdown, 
 * when the `Lucchetto` class is constructed with `!isTest`:
 * 
 * - `@rs.overhide.io`
 */
const LUCCHETTO_PROVIDERS = [
  '@rs.overhide.io'
]

/**
 * ⚠ This may only be useful when connecting to users' *remote-storage* instances through a non-null `remoteStorage` constructor parameter.
 * 
 * List of lucchetto providing servers for testnets:  these are shown as options in the 
 * [RS widget](https://www.npmjs.com/package/remotestorage-widget) dropdown, 
 * when the `Lucchetto` class is constructed with `isTest`:
 * 
 * - `@test.rs.overhide.io`
 * - `@localhost:8000`
 */
 const LUCCHETTO_PROVIDERS_4_TEST = [
  '@test.rs.overhide.io',
  '@localhost:8000'
]

/**
 * This calss provides utility functions to fetch in-app purchase data from the app-developer's RS (+Lucchetto) connection.  The 
 * in-app purchase data must first be [onboarded](https://overhide.github.io/armadietto/lucchetto/onboard.html#) onto a *Lucchetto* 
 * extended RS server.
 * 
 * A typical usage of this class with [pay2my.app](https://pay2my.app/) widgets might look like:
 * 
 * ```
 *   var lucchetto = new Lucchetto(null, true, document.getElementById('hub-id-in-dom'));
 *   ...
 *   window.addEventListener('pay2myapp-appsell-sku-clicked', async (e) => { 
 *     ...
 *     const result = await lucchetto.getSku(`https://test.rs.overhide.io`, e.detail);
 *     console.log(`got SKU results`, { sku: e.detail.sku , result });
 *     ...
 *  }, false);
 * ```
 * 
 * ---
 * 
 * ⚠ In the context of being connected to your users' *remote-storage* instances through a non-null `remoteStorage` constructor (first) parameter:
 * 
 * Reacts to [remotestorage.js](https://remotestoragejs.readthedocs.io/) `onConnected` events to 
 * parse metadata out of newly available RS tokens.
 * 
 * If the connected RS server is [Lucchetto extended](https://github.com/overhide/armadietto/blob/master/lucchetto/README.md),
 * the token will provide metadata useful to [pay2my.app](https://pay2my.app/) in-app purchase widgets &mdash; making for a nicer
 * end-user experience.
 * 
 * This class enriches the dropdown of the [RS widget](https://www.npmjs.com/package/remotestorage-widget), if any, embedded in
 * the DOM.  The enrichment provides server hints as per `LUCCHETTO_PROVIDERS` and `LUCCHETTO_PROVIDERS_4_TEST`.
 * 
 * A typical usage of this class along with [remotestorage.js](https://remotestoragejs.readthedocs.io/) 
 * and [pay2my.app](https://pay2my.app/) widgets might look like:
 * 
 * ```
 *   var rsClient = new RemoteStorage();
 *   var lucchetto = new Lucchetto(rsClient, true, document.getElementById('hub-id-in-dom'));
 *   ...
 *   window.addEventListener('pay2myapp-appsell-sku-clicked', async (e) => { 
 *     ...
 *     const result = await lucchetto.getSku(`https://test.rs.overhide.io`, e.detail);
 *     console.log(`got SKU results`, { sku: e.detail.sku , result });
 *     ...
 *  }, false);
 * ```
 */
class Lucchetto {
  
  /**
   * Instantiate this integration.
   * 
   * @param {*} remoteStorage - the RS instance available from client.  This is an RS instance connected to the the client-user's data.
   * @param {bool} isTest - flag whether this is all working against testnets or mainnets/prod servers.
   * @param {*} hub - [pay2my.app hub](https://pay2my.app/) to instrument with credentials coming out of the remoteStorage instance.
   * If user connects with a *Lucchetto extended* `remoteStorage`, this hub will be instrumented.  Otherwise the hub will need to ask for credentials on in-app
   * purchase use.
   */
  constructor(remoteStorage, isTest = false, hub = null) {
    this.remoteStorage = remoteStorage;
    this.metadata = {};
    this.previousToken = null;
    this.currentUserAddress = null;
    this.isTest = isTest;
    this.hub = hub;
    this.lastImparterToken = null;

    this.reinitConnectionPromise();
    this.reinitLucchettoPromise();
    document.addEventListener('DOMContentLoaded', this.onDomLoad);
  }

  /**
   * Regular DOM "loaded" event handler.
   * @ignore
   */
  onDomLoad = () => {
    this.extendWidget();
    this.initHub();
    if (!this.remoteStorage) return;
    this.remoteStorage.on('connected', this.onConnected);
    this.remoteStorage.on('not-connected', this.onNotConnected);
    this.remoteStorage.on('error', this.onError);
  }

  /**
   * remotestorage.js `onConnected` event handler.
   * @ignore
   */
  onConnected = () => {
    this.metadata = {};
    const token = this.remoteStorage.remote.token;
    if (!token) return;
    this.metadata = this._getMetadata(token);
    this.rewriteUsername();
    this.instrumentHub();
    this.resolveConnection();
    if (this.previousToken) {
      this.resolveLucchetto();
    }
  }

  /**
   * remotestorage.js `onNotConnected` event handler.
   * @ignore
   */
   onNotConnected = () => {
    this.metadata = {};
    this.reinitConnectionPromise();
    this.reinitLucchettoPromise();
    this.logout();
  }

  /**
   * remotestorage.js `onError` event handler.
   * @ignore
   */
   onError = (event) => {
    console.warn(`lucchetto :: onError ${event}`);
    this.metadata = {};
    this.reinitConnectionPromise();
    this.reinitLucchettoPromise();
    this.logout();
  }

  _getMetadata = (token) => {
    let metadata = {};
    if (!token) return metadata;
    const matched = token.match(METADATA_REGEX);

    if (matched) {
      metadata = JSON.parse(atob(matched[1]));    
    }

    return metadata;
  }  

  rewriteUsername = () => {
    if (!this.remoteStorage.remote.userAddress) return;

    const oldName = this.remoteStorage.remote.userAddress.split('@')[0];
    const host = this.remoteStorage.remote.userAddress.split('@')[1];

    if ('p2ma_address' in this.metadata) {
      this.currentUserAddress = `${this.metadata.p2ma_address}@${host}`;
      if (oldName !== this.metadata.p2ma_address
          && this.previousToken !== this.remoteStorage.remote.token) {
          console.log(`lucchetto :: rewriting username ${oldName} => ${this.metadata.p2ma_address}`);
          this.remoteStorage.connect(this.currentUserAddress, this.remoteStorage.remote.token);
      }
      this.previousToken = this.remoteStorage.remote.token;
    }
  }

  initHub = () => {
    if (!this.hub) {
      console.warn(`lucchetto :: no pay2my.app hub configured for lucchetto therefore no IAPs`);
      return;
    }
    if (this.isTest) {
      this.hub.setAttribute('apiKey', `0x9a6aef977a293b5c49ac5fcdd6376010e027549b8aa0ff97bc65a1d8649aef62`);
    } else {
      this.hub.setAttribute('apiKey', `0xc16f6e6d8666fdd835d909422fc141dfe5efcbcca3125bf746ef63019c486e47`);
    }      
  }

  instrumentHub = () => {
    const currentImparterToken = JSON.stringify(this.metadata);;
    if (this.hub && 'p2ma_address' in this.metadata && this.lastImparterToken !== currentImparterToken) {
      console.log(`lucchetto :: instrumenting hub`);
      this.hub.setCurrentImparterChecked(
        this.metadata.p2ma_imparter,
        this.metadata.p2ma_token,
        this.metadata.p2ma_signature,
        this.metadata.p2ma_address
      );
      this.lastImparterToken = currentImparterToken;
    }
  }

  logout = () => {
    if (this.hub && this.lastImparterToken) {
      console.log(`lucchetto :: logging out`);
      this.hub.setCurrentImparterChecked(
        'unknown',
        null,
        null,
        null
      );
      this.lastImparterToken = null;
    }
  }

  extendWidget = () => {
    this.attempt = 0;
    this._extendWidget();
  }

  _extendWidget = () => {
    const el = document.querySelector(`input[name='rs-user-address']`);
    const providers = this.isTest ? LUCCHETTO_PROVIDERS_4_TEST : LUCCHETTO_PROVIDERS;

    this.attempt++;
    if (this.attempt > 20) return;

    if (el) {
      try {
        el.setAttribute('placeholder',providers[0]);
        el.setAttribute('list', 'rs-user-address-list');
        const dl = document.createElement('datalist');
        dl.setAttribute('id', 'rs-user-address-list');
        for(const item of providers){
          const itemEl = document.createElement('option');
          itemEl.setAttribute('value', item);
          dl.appendChild(itemEl);
        }
        el.after(dl); 
      } catch {}
      return;
    }

    setTimeout(this.extendWidget, 250);
  }    

  reinitLucchettoPromise = () => {
    if (this.rejectLucchetto) this.rejectLucchetto('lucchetto not available');
    this.lucchettoPromise = new Promise((rs, rj) => {this.resolveLucchetto = rs; this.rejectLucchetto = rj;});
  }

  reinitConnectionPromise = () => {
    if (this.rejectConnection) this.rejectConnection('not connected');
    this.connectionPromise = new Promise((rs, rj) => {this.resolveConnection = rs; this.rejectConnection = rj;});
  }

  /**
   * ⚠ This may only be useful when connecting to users' *remote-storage* instances through a non-null `remoteStorage` constructor parameter.
   * 
   * Get all metadata from the token
   * 
   * @returns {*} the metadata object, it may include:
   *   - p2ma_address - the pay2my.app address iff pay2myapp extension enabled in armadietto server:  this is the defacto remotestorage.js username
   *   - p2ma_token - the pay2my.app token iff pay2myapp extension enabled in armadietto server
   *   - p2ma_signature - the pay2my.app p2ma_token signed by p2ma_address
   */
   getMetadata = () => {
    return this.metadata;
  }  

  /**
   * ⚠ This may only be useful when connecting to users' *remote-storage* instances through a non-null `remoteStorage` constructor parameter.
   *
   * @returns {string} the user address last seen upon last connection
   */
  getUserAddress = () => {
    return this.remoteStorage && this.currentUserAddress && this.currentUserAddress === this.remoteStorage.remote.userAddress ? this.currentUserAddress : null;
  }

  /**
   * @returns {string} the lucchetto namespace: under which lucchetto in-app purchase SKU data is stored.
   */
  getNamespace = () => `pay2my.app`;

  /**
   * ⚠ This may only be useful when connecting to users' *remote-storage* instances through a non-null `remoteStorage` constructor parameter.
   * 
   * Retrieve a remotestorage path to in-app purchase SKUs.  
   * 
   * A helper to derive the path on the *Lucchetto* extended RS server.
   * 
   * This is the path off of the developer's account and `getNamespace()` namespace .
   * 
   * @param {*} sku - tag must be a a string comprised of 2 to 20 numbers, lower case letters, hypens, and periods
   * @param {*} price - must be in US dollars, optionally with a period and cents:  0 or 50 cents and up
   * @param {*} within - must be a whole number
   * @throws {string} if parameters not parsable
   * @returns {string}
   */
  getPath = (sku, price, within) => {
    if (!price || !price.match(/^\d{0,7}(\.\d{2})?$/)) {
      throw '"price" must be in dollars, optionally with a period and cents, e.g. `2.00`';
    }
    if (!within || !within.match(/^\d{1,8}$/)) {
      throw '"within" must be a whole number, e.g. `525600`';
    }
    if (!sku || !sku.match(/^[0-9a-z.-]{2,20}$/)) {
      throw '"SKU" must be a a string comprised of 2 to 20 numbers, lower case letters, hypens, and periods, e.g. `item`';
    }

    if (+price < .5 && +price != 0) {
      throw '"price" must be > "0.50" or "0"';
    }

    price = (+price).toFixed(2);

    return `/${sku}/${price}/${within}`;
  }

  /**
   * Retrieve data for a SKU.
   * 
   * The IAP SKU data (`sku`, `price`, `within`) must first be [onboarded](https://overhide.github.io/armadietto/lucchetto/onboard.html#) onto a *Lucchetto* 
   * extended RS server.
   * 
   * @param {string} url - the URL to your, the developer's, *Lucchetto* extended RS server that contains your IAP SKU definitions.
   * @param {*} detail - the `detail` object from the `pay2myapp-appsell-sku-clicked` event, see https://www.npmjs.com/package/pay2my.app
   * @throws {*} if error
   * @returns {string} the data payload for the SKU
   */
  getSku = async (url, detail) => {

    try {
      // Call back-end and ensure it verifies before saying it's handled.
      const response = await fetch(`${url}/pay2myapp`
      +`?sku=${detail.sku}`
      +`&priceDollars=${(+detail.priceDollars).toFixed(2)}`
      +`&withinMinutes=${detail.withinMinutes}`
      +`&currency=${detail.currency}`
      +`&from=${detail.from}`
      +`&to=${detail.to}`
      +`&isTest=${detail.isTest}`
      +`&asOf=${detail.asOf}`
      +`&message=${btoa(detail.message)}`
      +`&signature=${btoa(detail.signature)}`);

      if (response.ok) {
        const type = response.headers.get("Content-Type");
        if (type && type.includes('text')) {
          return await response.text();
        } else if (type && type.includes('json')) {
          return await response.json();
        }
        return await response.blob();
      } else {
        throw `error talking to back-end &mdash; ${response.status} &mdash; ${response.statusText}`;
      }
    } catch (e) {
      if (this.hub) {
        this.hub.refresh();
      }
      throw e;
    }
  }
}

var root = typeof self == 'object' && self.self === self && self ||
typeof global == 'object' && global.global === global && global ||
this ||
{};

root.Lucchetto = Lucchetto;

module.exports = { Lucchetto };