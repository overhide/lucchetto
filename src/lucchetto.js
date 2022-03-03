const METADATA_REGEX = /,metadata=([^,]*)/;

/**
 * Helper class; reacts to remotestorage.js `onConnected` events to parse metadata out of newly available token.
 */
class Lucchetto {
  
  /**
   * @param {*} remoteStorage - the RS instance available from client.
   */
  constructor(remoteStorage) {
    this.remoteStorage = remoteStorage;
    this.metadata = {};
    this.previousToken = null;
    this.currentUserAddress = null;

    document.addEventListener('DOMContentLoaded', this.onDomLoad);
  }

  /**
   * Regular DOM "loaded" event handler.
   */
  onDomLoad = () => {
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
    return this.currentUserAddress ? this.currentUserAddress : this.remoteStorage.remote.userAddress;
  }
}

var root = typeof self == 'object' && self.self === self && self ||
typeof global == 'object' && global.global === global && global ||
this ||
{};

root.Lucchetto = Lucchetto;

module.exports = { Lucchetto };