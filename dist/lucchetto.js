!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("__lucchetto__",[],e):"object"==typeof exports?exports.__lucchetto__=e():t.__lucchetto__=e()}(self,(function(){return(()=>{var t={993:function(t,e,s){const o=/,metadata=([^,]*)/,r=["@rs.overhide.io"],i=["@test.rs.overhide.io","@localhost:8000"];class n{constructor({remoteStorage:t,overhideIsTest:e,pay2myAppHub:s,overhideApiKey:o}={remoteStorage:null,overhideIsTest:!1,pay2myAppHub:null,overhideApiKey:null}){this.remoteStorage=t,this.metadata={},this.previousToken=null,this.currentUserAddress=null,this.isTest=e,this.hub=s,this.apiKey=o,this.lastImparterToken=null,this.reinitConnectionPromise(),this.reinitLucchettoPromise();let r=setInterval((()=>{"complete"===document.readyState&&(clearInterval(r),this.init())}).bind(this),10)}init=()=>{this.extendWidget(),this.initHub(),this.remoteStorage&&(this.remoteStorage.on("connected",this.onConnected),this.remoteStorage.on("not-connected",this.onNotConnected),this.remoteStorage.on("error",this.onError))};onConnected=()=>{this.metadata={};const t=this.remoteStorage.remote.token;t&&(this.metadata=this._getMetadata(t),this.rewriteUsername(),this.instrumentHub(),this.resolveConnection(),this.previousToken&&this.resolveLucchetto())};onNotConnected=()=>{this.metadata={},this.reinitConnectionPromise(),this.reinitLucchettoPromise(),this.logout()};onError=t=>{console.warn(`lucchetto :: onError ${t}`),this.metadata={},this.reinitConnectionPromise(),this.reinitLucchettoPromise(),this.logout()};_getMetadata=t=>{let e={};if(!t)return e;const s=t.match(o);return s&&(e=JSON.parse(atob(s[1]))),e};rewriteUsername=()=>{if(!this.remoteStorage.remote.userAddress)return;const t=this.remoteStorage.remote.userAddress.split("@")[0],e=this.remoteStorage.remote.userAddress.split("@")[1];"p2ma_address"in this.metadata&&(this.currentUserAddress=`${this.metadata.p2ma_address}@${e}`,t!==this.metadata.p2ma_address&&this.previousToken!==this.remoteStorage.remote.token&&(console.log(`lucchetto :: rewriting username ${t} => ${this.metadata.p2ma_address}`),this.remoteStorage.connect(this.currentUserAddress,this.remoteStorage.remote.token)),this.previousToken=this.remoteStorage.remote.token)};initHub=()=>{this.hub?this.apiKey&&this.hub.setAttribute("apiKey",this.apiKey):console.warn("lucchetto :: no pay2my.app hub configured for lucchetto therefore no IAPs")};instrumentHub=()=>{const t=JSON.stringify(this.metadata);this.hub&&"p2ma_address"in this.metadata&&this.lastImparterToken!==t&&(console.log("lucchetto :: instrumenting hub"),this.hub.setAttribute("token",this.metadata.p2ma_token),this.hub.setCurrentImparterChecked(this.metadata.p2ma_imparter,this.metadata.p2ma_token,this.metadata.p2ma_signature,this.metadata.p2ma_address),this.lastImparterToken=t)};logout=()=>{this.hub&&this.lastImparterToken&&(console.log("lucchetto :: logging out"),this.hub.setCurrentImparterChecked("unknown",null,null,null),this.lastImparterToken=null)};extendWidget=()=>{this.attempt=0,this._extendWidget()};_extendWidget=()=>{const t=document.querySelector("input[name='rs-user-address']"),e=this.isTest?i:r;if(this.attempt++,!(this.attempt>20))if(t)try{t.setAttribute("placeholder",e[0]),t.setAttribute("list","rs-user-address-list");const s=document.createElement("datalist");s.setAttribute("id","rs-user-address-list");for(const t of e){const e=document.createElement("option");e.setAttribute("value",t),s.appendChild(e)}t.after(s)}catch{}else setTimeout(this.extendWidget,250)};reinitLucchettoPromise=()=>{this.rejectLucchetto&&this.rejectLucchetto("lucchetto not available"),this.lucchettoPromise=new Promise(((t,e)=>{this.resolveLucchetto=t,this.rejectLucchetto=e}))};reinitConnectionPromise=()=>{this.rejectConnection&&this.rejectConnection("not connected"),this.connectionPromise=new Promise(((t,e)=>{this.resolveConnection=t,this.rejectConnection=e}))};getMetadata=()=>this.metadata;getUserAddress=()=>this.remoteStorage&&this.currentUserAddress&&this.currentUserAddress===this.remoteStorage.remote.userAddress?this.currentUserAddress:null;getNamespace=()=>"pay2my.app";getPath=(t,e,s)=>{if(!e||!e.match(/^\d{0,7}(\.\d{2})?$/))throw'"price" must be in dollars, optionally with a period and cents, e.g. `2.00`';if(!s||!s.match(/^\d{1,8}$/))throw'"within" must be a whole number, e.g. `525600`';if(!t||!t.match(/^[0-9a-z.-]{2,20}$/))throw'"SKU" must be a a string comprised of 2 to 20 numbers, lower case letters, hypens, and periods, e.g. `item`';if(+e<.5&&0!=+e)throw'"price" must be > "0.50" or "0"';return`/${t}/${e=(+e).toFixed(2)}/${s}`};getSku=async(t,e)=>{try{const s=await fetch(`${t}/pay2myapp?sku=${e.sku}&priceDollars=${(+e.priceDollars).toFixed(2)}&withinMinutes=${e.withinMinutes}&currency=${e.currency}&from=${e.from}&to=${e.to}&isTest=${e.isTest}&asOf=${e.asOf}&message=${btoa(e.message)}&signature=${btoa(e.signature)}`);if(s.ok){const t=s.headers.get("Content-Type");return t&&t.includes("text")?await s.text():t&&t.includes("json")?await s.json():await s.blob()}throw`error talking to back-end &mdash; ${s.status} &mdash; ${s.statusText}`}catch(t){throw this.hub&&this.hub.refresh(),t}}}("object"==typeof self&&self.self===self&&self||"object"==typeof s.g&&s.g.global===s.g&&s.g||this||{}).Lucchetto=n,t.exports={Lucchetto:n}}},e={};function s(o){var r=e[o];if(void 0!==r)return r.exports;var i=e[o]={exports:{}};return t[o].call(i.exports,i,i.exports,s),i.exports}return s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),s(993)})()}));