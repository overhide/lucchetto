const METADATA_REGEX = /,metadata=([^,]*)/;

/**
 * List of lucchetto providing servers for production:  these are shown as options in a dropdown, when this is constructed with `!isTest`:
 */
const LUCCHETTO_PROVIDERS = [
  '@rs.overhide.io'
]

/**
 * List of lucchetto providing servers for testnets:  these are shown as options in a dropdown, when this is constructed with `isTest`:
 */
 const LUCCHETTO_PROVIDERS_4_TEST = [
  '@test.rs.overhide.io',
  '@localhost:8000'
]

/**
 * Helper class; reacts to remotestorage.js `onConnected` events to parse metadata out of newly available token.
 */
class Lucchetto {
  
  /**
   * @param {*} remoteStorage - the RS instance available from client.  This is an RS instance connected to the the client-user's data.
   * @param {bool} isTest - flag whether this is all working against testnets or mainnets/prod servers.
   * @param {*} hub - pay2my.app hub to instrument with credentials coming out of the remoteStorage instance (iff armadietto+luccheto).
   */
  constructor(remoteStorage, isTest = false, hub = null) {
    this.remoteStorage = remoteStorage;
    this.metadata = {};
    this.previousToken = null;
    this.currentUserAddress = null;
    this.isTest = isTest;
    this.hub = hub;
    this.lastImparterToken = null;

    document.addEventListener('DOMContentLoaded', this.onDomLoad);
  }

  /**
   * Regular DOM "loaded" event handler.
   */
  onDomLoad = () => {
    this.extendWidget();
    this.initHub();
    this.remoteStorage.on('connected', this.onConnected);
  }

  /**
   * remotestorage.js `onConnected` event handler.
   */
  onConnected = () => {
    this.metadata = {};
    const token = this.remoteStorage.remote.token;
    if (!token) return;
    this.metadata = this._getMetadata(token);
    this.rewriteUsername();
    this.instrumentHub();
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

    if ('p2ma_address' in this.metadata
        && oldName !== this.metadata.p2ma_address
        && this.previousToken !== this.remoteStorage.remote.token) {
        console.log(`lucchetto: rewriting username ${oldName} => ${this.metadata.p2ma_address}`);
        this.previousToken = this.remoteStorage.remote.token;
        this.currentUserAddress = `${this.metadata.p2ma_address}@${host}`;;
        this.remoteStorage.connect(this.currentUserAddress, this.remoteStorage.remote.token);
      }
    }

    initHub = () => {
      if (!this.hub) {
        console.warn(`no pay2my.app hub configured for lucchetto therefore no IAPs`);
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
        console.log(`lucchetto: instrumenting hub`);
        this.hub.setCurrentImparterChecked(
          this.metadata.p2ma_imparter,
          this.metadata.p2ma_token,
          this.metadata.p2ma_signature,
          this.metadata.p2ma_address
        );
        this.lastImparterToken = currentImparterToken;
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

  /**
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
   * @returns {string} the user address last seen upon last connection
   */
  getUserAddress = () => {
    return this.currentUserAddress && this.currentUserAddress === this.remoteStorage.remote.userAddress ? this.currentUserAddress : null;
  }

  /**
   * @returns {string} the lucchetto namespace: under which lucchetto in-app purchase SKU data is stored.
   */
  getNamespace = () => `pay2my.app`;

  /**
   * Retrieve a remotestorage path to in-app purchase SKUs.
   * 
   * @param {*} sku - tag must be a a string comprised of 2 to 20 numbers, lower case letters, hypens, and periods
   * @param {*} price - must be in US dollars, optionally with a period and cents
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

    price = (+price).toFixed(2);

    if (price < .5) {
      throw '"price" must be > "0.50"';
    }

    return `/${sku}/${price}/${within}`;
  }

  /**
   * Retrieve data for a SKU.
   * 
   * Leverages metadata from the user's armadietto+lucchetto remotestorage connection this instance was constructed with.  
   * 
   * @param {string} url - the URL to your, the developer's, armadietto+lucchetto that contains your IAP definitions.
   * @param {*} detail - the `detail` object from the `pay2myapp-appsell-sku-clicked` event, see https://www.npmjs.com/package/pay2my.app
   * @throws {*} if error
   * @returns {string} the data payload for the SKU
   */
  getSku = async (url, detail) => {

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
      const result = await response.json()
      return result.data;
    } else {
      throw `error talking to back-end &mdash; ${response.status} &mdash; ${response.statusText}`;
    }
  }
}

var root = typeof self == 'object' && self.self === self && self ||
typeof global == 'object' && global.global === global && global ||
this ||
{};

root.Lucchetto = Lucchetto;

module.exports = { Lucchetto };