/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xs=()=>{};var Bi={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sr=function(r){const e=[];let n=0;for(let o=0;o<r.length;o++){let a=r.charCodeAt(o);a<128?e[n++]=a:a<2048?(e[n++]=a>>6|192,e[n++]=a&63|128):(a&64512)===55296&&o+1<r.length&&(r.charCodeAt(o+1)&64512)===56320?(a=65536+((a&1023)<<10)+(r.charCodeAt(++o)&1023),e[n++]=a>>18|240,e[n++]=a>>12&63|128,e[n++]=a>>6&63|128,e[n++]=a&63|128):(e[n++]=a>>12|224,e[n++]=a>>6&63|128,e[n++]=a&63|128)}return e},Vs=function(r){const e=[];let n=0,o=0;for(;n<r.length;){const a=r[n++];if(a<128)e[o++]=String.fromCharCode(a);else if(a>191&&a<224){const l=r[n++];e[o++]=String.fromCharCode((a&31)<<6|l&63)}else if(a>239&&a<365){const l=r[n++],d=r[n++],v=r[n++],E=((a&7)<<18|(l&63)<<12|(d&63)<<6|v&63)-65536;e[o++]=String.fromCharCode(55296+(E>>10)),e[o++]=String.fromCharCode(56320+(E&1023))}else{const l=r[n++],d=r[n++];e[o++]=String.fromCharCode((a&15)<<12|(l&63)<<6|d&63)}}return e.join("")},br={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,o=[];for(let a=0;a<r.length;a+=3){const l=r[a],d=a+1<r.length,v=d?r[a+1]:0,E=a+2<r.length,A=E?r[a+2]:0,R=l>>2,U=(l&3)<<4|v>>4;let D=(v&15)<<2|A>>6,z=A&63;E||(z=64,d||(D=64)),o.push(n[R],n[U],n[D],n[z])}return o.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(Sr(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):Vs(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,o=[];for(let a=0;a<r.length;){const l=n[r.charAt(a++)],v=a<r.length?n[r.charAt(a)]:0;++a;const A=a<r.length?n[r.charAt(a)]:64;++a;const U=a<r.length?n[r.charAt(a)]:64;if(++a,l==null||v==null||A==null||U==null)throw new Fs;const D=l<<2|v>>4;if(o.push(D),A!==64){const z=v<<4&240|A>>2;if(o.push(z),U!==64){const b=A<<6&192|U;o.push(b)}}}return o},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class Fs extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const js=function(r){const e=Sr(r);return br.encodeByteArray(e,!0)},Pr=function(r){return js(r).replace(/\./g,"")},Cr=function(r){try{return br.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bs(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hs=()=>Bs().__FIREBASE_DEFAULTS__,$s=()=>{if(typeof process>"u"||typeof Bi>"u")return;const r=Bi.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Gs=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&Cr(r[1]);return e&&JSON.parse(e)},Ws=()=>{try{return xs()||Hs()||$s()||Gs()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},zs=r=>{var e;return(e=Ws())===null||e===void 0?void 0:e[`_${r}`]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nr(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ht(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function qs(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ht())}function Ks(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Xs(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function Js(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ys(){try{return typeof indexedDB=="object"}catch{return!1}}function Qs(){return new Promise((r,e)=>{try{let n=!0;const o="validate-browser-context-for-indexeddb-analytics-module",a=self.indexedDB.open(o);a.onsuccess=()=>{a.result.close(),n||self.indexedDB.deleteDatabase(o),r(!0)},a.onupgradeneeded=()=>{n=!1},a.onerror=()=>{var l;e(((l=a.error)===null||l===void 0?void 0:l.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zs="FirebaseError";class It extends Error{constructor(e,n,o){super(n),this.code=e,this.customData=o,this.name=Zs,Object.setPrototypeOf(this,It.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,de.prototype.create)}}class de{constructor(e,n,o){this.service=e,this.serviceName=n,this.errors=o}create(e,...n){const o=n[0]||{},a=`${this.service}/${e}`,l=this.errors[e],d=l?to(l,o):"Error",v=`${this.serviceName}: ${d} (${a}).`;return new It(a,v,o)}}function to(r,e){return r.replace(eo,(n,o)=>{const a=e[o];return a!=null?String(a):`<${o}?>`})}const eo=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rr(r){const e=[];for(const[n,o]of Object.entries(r))Array.isArray(o)?o.forEach(a=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(a))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(o));return e.length?"&"+e.join("&"):""}function no(r,e){const n=new io(r,e);return n.subscribe.bind(n)}class io{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(o=>{this.error(o)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,o){let a;if(e===void 0&&n===void 0&&o===void 0)throw new Error("Missing Observer.");ro(e,["next","error","complete"])?a=e:a={next:e,error:n,complete:o},a.next===void 0&&(a.next=In),a.error===void 0&&(a.error=In),a.complete===void 0&&(a.complete=In);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?a.error(this.finalError):a.complete()}catch{}}),this.observers.push(a),l}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(o){typeof console<"u"&&console.error&&console.error(o)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ro(r,e){if(typeof r!="object"||r===null)return!1;for(const n of e)if(n in r&&typeof r[n]=="function")return!0;return!1}function In(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function We(r){return r&&r._delegate?r._delegate:r}class Ht{constructor(e,n,o){this.name=e,this.instanceFactory=n,this.type=o,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var k;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(k||(k={}));const so={debug:k.DEBUG,verbose:k.VERBOSE,info:k.INFO,warn:k.WARN,error:k.ERROR,silent:k.SILENT},oo=k.INFO,ao={[k.DEBUG]:"log",[k.VERBOSE]:"log",[k.INFO]:"info",[k.WARN]:"warn",[k.ERROR]:"error"},ho=(r,e,...n)=>{if(e<r.logLevel)return;const o=new Date().toISOString(),a=ao[e];if(a)console[a](`[${o}]  ${r.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Mn{constructor(e){this.name=e,this._logLevel=oo,this._logHandler=ho,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in k))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?so[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,k.DEBUG,...e),this._logHandler(this,k.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,k.VERBOSE,...e),this._logHandler(this,k.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,k.INFO,...e),this._logHandler(this,k.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,k.WARN,...e),this._logHandler(this,k.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,k.ERROR,...e),this._logHandler(this,k.ERROR,...e)}}const lo=(r,e)=>e.some(n=>r instanceof n);let Hi,$i;function uo(){return Hi||(Hi=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function co(){return $i||($i=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const kr=new WeakMap,Rn=new WeakMap,Dr=new WeakMap,An=new WeakMap,Un=new WeakMap;function fo(r){const e=new Promise((n,o)=>{const a=()=>{r.removeEventListener("success",l),r.removeEventListener("error",d)},l=()=>{n(wt(r.result)),a()},d=()=>{o(r.error),a()};r.addEventListener("success",l),r.addEventListener("error",d)});return e.then(n=>{n instanceof IDBCursor&&kr.set(n,r)}).catch(()=>{}),Un.set(e,r),e}function po(r){if(Rn.has(r))return;const e=new Promise((n,o)=>{const a=()=>{r.removeEventListener("complete",l),r.removeEventListener("error",d),r.removeEventListener("abort",d)},l=()=>{n(),a()},d=()=>{o(r.error||new DOMException("AbortError","AbortError")),a()};r.addEventListener("complete",l),r.addEventListener("error",d),r.addEventListener("abort",d)});Rn.set(r,e)}let kn={get(r,e,n){if(r instanceof IDBTransaction){if(e==="done")return Rn.get(r);if(e==="objectStoreNames")return r.objectStoreNames||Dr.get(r);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return wt(r[e])},set(r,e,n){return r[e]=n,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function go(r){kn=r(kn)}function mo(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const o=r.call(Tn(this),e,...n);return Dr.set(o,e.sort?e.sort():[e]),wt(o)}:co().includes(r)?function(...e){return r.apply(Tn(this),e),wt(kr.get(this))}:function(...e){return wt(r.apply(Tn(this),e))}}function _o(r){return typeof r=="function"?mo(r):(r instanceof IDBTransaction&&po(r),lo(r,uo())?new Proxy(r,kn):r)}function wt(r){if(r instanceof IDBRequest)return fo(r);if(An.has(r))return An.get(r);const e=_o(r);return e!==r&&(An.set(r,e),Un.set(e,r)),e}const Tn=r=>Un.get(r);function yo(r,e,{blocked:n,upgrade:o,blocking:a,terminated:l}={}){const d=indexedDB.open(r,e),v=wt(d);return o&&d.addEventListener("upgradeneeded",E=>{o(wt(d.result),E.oldVersion,E.newVersion,wt(d.transaction),E)}),n&&d.addEventListener("blocked",E=>n(E.oldVersion,E.newVersion,E)),v.then(E=>{l&&E.addEventListener("close",()=>l()),a&&E.addEventListener("versionchange",A=>a(A.oldVersion,A.newVersion,A))}).catch(()=>{}),v}const vo=["get","getKey","getAll","getAllKeys","count"],wo=["put","add","delete","clear"],Sn=new Map;function Gi(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(Sn.get(e))return Sn.get(e);const n=e.replace(/FromIndex$/,""),o=e!==n,a=wo.includes(n);if(!(n in(o?IDBIndex:IDBObjectStore).prototype)||!(a||vo.includes(n)))return;const l=async function(d,...v){const E=this.transaction(d,a?"readwrite":"readonly");let A=E.store;return o&&(A=A.index(v.shift())),(await Promise.all([A[n](...v),a&&E.done]))[0]};return Sn.set(e,l),l}go(r=>({...r,get:(e,n,o)=>Gi(e,n)||r.get(e,n,o),has:(e,n)=>!!Gi(e,n)||r.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eo{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Io(n)){const o=n.getImmediate();return`${o.library}/${o.version}`}else return null}).filter(n=>n).join(" ")}}function Io(r){const e=r.getComponent();return e?.type==="VERSION"}const Dn="@firebase/app",Wi="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pt=new Mn("@firebase/app"),Ao="@firebase/app-compat",To="@firebase/analytics-compat",So="@firebase/analytics",bo="@firebase/app-check-compat",Po="@firebase/app-check",Co="@firebase/auth",No="@firebase/auth-compat",Ro="@firebase/database",ko="@firebase/data-connect",Do="@firebase/database-compat",Oo="@firebase/functions",Lo="@firebase/functions-compat",Mo="@firebase/installations",Uo="@firebase/installations-compat",xo="@firebase/messaging",Vo="@firebase/messaging-compat",Fo="@firebase/performance",jo="@firebase/performance-compat",Bo="@firebase/remote-config",Ho="@firebase/remote-config-compat",$o="@firebase/storage",Go="@firebase/storage-compat",Wo="@firebase/firestore",zo="@firebase/ai",qo="@firebase/firestore-compat",Ko="firebase",Xo="11.10.0",Jo={[Dn]:"fire-core",[Ao]:"fire-core-compat",[So]:"fire-analytics",[To]:"fire-analytics-compat",[Po]:"fire-app-check",[bo]:"fire-app-check-compat",[Co]:"fire-auth",[No]:"fire-auth-compat",[Ro]:"fire-rtdb",[ko]:"fire-data-connect",[Do]:"fire-rtdb-compat",[Oo]:"fire-fn",[Lo]:"fire-fn-compat",[Mo]:"fire-iid",[Uo]:"fire-iid-compat",[xo]:"fire-fcm",[Vo]:"fire-fcm-compat",[Fo]:"fire-perf",[jo]:"fire-perf-compat",[Bo]:"fire-rc",[Ho]:"fire-rc-compat",[$o]:"fire-gcs",[Go]:"fire-gcs-compat",[Wo]:"fire-fst",[qo]:"fire-fst-compat",[zo]:"fire-vertex","fire-js":"fire-js",[Ko]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yo=new Map,Qo=new Map,zi=new Map;function qi(r,e){try{r.container.addComponent(e)}catch(n){pt.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,n)}}function $t(r){const e=r.name;if(zi.has(e))return pt.debug(`There were multiple attempts to register component ${e}.`),!1;zi.set(e,r);for(const n of Yo.values())qi(n,r);for(const n of Qo.values())qi(n,r);return!0}function Pt(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zo={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},xn=new de("app","Firebase",Zo);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ze=Xo;function Et(r,e,n){var o;let a=(o=Jo[r])!==null&&o!==void 0?o:r;n&&(a+=`-${n}`);const l=a.match(/\s|\//),d=e.match(/\s|\//);if(l||d){const v=[`Unable to register library "${a}" with version "${e}":`];l&&v.push(`library name "${a}" contains illegal characters (whitespace or "/")`),l&&d&&v.push("and"),d&&v.push(`version name "${e}" contains illegal characters (whitespace or "/")`),pt.warn(v.join(" "));return}$t(new Ht(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ta="firebase-heartbeat-database",ea=1,fe="firebase-heartbeat-store";let bn=null;function Or(){return bn||(bn=yo(ta,ea,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(fe)}catch(n){console.warn(n)}}}}).catch(r=>{throw xn.create("idb-open",{originalErrorMessage:r.message})})),bn}async function na(r){try{const n=(await Or()).transaction(fe),o=await n.objectStore(fe).get(Lr(r));return await n.done,o}catch(e){if(e instanceof It)pt.warn(e.message);else{const n=xn.create("idb-get",{originalErrorMessage:e?.message});pt.warn(n.message)}}}async function Ki(r,e){try{const o=(await Or()).transaction(fe,"readwrite");await o.objectStore(fe).put(e,Lr(r)),await o.done}catch(n){if(n instanceof It)pt.warn(n.message);else{const o=xn.create("idb-set",{originalErrorMessage:n?.message});pt.warn(o.message)}}}function Lr(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ia=1024,ra=30;class sa{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new aa(n),this._heartbeatsCachePromise=this._storage.read().then(o=>(this._heartbeatsCache=o,o))}async triggerHeartbeat(){var e,n;try{const a=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=Xi();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(d=>d.date===l))return;if(this._heartbeatsCache.heartbeats.push({date:l,agent:a}),this._heartbeatsCache.heartbeats.length>ra){const d=ha(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(d,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(o){pt.warn(o)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Xi(),{heartbeatsToSend:o,unsentEntries:a}=oa(this._heartbeatsCache.heartbeats),l=Pr(JSON.stringify({version:2,heartbeats:o}));return this._heartbeatsCache.lastSentHeartbeatDate=n,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(n){return pt.warn(n),""}}}function Xi(){return new Date().toISOString().substring(0,10)}function oa(r,e=ia){const n=[];let o=r.slice();for(const a of r){const l=n.find(d=>d.agent===a.agent);if(l){if(l.dates.push(a.date),Ji(n)>e){l.dates.pop();break}}else if(n.push({agent:a.agent,dates:[a.date]}),Ji(n)>e){n.pop();break}o=o.slice(1)}return{heartbeatsToSend:n,unsentEntries:o}}class aa{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ys()?Qs().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await na(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const a=await this.read();return Ki(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const a=await this.read();return Ki(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}}function Ji(r){return Pr(JSON.stringify({version:2,heartbeats:r})).length}function ha(r){if(r.length===0)return-1;let e=0,n=r[0].date;for(let o=1;o<r.length;o++)r[o].date<n&&(n=r[o].date,e=o);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function la(r){$t(new Ht("platform-logger",e=>new Eo(e),"PRIVATE")),$t(new Ht("heartbeat",e=>new sa(e),"PRIVATE")),Et(Dn,Wi,r),Et(Dn,Wi,"esm2017"),Et("fire-js","")}la("");var Yi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Vn;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(m,u){function f(){}f.prototype=u.prototype,m.D=u.prototype,m.prototype=new f,m.prototype.constructor=m,m.C=function(p,g,y){for(var c=Array(arguments.length-2),ut=2;ut<arguments.length;ut++)c[ut-2]=arguments[ut];return u.prototype[g].apply(p,c)}}function n(){this.blockSize=-1}function o(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(o,n),o.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function a(m,u,f){f||(f=0);var p=Array(16);if(typeof u=="string")for(var g=0;16>g;++g)p[g]=u.charCodeAt(f++)|u.charCodeAt(f++)<<8|u.charCodeAt(f++)<<16|u.charCodeAt(f++)<<24;else for(g=0;16>g;++g)p[g]=u[f++]|u[f++]<<8|u[f++]<<16|u[f++]<<24;u=m.g[0],f=m.g[1],g=m.g[2];var y=m.g[3],c=u+(y^f&(g^y))+p[0]+3614090360&4294967295;u=f+(c<<7&4294967295|c>>>25),c=y+(g^u&(f^g))+p[1]+3905402710&4294967295,y=u+(c<<12&4294967295|c>>>20),c=g+(f^y&(u^f))+p[2]+606105819&4294967295,g=y+(c<<17&4294967295|c>>>15),c=f+(u^g&(y^u))+p[3]+3250441966&4294967295,f=g+(c<<22&4294967295|c>>>10),c=u+(y^f&(g^y))+p[4]+4118548399&4294967295,u=f+(c<<7&4294967295|c>>>25),c=y+(g^u&(f^g))+p[5]+1200080426&4294967295,y=u+(c<<12&4294967295|c>>>20),c=g+(f^y&(u^f))+p[6]+2821735955&4294967295,g=y+(c<<17&4294967295|c>>>15),c=f+(u^g&(y^u))+p[7]+4249261313&4294967295,f=g+(c<<22&4294967295|c>>>10),c=u+(y^f&(g^y))+p[8]+1770035416&4294967295,u=f+(c<<7&4294967295|c>>>25),c=y+(g^u&(f^g))+p[9]+2336552879&4294967295,y=u+(c<<12&4294967295|c>>>20),c=g+(f^y&(u^f))+p[10]+4294925233&4294967295,g=y+(c<<17&4294967295|c>>>15),c=f+(u^g&(y^u))+p[11]+2304563134&4294967295,f=g+(c<<22&4294967295|c>>>10),c=u+(y^f&(g^y))+p[12]+1804603682&4294967295,u=f+(c<<7&4294967295|c>>>25),c=y+(g^u&(f^g))+p[13]+4254626195&4294967295,y=u+(c<<12&4294967295|c>>>20),c=g+(f^y&(u^f))+p[14]+2792965006&4294967295,g=y+(c<<17&4294967295|c>>>15),c=f+(u^g&(y^u))+p[15]+1236535329&4294967295,f=g+(c<<22&4294967295|c>>>10),c=u+(g^y&(f^g))+p[1]+4129170786&4294967295,u=f+(c<<5&4294967295|c>>>27),c=y+(f^g&(u^f))+p[6]+3225465664&4294967295,y=u+(c<<9&4294967295|c>>>23),c=g+(u^f&(y^u))+p[11]+643717713&4294967295,g=y+(c<<14&4294967295|c>>>18),c=f+(y^u&(g^y))+p[0]+3921069994&4294967295,f=g+(c<<20&4294967295|c>>>12),c=u+(g^y&(f^g))+p[5]+3593408605&4294967295,u=f+(c<<5&4294967295|c>>>27),c=y+(f^g&(u^f))+p[10]+38016083&4294967295,y=u+(c<<9&4294967295|c>>>23),c=g+(u^f&(y^u))+p[15]+3634488961&4294967295,g=y+(c<<14&4294967295|c>>>18),c=f+(y^u&(g^y))+p[4]+3889429448&4294967295,f=g+(c<<20&4294967295|c>>>12),c=u+(g^y&(f^g))+p[9]+568446438&4294967295,u=f+(c<<5&4294967295|c>>>27),c=y+(f^g&(u^f))+p[14]+3275163606&4294967295,y=u+(c<<9&4294967295|c>>>23),c=g+(u^f&(y^u))+p[3]+4107603335&4294967295,g=y+(c<<14&4294967295|c>>>18),c=f+(y^u&(g^y))+p[8]+1163531501&4294967295,f=g+(c<<20&4294967295|c>>>12),c=u+(g^y&(f^g))+p[13]+2850285829&4294967295,u=f+(c<<5&4294967295|c>>>27),c=y+(f^g&(u^f))+p[2]+4243563512&4294967295,y=u+(c<<9&4294967295|c>>>23),c=g+(u^f&(y^u))+p[7]+1735328473&4294967295,g=y+(c<<14&4294967295|c>>>18),c=f+(y^u&(g^y))+p[12]+2368359562&4294967295,f=g+(c<<20&4294967295|c>>>12),c=u+(f^g^y)+p[5]+4294588738&4294967295,u=f+(c<<4&4294967295|c>>>28),c=y+(u^f^g)+p[8]+2272392833&4294967295,y=u+(c<<11&4294967295|c>>>21),c=g+(y^u^f)+p[11]+1839030562&4294967295,g=y+(c<<16&4294967295|c>>>16),c=f+(g^y^u)+p[14]+4259657740&4294967295,f=g+(c<<23&4294967295|c>>>9),c=u+(f^g^y)+p[1]+2763975236&4294967295,u=f+(c<<4&4294967295|c>>>28),c=y+(u^f^g)+p[4]+1272893353&4294967295,y=u+(c<<11&4294967295|c>>>21),c=g+(y^u^f)+p[7]+4139469664&4294967295,g=y+(c<<16&4294967295|c>>>16),c=f+(g^y^u)+p[10]+3200236656&4294967295,f=g+(c<<23&4294967295|c>>>9),c=u+(f^g^y)+p[13]+681279174&4294967295,u=f+(c<<4&4294967295|c>>>28),c=y+(u^f^g)+p[0]+3936430074&4294967295,y=u+(c<<11&4294967295|c>>>21),c=g+(y^u^f)+p[3]+3572445317&4294967295,g=y+(c<<16&4294967295|c>>>16),c=f+(g^y^u)+p[6]+76029189&4294967295,f=g+(c<<23&4294967295|c>>>9),c=u+(f^g^y)+p[9]+3654602809&4294967295,u=f+(c<<4&4294967295|c>>>28),c=y+(u^f^g)+p[12]+3873151461&4294967295,y=u+(c<<11&4294967295|c>>>21),c=g+(y^u^f)+p[15]+530742520&4294967295,g=y+(c<<16&4294967295|c>>>16),c=f+(g^y^u)+p[2]+3299628645&4294967295,f=g+(c<<23&4294967295|c>>>9),c=u+(g^(f|~y))+p[0]+4096336452&4294967295,u=f+(c<<6&4294967295|c>>>26),c=y+(f^(u|~g))+p[7]+1126891415&4294967295,y=u+(c<<10&4294967295|c>>>22),c=g+(u^(y|~f))+p[14]+2878612391&4294967295,g=y+(c<<15&4294967295|c>>>17),c=f+(y^(g|~u))+p[5]+4237533241&4294967295,f=g+(c<<21&4294967295|c>>>11),c=u+(g^(f|~y))+p[12]+1700485571&4294967295,u=f+(c<<6&4294967295|c>>>26),c=y+(f^(u|~g))+p[3]+2399980690&4294967295,y=u+(c<<10&4294967295|c>>>22),c=g+(u^(y|~f))+p[10]+4293915773&4294967295,g=y+(c<<15&4294967295|c>>>17),c=f+(y^(g|~u))+p[1]+2240044497&4294967295,f=g+(c<<21&4294967295|c>>>11),c=u+(g^(f|~y))+p[8]+1873313359&4294967295,u=f+(c<<6&4294967295|c>>>26),c=y+(f^(u|~g))+p[15]+4264355552&4294967295,y=u+(c<<10&4294967295|c>>>22),c=g+(u^(y|~f))+p[6]+2734768916&4294967295,g=y+(c<<15&4294967295|c>>>17),c=f+(y^(g|~u))+p[13]+1309151649&4294967295,f=g+(c<<21&4294967295|c>>>11),c=u+(g^(f|~y))+p[4]+4149444226&4294967295,u=f+(c<<6&4294967295|c>>>26),c=y+(f^(u|~g))+p[11]+3174756917&4294967295,y=u+(c<<10&4294967295|c>>>22),c=g+(u^(y|~f))+p[2]+718787259&4294967295,g=y+(c<<15&4294967295|c>>>17),c=f+(y^(g|~u))+p[9]+3951481745&4294967295,m.g[0]=m.g[0]+u&4294967295,m.g[1]=m.g[1]+(g+(c<<21&4294967295|c>>>11))&4294967295,m.g[2]=m.g[2]+g&4294967295,m.g[3]=m.g[3]+y&4294967295}o.prototype.u=function(m,u){u===void 0&&(u=m.length);for(var f=u-this.blockSize,p=this.B,g=this.h,y=0;y<u;){if(g==0)for(;y<=f;)a(this,m,y),y+=this.blockSize;if(typeof m=="string"){for(;y<u;)if(p[g++]=m.charCodeAt(y++),g==this.blockSize){a(this,p),g=0;break}}else for(;y<u;)if(p[g++]=m[y++],g==this.blockSize){a(this,p),g=0;break}}this.h=g,this.o+=u},o.prototype.v=function(){var m=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);m[0]=128;for(var u=1;u<m.length-8;++u)m[u]=0;var f=8*this.o;for(u=m.length-8;u<m.length;++u)m[u]=f&255,f/=256;for(this.u(m),m=Array(16),u=f=0;4>u;++u)for(var p=0;32>p;p+=8)m[f++]=this.g[u]>>>p&255;return m};function l(m,u){var f=v;return Object.prototype.hasOwnProperty.call(f,m)?f[m]:f[m]=u(m)}function d(m,u){this.h=u;for(var f=[],p=!0,g=m.length-1;0<=g;g--){var y=m[g]|0;p&&y==u||(f[g]=y,p=!1)}this.g=f}var v={};function E(m){return-128<=m&&128>m?l(m,function(u){return new d([u|0],0>u?-1:0)}):new d([m|0],0>m?-1:0)}function A(m){if(isNaN(m)||!isFinite(m))return U;if(0>m)return M(A(-m));for(var u=[],f=1,p=0;m>=f;p++)u[p]=m/f|0,f*=4294967296;return new d(u,0)}function R(m,u){if(m.length==0)throw Error("number format error: empty string");if(u=u||10,2>u||36<u)throw Error("radix out of range: "+u);if(m.charAt(0)=="-")return M(R(m.substring(1),u));if(0<=m.indexOf("-"))throw Error('number format error: interior "-" character');for(var f=A(Math.pow(u,8)),p=U,g=0;g<m.length;g+=8){var y=Math.min(8,m.length-g),c=parseInt(m.substring(g,g+y),u);8>y?(y=A(Math.pow(u,y)),p=p.j(y).add(A(c))):(p=p.j(f),p=p.add(A(c)))}return p}var U=E(0),D=E(1),z=E(16777216);r=d.prototype,r.m=function(){if(F(this))return-M(this).m();for(var m=0,u=1,f=0;f<this.g.length;f++){var p=this.i(f);m+=(0<=p?p:4294967296+p)*u,u*=4294967296}return m},r.toString=function(m){if(m=m||10,2>m||36<m)throw Error("radix out of range: "+m);if(b(this))return"0";if(F(this))return"-"+M(this).toString(m);for(var u=A(Math.pow(m,6)),f=this,p="";;){var g=Z(f,u).g;f=lt(f,g.j(u));var y=((0<f.g.length?f.g[0]:f.h)>>>0).toString(m);if(f=g,b(f))return y+p;for(;6>y.length;)y="0"+y;p=y+p}},r.i=function(m){return 0>m?0:m<this.g.length?this.g[m]:this.h};function b(m){if(m.h!=0)return!1;for(var u=0;u<m.g.length;u++)if(m.g[u]!=0)return!1;return!0}function F(m){return m.h==-1}r.l=function(m){return m=lt(this,m),F(m)?-1:b(m)?0:1};function M(m){for(var u=m.g.length,f=[],p=0;p<u;p++)f[p]=~m.g[p];return new d(f,~m.h).add(D)}r.abs=function(){return F(this)?M(this):this},r.add=function(m){for(var u=Math.max(this.g.length,m.g.length),f=[],p=0,g=0;g<=u;g++){var y=p+(this.i(g)&65535)+(m.i(g)&65535),c=(y>>>16)+(this.i(g)>>>16)+(m.i(g)>>>16);p=c>>>16,y&=65535,c&=65535,f[g]=c<<16|y}return new d(f,f[f.length-1]&-2147483648?-1:0)};function lt(m,u){return m.add(M(u))}r.j=function(m){if(b(this)||b(m))return U;if(F(this))return F(m)?M(this).j(M(m)):M(M(this).j(m));if(F(m))return M(this.j(M(m)));if(0>this.l(z)&&0>m.l(z))return A(this.m()*m.m());for(var u=this.g.length+m.g.length,f=[],p=0;p<2*u;p++)f[p]=0;for(p=0;p<this.g.length;p++)for(var g=0;g<m.g.length;g++){var y=this.i(p)>>>16,c=this.i(p)&65535,ut=m.i(g)>>>16,Gt=m.i(g)&65535;f[2*p+2*g]+=c*Gt,J(f,2*p+2*g),f[2*p+2*g+1]+=y*Gt,J(f,2*p+2*g+1),f[2*p+2*g+1]+=c*ut,J(f,2*p+2*g+1),f[2*p+2*g+2]+=y*ut,J(f,2*p+2*g+2)}for(p=0;p<u;p++)f[p]=f[2*p+1]<<16|f[2*p];for(p=u;p<2*u;p++)f[p]=0;return new d(f,0)};function J(m,u){for(;(m[u]&65535)!=m[u];)m[u+1]+=m[u]>>>16,m[u]&=65535,u++}function B(m,u){this.g=m,this.h=u}function Z(m,u){if(b(u))throw Error("division by zero");if(b(m))return new B(U,U);if(F(m))return u=Z(M(m),u),new B(M(u.g),M(u.h));if(F(u))return u=Z(m,M(u)),new B(M(u.g),u.h);if(30<m.g.length){if(F(m)||F(u))throw Error("slowDivide_ only works with positive integers.");for(var f=D,p=u;0>=p.l(m);)f=At(f),p=At(p);var g=X(f,1),y=X(p,1);for(p=X(p,2),f=X(f,2);!b(p);){var c=y.add(p);0>=c.l(m)&&(g=g.add(f),y=c),p=X(p,1),f=X(f,1)}return u=lt(m,g.j(u)),new B(g,u)}for(g=U;0<=m.l(u);){for(f=Math.max(1,Math.floor(m.m()/u.m())),p=Math.ceil(Math.log(f)/Math.LN2),p=48>=p?1:Math.pow(2,p-48),y=A(f),c=y.j(u);F(c)||0<c.l(m);)f-=p,y=A(f),c=y.j(u);b(y)&&(y=D),g=g.add(y),m=lt(m,c)}return new B(g,m)}r.A=function(m){return Z(this,m).h},r.and=function(m){for(var u=Math.max(this.g.length,m.g.length),f=[],p=0;p<u;p++)f[p]=this.i(p)&m.i(p);return new d(f,this.h&m.h)},r.or=function(m){for(var u=Math.max(this.g.length,m.g.length),f=[],p=0;p<u;p++)f[p]=this.i(p)|m.i(p);return new d(f,this.h|m.h)},r.xor=function(m){for(var u=Math.max(this.g.length,m.g.length),f=[],p=0;p<u;p++)f[p]=this.i(p)^m.i(p);return new d(f,this.h^m.h)};function At(m){for(var u=m.g.length+1,f=[],p=0;p<u;p++)f[p]=m.i(p)<<1|m.i(p-1)>>>31;return new d(f,m.h)}function X(m,u){var f=u>>5;u%=32;for(var p=m.g.length-f,g=[],y=0;y<p;y++)g[y]=0<u?m.i(y+f)>>>u|m.i(y+f+1)<<32-u:m.i(y+f);return new d(g,m.h)}o.prototype.digest=o.prototype.v,o.prototype.reset=o.prototype.s,o.prototype.update=o.prototype.u,d.prototype.add=d.prototype.add,d.prototype.multiply=d.prototype.j,d.prototype.modulo=d.prototype.A,d.prototype.compare=d.prototype.l,d.prototype.toNumber=d.prototype.m,d.prototype.toString=d.prototype.toString,d.prototype.getBits=d.prototype.i,d.fromNumber=A,d.fromString=R,Vn=d}).apply(typeof Yi<"u"?Yi:typeof self<"u"?self:typeof window<"u"?window:{});var De=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var r,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(t,i,s){return t==Array.prototype||t==Object.prototype||(t[i]=s.value),t};function n(t){t=[typeof globalThis=="object"&&globalThis,t,typeof window=="object"&&window,typeof self=="object"&&self,typeof De=="object"&&De];for(var i=0;i<t.length;++i){var s=t[i];if(s&&s.Math==Math)return s}throw Error("Cannot find global object")}var o=n(this);function a(t,i){if(i)t:{var s=o;t=t.split(".");for(var h=0;h<t.length-1;h++){var _=t[h];if(!(_ in s))break t;s=s[_]}t=t[t.length-1],h=s[t],i=i(h),i!=h&&i!=null&&e(s,t,{configurable:!0,writable:!0,value:i})}}function l(t,i){t instanceof String&&(t+="");var s=0,h=!1,_={next:function(){if(!h&&s<t.length){var w=s++;return{value:i(w,t[w]),done:!1}}return h=!0,{done:!0,value:void 0}}};return _[Symbol.iterator]=function(){return _},_}a("Array.prototype.values",function(t){return t||function(){return l(this,function(i,s){return s})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var d=d||{},v=this||self;function E(t){var i=typeof t;return i=i!="object"?i:t?Array.isArray(t)?"array":i:"null",i=="array"||i=="object"&&typeof t.length=="number"}function A(t){var i=typeof t;return i=="object"&&t!=null||i=="function"}function R(t,i,s){return t.call.apply(t.bind,arguments)}function U(t,i,s){if(!t)throw Error();if(2<arguments.length){var h=Array.prototype.slice.call(arguments,2);return function(){var _=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(_,h),t.apply(i,_)}}return function(){return t.apply(i,arguments)}}function D(t,i,s){return D=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?R:U,D.apply(null,arguments)}function z(t,i){var s=Array.prototype.slice.call(arguments,1);return function(){var h=s.slice();return h.push.apply(h,arguments),t.apply(this,h)}}function b(t,i){function s(){}s.prototype=i.prototype,t.aa=i.prototype,t.prototype=new s,t.prototype.constructor=t,t.Qb=function(h,_,w){for(var I=Array(arguments.length-2),O=2;O<arguments.length;O++)I[O-2]=arguments[O];return i.prototype[_].apply(h,I)}}function F(t){const i=t.length;if(0<i){const s=Array(i);for(let h=0;h<i;h++)s[h]=t[h];return s}return[]}function M(t,i){for(let s=1;s<arguments.length;s++){const h=arguments[s];if(E(h)){const _=t.length||0,w=h.length||0;t.length=_+w;for(let I=0;I<w;I++)t[_+I]=h[I]}else t.push(h)}}class lt{constructor(i,s){this.i=i,this.j=s,this.h=0,this.g=null}get(){let i;return 0<this.h?(this.h--,i=this.g,this.g=i.next,i.next=null):i=this.i(),i}}function J(t){return/^[\s\xa0]*$/.test(t)}function B(){var t=v.navigator;return t&&(t=t.userAgent)?t:""}function Z(t){return Z[" "](t),t}Z[" "]=function(){};var At=B().indexOf("Gecko")!=-1&&!(B().toLowerCase().indexOf("webkit")!=-1&&B().indexOf("Edge")==-1)&&!(B().indexOf("Trident")!=-1||B().indexOf("MSIE")!=-1)&&B().indexOf("Edge")==-1;function X(t,i,s){for(const h in t)i.call(s,t[h],h,t)}function m(t,i){for(const s in t)i.call(void 0,t[s],s,t)}function u(t){const i={};for(const s in t)i[s]=t[s];return i}const f="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function p(t,i){let s,h;for(let _=1;_<arguments.length;_++){h=arguments[_];for(s in h)t[s]=h[s];for(let w=0;w<f.length;w++)s=f[w],Object.prototype.hasOwnProperty.call(h,s)&&(t[s]=h[s])}}function g(t){var i=1;t=t.split(":");const s=[];for(;0<i&&t.length;)s.push(t.shift()),i--;return t.length&&s.push(t.join(":")),s}function y(t){v.setTimeout(()=>{throw t},0)}function c(){var t=Xe;let i=null;return t.g&&(i=t.g,t.g=t.g.next,t.g||(t.h=null),i.next=null),i}class ut{constructor(){this.h=this.g=null}add(i,s){const h=Gt.get();h.set(i,s),this.h?this.h.next=h:this.g=h,this.h=h}}var Gt=new lt(()=>new ts,t=>t.reset());class ts{constructor(){this.next=this.g=this.h=null}set(i,s){this.h=i,this.g=s,this.next=null}reset(){this.next=this.g=this.h=null}}let Wt,zt=!1,Xe=new ut,$n=()=>{const t=v.Promise.resolve(void 0);Wt=()=>{t.then(es)}};var es=()=>{for(var t;t=c();){try{t.h.call(t.g)}catch(s){y(s)}var i=Gt;i.j(t),100>i.h&&(i.h++,t.next=i.g,i.g=t)}zt=!1};function gt(){this.s=this.s,this.C=this.C}gt.prototype.s=!1,gt.prototype.ma=function(){this.s||(this.s=!0,this.N())},gt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function H(t,i){this.type=t,this.g=this.target=i,this.defaultPrevented=!1}H.prototype.h=function(){this.defaultPrevented=!0};var ns=function(){if(!v.addEventListener||!Object.defineProperty)return!1;var t=!1,i=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const s=()=>{};v.addEventListener("test",s,i),v.removeEventListener("test",s,i)}catch{}return t}();function qt(t,i){if(H.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t){var s=this.type=t.type,h=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;if(this.target=t.target||t.srcElement,this.g=i,i=t.relatedTarget){if(At){t:{try{Z(i.nodeName);var _=!0;break t}catch{}_=!1}_||(i=null)}}else s=="mouseover"?i=t.fromElement:s=="mouseout"&&(i=t.toElement);this.relatedTarget=i,h?(this.clientX=h.clientX!==void 0?h.clientX:h.pageX,this.clientY=h.clientY!==void 0?h.clientY:h.pageY,this.screenX=h.screenX||0,this.screenY=h.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=typeof t.pointerType=="string"?t.pointerType:is[t.pointerType]||"",this.state=t.state,this.i=t,t.defaultPrevented&&qt.aa.h.call(this)}}b(qt,H);var is={2:"touch",3:"pen",4:"mouse"};qt.prototype.h=function(){qt.aa.h.call(this);var t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var me="closure_listenable_"+(1e6*Math.random()|0),rs=0;function ss(t,i,s,h,_){this.listener=t,this.proxy=null,this.src=i,this.type=s,this.capture=!!h,this.ha=_,this.key=++rs,this.da=this.fa=!1}function _e(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function ye(t){this.src=t,this.g={},this.h=0}ye.prototype.add=function(t,i,s,h,_){var w=t.toString();t=this.g[w],t||(t=this.g[w]=[],this.h++);var I=Ye(t,i,h,_);return-1<I?(i=t[I],s||(i.fa=!1)):(i=new ss(i,this.src,w,!!h,_),i.fa=s,t.push(i)),i};function Je(t,i){var s=i.type;if(s in t.g){var h=t.g[s],_=Array.prototype.indexOf.call(h,i,void 0),w;(w=0<=_)&&Array.prototype.splice.call(h,_,1),w&&(_e(i),t.g[s].length==0&&(delete t.g[s],t.h--))}}function Ye(t,i,s,h){for(var _=0;_<t.length;++_){var w=t[_];if(!w.da&&w.listener==i&&w.capture==!!s&&w.ha==h)return _}return-1}var Qe="closure_lm_"+(1e6*Math.random()|0),Ze={};function Gn(t,i,s,h,_){if(Array.isArray(i)){for(var w=0;w<i.length;w++)Gn(t,i[w],s,h,_);return null}return s=qn(s),t&&t[me]?t.K(i,s,A(h)?!!h.capture:!1,_):os(t,i,s,!1,h,_)}function os(t,i,s,h,_,w){if(!i)throw Error("Invalid event type");var I=A(_)?!!_.capture:!!_,O=en(t);if(O||(t[Qe]=O=new ye(t)),s=O.add(i,s,h,I,w),s.proxy)return s;if(h=as(),s.proxy=h,h.src=t,h.listener=s,t.addEventListener)ns||(_=I),_===void 0&&(_=!1),t.addEventListener(i.toString(),h,_);else if(t.attachEvent)t.attachEvent(zn(i.toString()),h);else if(t.addListener&&t.removeListener)t.addListener(h);else throw Error("addEventListener and attachEvent are unavailable.");return s}function as(){function t(s){return i.call(t.src,t.listener,s)}const i=hs;return t}function Wn(t,i,s,h,_){if(Array.isArray(i))for(var w=0;w<i.length;w++)Wn(t,i[w],s,h,_);else h=A(h)?!!h.capture:!!h,s=qn(s),t&&t[me]?(t=t.i,i=String(i).toString(),i in t.g&&(w=t.g[i],s=Ye(w,s,h,_),-1<s&&(_e(w[s]),Array.prototype.splice.call(w,s,1),w.length==0&&(delete t.g[i],t.h--)))):t&&(t=en(t))&&(i=t.g[i.toString()],t=-1,i&&(t=Ye(i,s,h,_)),(s=-1<t?i[t]:null)&&tn(s))}function tn(t){if(typeof t!="number"&&t&&!t.da){var i=t.src;if(i&&i[me])Je(i.i,t);else{var s=t.type,h=t.proxy;i.removeEventListener?i.removeEventListener(s,h,t.capture):i.detachEvent?i.detachEvent(zn(s),h):i.addListener&&i.removeListener&&i.removeListener(h),(s=en(i))?(Je(s,t),s.h==0&&(s.src=null,i[Qe]=null)):_e(t)}}}function zn(t){return t in Ze?Ze[t]:Ze[t]="on"+t}function hs(t,i){if(t.da)t=!0;else{i=new qt(i,this);var s=t.listener,h=t.ha||t.src;t.fa&&tn(t),t=s.call(h,i)}return t}function en(t){return t=t[Qe],t instanceof ye?t:null}var nn="__closure_events_fn_"+(1e9*Math.random()>>>0);function qn(t){return typeof t=="function"?t:(t[nn]||(t[nn]=function(i){return t.handleEvent(i)}),t[nn])}function $(){gt.call(this),this.i=new ye(this),this.M=this,this.F=null}b($,gt),$.prototype[me]=!0,$.prototype.removeEventListener=function(t,i,s,h){Wn(this,t,i,s,h)};function q(t,i){var s,h=t.F;if(h)for(s=[];h;h=h.F)s.push(h);if(t=t.M,h=i.type||i,typeof i=="string")i=new H(i,t);else if(i instanceof H)i.target=i.target||t;else{var _=i;i=new H(h,t),p(i,_)}if(_=!0,s)for(var w=s.length-1;0<=w;w--){var I=i.g=s[w];_=ve(I,h,!0,i)&&_}if(I=i.g=t,_=ve(I,h,!0,i)&&_,_=ve(I,h,!1,i)&&_,s)for(w=0;w<s.length;w++)I=i.g=s[w],_=ve(I,h,!1,i)&&_}$.prototype.N=function(){if($.aa.N.call(this),this.i){var t=this.i,i;for(i in t.g){for(var s=t.g[i],h=0;h<s.length;h++)_e(s[h]);delete t.g[i],t.h--}}this.F=null},$.prototype.K=function(t,i,s,h){return this.i.add(String(t),i,!1,s,h)},$.prototype.L=function(t,i,s,h){return this.i.add(String(t),i,!0,s,h)};function ve(t,i,s,h){if(i=t.i.g[String(i)],!i)return!0;i=i.concat();for(var _=!0,w=0;w<i.length;++w){var I=i[w];if(I&&!I.da&&I.capture==s){var O=I.listener,j=I.ha||I.src;I.fa&&Je(t.i,I),_=O.call(j,h)!==!1&&_}}return _&&!h.defaultPrevented}function Kn(t,i,s){if(typeof t=="function")s&&(t=D(t,s));else if(t&&typeof t.handleEvent=="function")t=D(t.handleEvent,t);else throw Error("Invalid listener argument");return 2147483647<Number(i)?-1:v.setTimeout(t,i||0)}function Xn(t){t.g=Kn(()=>{t.g=null,t.i&&(t.i=!1,Xn(t))},t.l);const i=t.h;t.h=null,t.m.apply(null,i)}class ls extends gt{constructor(i,s){super(),this.m=i,this.l=s,this.h=null,this.i=!1,this.g=null}j(i){this.h=arguments,this.g?this.i=!0:Xn(this)}N(){super.N(),this.g&&(v.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Kt(t){gt.call(this),this.h=t,this.g={}}b(Kt,gt);var Jn=[];function Yn(t){X(t.g,function(i,s){this.g.hasOwnProperty(s)&&tn(i)},t),t.g={}}Kt.prototype.N=function(){Kt.aa.N.call(this),Yn(this)},Kt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var rn=v.JSON.stringify,us=v.JSON.parse,cs=class{stringify(t){return v.JSON.stringify(t,void 0)}parse(t){return v.JSON.parse(t,void 0)}};function sn(){}sn.prototype.h=null;function Qn(t){return t.h||(t.h=t.i())}function fs(){}var Xt={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function on(){H.call(this,"d")}b(on,H);function an(){H.call(this,"c")}b(an,H);var Lt={},Zn=null;function hn(){return Zn=Zn||new $}Lt.La="serverreachability";function ti(t){H.call(this,Lt.La,t)}b(ti,H);function Jt(t){const i=hn();q(i,new ti(i))}Lt.STAT_EVENT="statevent";function ei(t,i){H.call(this,Lt.STAT_EVENT,t),this.stat=i}b(ei,H);function K(t){const i=hn();q(i,new ei(i,t))}Lt.Ma="timingevent";function ni(t,i){H.call(this,Lt.Ma,t),this.size=i}b(ni,H);function Yt(t,i){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return v.setTimeout(function(){t()},i)}function Qt(){this.g=!0}Qt.prototype.xa=function(){this.g=!1};function ds(t,i,s,h,_,w){t.info(function(){if(t.g)if(w)for(var I="",O=w.split("&"),j=0;j<O.length;j++){var S=O[j].split("=");if(1<S.length){var G=S[0];S=S[1];var W=G.split("_");I=2<=W.length&&W[1]=="type"?I+(G+"="+S+"&"):I+(G+"=redacted&")}}else I=null;else I=w;return"XMLHTTP REQ ("+h+") [attempt "+_+"]: "+i+`
`+s+`
`+I})}function ps(t,i,s,h,_,w,I){t.info(function(){return"XMLHTTP RESP ("+h+") [ attempt "+_+"]: "+i+`
`+s+`
`+w+" "+I})}function Mt(t,i,s,h){t.info(function(){return"XMLHTTP TEXT ("+i+"): "+ms(t,s)+(h?" "+h:"")})}function gs(t,i){t.info(function(){return"TIMEOUT: "+i})}Qt.prototype.info=function(){};function ms(t,i){if(!t.g)return i;if(!i)return null;try{var s=JSON.parse(i);if(s){for(t=0;t<s.length;t++)if(Array.isArray(s[t])){var h=s[t];if(!(2>h.length)){var _=h[1];if(Array.isArray(_)&&!(1>_.length)){var w=_[0];if(w!="noop"&&w!="stop"&&w!="close")for(var I=1;I<_.length;I++)_[I]=""}}}}return rn(s)}catch{return i}}var ln={NO_ERROR:0,TIMEOUT:8},_s={},un;function we(){}b(we,sn),we.prototype.g=function(){return new XMLHttpRequest},we.prototype.i=function(){return{}},un=new we;function mt(t,i,s,h){this.j=t,this.i=i,this.l=s,this.R=h||1,this.U=new Kt(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new ii}function ii(){this.i=null,this.g="",this.h=!1}var ri={},cn={};function fn(t,i,s){t.L=1,t.v=Te(ct(i)),t.m=s,t.P=!0,si(t,null)}function si(t,i){t.F=Date.now(),Ee(t),t.A=ct(t.v);var s=t.A,h=t.R;Array.isArray(h)||(h=[String(h)]),vi(s.i,"t",h),t.C=0,s=t.j.J,t.h=new ii,t.g=xi(t.j,s?i:null,!t.m),0<t.O&&(t.M=new ls(D(t.Y,t,t.g),t.O)),i=t.U,s=t.g,h=t.ca;var _="readystatechange";Array.isArray(_)||(_&&(Jn[0]=_.toString()),_=Jn);for(var w=0;w<_.length;w++){var I=Gn(s,_[w],h||i.handleEvent,!1,i.h||i);if(!I)break;i.g[I.key]=I}i=t.H?u(t.H):{},t.m?(t.u||(t.u="POST"),i["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.A,t.u,t.m,i)):(t.u="GET",t.g.ea(t.A,t.u,null,i)),Jt(),ds(t.i,t.u,t.A,t.l,t.R,t.m)}mt.prototype.ca=function(t){t=t.target;const i=this.M;i&&ft(t)==3?i.j():this.Y(t)},mt.prototype.Y=function(t){try{if(t==this.g)t:{const W=ft(this.g);var i=this.g.Ba();const Vt=this.g.Z();if(!(3>W)&&(W!=3||this.g&&(this.h.h||this.g.oa()||bi(this.g)))){this.J||W!=4||i==7||(i==8||0>=Vt?Jt(3):Jt(2)),dn(this);var s=this.g.Z();this.X=s;e:if(oi(this)){var h=bi(this.g);t="";var _=h.length,w=ft(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Tt(this),Zt(this);var I="";break e}this.h.i=new v.TextDecoder}for(i=0;i<_;i++)this.h.h=!0,t+=this.h.i.decode(h[i],{stream:!(w&&i==_-1)});h.length=0,this.h.g+=t,this.C=0,I=this.h.g}else I=this.g.oa();if(this.o=s==200,ps(this.i,this.u,this.A,this.l,this.R,W,s),this.o){if(this.T&&!this.K){e:{if(this.g){var O,j=this.g;if((O=j.g?j.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!J(O)){var S=O;break e}}S=null}if(s=S)Mt(this.i,this.l,s,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,pn(this,s);else{this.o=!1,this.s=3,K(12),Tt(this),Zt(this);break t}}if(this.P){s=!0;let tt;for(;!this.J&&this.C<I.length;)if(tt=ys(this,I),tt==cn){W==4&&(this.s=4,K(14),s=!1),Mt(this.i,this.l,null,"[Incomplete Response]");break}else if(tt==ri){this.s=4,K(15),Mt(this.i,this.l,I,"[Invalid Chunk]"),s=!1;break}else Mt(this.i,this.l,tt,null),pn(this,tt);if(oi(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),W!=4||I.length!=0||this.h.h||(this.s=1,K(16),s=!1),this.o=this.o&&s,!s)Mt(this.i,this.l,I,"[Invalid Chunked Response]"),Tt(this),Zt(this);else if(0<I.length&&!this.W){this.W=!0;var G=this.j;G.g==this&&G.ba&&!G.M&&(G.j.info("Great, no buffering proxy detected. Bytes received: "+I.length),wn(G),G.M=!0,K(11))}}else Mt(this.i,this.l,I,null),pn(this,I);W==4&&Tt(this),this.o&&!this.J&&(W==4?Oi(this.j,this):(this.o=!1,Ee(this)))}else Ms(this.g),s==400&&0<I.indexOf("Unknown SID")?(this.s=3,K(12)):(this.s=0,K(13)),Tt(this),Zt(this)}}}catch{}finally{}};function oi(t){return t.g?t.u=="GET"&&t.L!=2&&t.j.Ca:!1}function ys(t,i){var s=t.C,h=i.indexOf(`
`,s);return h==-1?cn:(s=Number(i.substring(s,h)),isNaN(s)?ri:(h+=1,h+s>i.length?cn:(i=i.slice(h,h+s),t.C=h+s,i)))}mt.prototype.cancel=function(){this.J=!0,Tt(this)};function Ee(t){t.S=Date.now()+t.I,ai(t,t.I)}function ai(t,i){if(t.B!=null)throw Error("WatchDog timer not null");t.B=Yt(D(t.ba,t),i)}function dn(t){t.B&&(v.clearTimeout(t.B),t.B=null)}mt.prototype.ba=function(){this.B=null;const t=Date.now();0<=t-this.S?(gs(this.i,this.A),this.L!=2&&(Jt(),K(17)),Tt(this),this.s=2,Zt(this)):ai(this,this.S-t)};function Zt(t){t.j.G==0||t.J||Oi(t.j,t)}function Tt(t){dn(t);var i=t.M;i&&typeof i.ma=="function"&&i.ma(),t.M=null,Yn(t.U),t.g&&(i=t.g,t.g=null,i.abort(),i.ma())}function pn(t,i){try{var s=t.j;if(s.G!=0&&(s.g==t||gn(s.h,t))){if(!t.K&&gn(s.h,t)&&s.G==3){try{var h=s.Da.g.parse(i)}catch{h=null}if(Array.isArray(h)&&h.length==3){var _=h;if(_[0]==0){t:if(!s.u){if(s.g)if(s.g.F+3e3<t.F)Re(s),Ce(s);else break t;vn(s),K(18)}}else s.za=_[1],0<s.za-s.T&&37500>_[2]&&s.F&&s.v==0&&!s.C&&(s.C=Yt(D(s.Za,s),6e3));if(1>=ui(s.h)&&s.ca){try{s.ca()}catch{}s.ca=void 0}}else bt(s,11)}else if((t.K||s.g==t)&&Re(s),!J(i))for(_=s.Da.g.parse(i),i=0;i<_.length;i++){let S=_[i];if(s.T=S[0],S=S[1],s.G==2)if(S[0]=="c"){s.K=S[1],s.ia=S[2];const G=S[3];G!=null&&(s.la=G,s.j.info("VER="+s.la));const W=S[4];W!=null&&(s.Aa=W,s.j.info("SVER="+s.Aa));const Vt=S[5];Vt!=null&&typeof Vt=="number"&&0<Vt&&(h=1.5*Vt,s.L=h,s.j.info("backChannelRequestTimeoutMs_="+h)),h=s;const tt=t.g;if(tt){const ke=tt.g?tt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(ke){var w=h.h;w.g||ke.indexOf("spdy")==-1&&ke.indexOf("quic")==-1&&ke.indexOf("h2")==-1||(w.j=w.l,w.g=new Set,w.h&&(mn(w,w.h),w.h=null))}if(h.D){const En=tt.g?tt.g.getResponseHeader("X-HTTP-Session-Id"):null;En&&(h.ya=En,L(h.I,h.D,En))}}s.G=3,s.l&&s.l.ua(),s.ba&&(s.R=Date.now()-t.F,s.j.info("Handshake RTT: "+s.R+"ms")),h=s;var I=t;if(h.qa=Ui(h,h.J?h.ia:null,h.W),I.K){ci(h.h,I);var O=I,j=h.L;j&&(O.I=j),O.B&&(dn(O),Ee(O)),h.g=I}else ki(h);0<s.i.length&&Ne(s)}else S[0]!="stop"&&S[0]!="close"||bt(s,7);else s.G==3&&(S[0]=="stop"||S[0]=="close"?S[0]=="stop"?bt(s,7):yn(s):S[0]!="noop"&&s.l&&s.l.ta(S),s.v=0)}}Jt(4)}catch{}}var vs=class{constructor(t,i){this.g=t,this.map=i}};function hi(t){this.l=t||10,v.PerformanceNavigationTiming?(t=v.performance.getEntriesByType("navigation"),t=0<t.length&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(v.chrome&&v.chrome.loadTimes&&v.chrome.loadTimes()&&v.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function li(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function ui(t){return t.h?1:t.g?t.g.size:0}function gn(t,i){return t.h?t.h==i:t.g?t.g.has(i):!1}function mn(t,i){t.g?t.g.add(i):t.h=i}function ci(t,i){t.h&&t.h==i?t.h=null:t.g&&t.g.has(i)&&t.g.delete(i)}hi.prototype.cancel=function(){if(this.i=fi(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function fi(t){if(t.h!=null)return t.i.concat(t.h.D);if(t.g!=null&&t.g.size!==0){let i=t.i;for(const s of t.g.values())i=i.concat(s.D);return i}return F(t.i)}function ws(t){if(t.V&&typeof t.V=="function")return t.V();if(typeof Map<"u"&&t instanceof Map||typeof Set<"u"&&t instanceof Set)return Array.from(t.values());if(typeof t=="string")return t.split("");if(E(t)){for(var i=[],s=t.length,h=0;h<s;h++)i.push(t[h]);return i}i=[],s=0;for(h in t)i[s++]=t[h];return i}function Es(t){if(t.na&&typeof t.na=="function")return t.na();if(!t.V||typeof t.V!="function"){if(typeof Map<"u"&&t instanceof Map)return Array.from(t.keys());if(!(typeof Set<"u"&&t instanceof Set)){if(E(t)||typeof t=="string"){var i=[];t=t.length;for(var s=0;s<t;s++)i.push(s);return i}i=[],s=0;for(const h in t)i[s++]=h;return i}}}function di(t,i){if(t.forEach&&typeof t.forEach=="function")t.forEach(i,void 0);else if(E(t)||typeof t=="string")Array.prototype.forEach.call(t,i,void 0);else for(var s=Es(t),h=ws(t),_=h.length,w=0;w<_;w++)i.call(void 0,h[w],s&&s[w],t)}var pi=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Is(t,i){if(t){t=t.split("&");for(var s=0;s<t.length;s++){var h=t[s].indexOf("="),_=null;if(0<=h){var w=t[s].substring(0,h);_=t[s].substring(h+1)}else w=t[s];i(w,_?decodeURIComponent(_.replace(/\+/g," ")):"")}}}function St(t){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,t instanceof St){this.h=t.h,Ie(this,t.j),this.o=t.o,this.g=t.g,Ae(this,t.s),this.l=t.l;var i=t.i,s=new ne;s.i=i.i,i.g&&(s.g=new Map(i.g),s.h=i.h),gi(this,s),this.m=t.m}else t&&(i=String(t).match(pi))?(this.h=!1,Ie(this,i[1]||"",!0),this.o=te(i[2]||""),this.g=te(i[3]||"",!0),Ae(this,i[4]),this.l=te(i[5]||"",!0),gi(this,i[6]||"",!0),this.m=te(i[7]||"")):(this.h=!1,this.i=new ne(null,this.h))}St.prototype.toString=function(){var t=[],i=this.j;i&&t.push(ee(i,mi,!0),":");var s=this.g;return(s||i=="file")&&(t.push("//"),(i=this.o)&&t.push(ee(i,mi,!0),"@"),t.push(encodeURIComponent(String(s)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),s=this.s,s!=null&&t.push(":",String(s))),(s=this.l)&&(this.g&&s.charAt(0)!="/"&&t.push("/"),t.push(ee(s,s.charAt(0)=="/"?Ss:Ts,!0))),(s=this.i.toString())&&t.push("?",s),(s=this.m)&&t.push("#",ee(s,Ps)),t.join("")};function ct(t){return new St(t)}function Ie(t,i,s){t.j=s?te(i,!0):i,t.j&&(t.j=t.j.replace(/:$/,""))}function Ae(t,i){if(i){if(i=Number(i),isNaN(i)||0>i)throw Error("Bad port number "+i);t.s=i}else t.s=null}function gi(t,i,s){i instanceof ne?(t.i=i,Cs(t.i,t.h)):(s||(i=ee(i,bs)),t.i=new ne(i,t.h))}function L(t,i,s){t.i.set(i,s)}function Te(t){return L(t,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),t}function te(t,i){return t?i?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function ee(t,i,s){return typeof t=="string"?(t=encodeURI(t).replace(i,As),s&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function As(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var mi=/[#\/\?@]/g,Ts=/[#\?:]/g,Ss=/[#\?]/g,bs=/[#\?@]/g,Ps=/#/g;function ne(t,i){this.h=this.g=null,this.i=t||null,this.j=!!i}function _t(t){t.g||(t.g=new Map,t.h=0,t.i&&Is(t.i,function(i,s){t.add(decodeURIComponent(i.replace(/\+/g," ")),s)}))}r=ne.prototype,r.add=function(t,i){_t(this),this.i=null,t=Ut(this,t);var s=this.g.get(t);return s||this.g.set(t,s=[]),s.push(i),this.h+=1,this};function _i(t,i){_t(t),i=Ut(t,i),t.g.has(i)&&(t.i=null,t.h-=t.g.get(i).length,t.g.delete(i))}function yi(t,i){return _t(t),i=Ut(t,i),t.g.has(i)}r.forEach=function(t,i){_t(this),this.g.forEach(function(s,h){s.forEach(function(_){t.call(i,_,h,this)},this)},this)},r.na=function(){_t(this);const t=Array.from(this.g.values()),i=Array.from(this.g.keys()),s=[];for(let h=0;h<i.length;h++){const _=t[h];for(let w=0;w<_.length;w++)s.push(i[h])}return s},r.V=function(t){_t(this);let i=[];if(typeof t=="string")yi(this,t)&&(i=i.concat(this.g.get(Ut(this,t))));else{t=Array.from(this.g.values());for(let s=0;s<t.length;s++)i=i.concat(t[s])}return i},r.set=function(t,i){return _t(this),this.i=null,t=Ut(this,t),yi(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[i]),this.h+=1,this},r.get=function(t,i){return t?(t=this.V(t),0<t.length?String(t[0]):i):i};function vi(t,i,s){_i(t,i),0<s.length&&(t.i=null,t.g.set(Ut(t,i),F(s)),t.h+=s.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],i=Array.from(this.g.keys());for(var s=0;s<i.length;s++){var h=i[s];const w=encodeURIComponent(String(h)),I=this.V(h);for(h=0;h<I.length;h++){var _=w;I[h]!==""&&(_+="="+encodeURIComponent(String(I[h]))),t.push(_)}}return this.i=t.join("&")};function Ut(t,i){return i=String(i),t.j&&(i=i.toLowerCase()),i}function Cs(t,i){i&&!t.j&&(_t(t),t.i=null,t.g.forEach(function(s,h){var _=h.toLowerCase();h!=_&&(_i(this,h),vi(this,_,s))},t)),t.j=i}function Ns(t,i){const s=new Qt;if(v.Image){const h=new Image;h.onload=z(yt,s,"TestLoadImage: loaded",!0,i,h),h.onerror=z(yt,s,"TestLoadImage: error",!1,i,h),h.onabort=z(yt,s,"TestLoadImage: abort",!1,i,h),h.ontimeout=z(yt,s,"TestLoadImage: timeout",!1,i,h),v.setTimeout(function(){h.ontimeout&&h.ontimeout()},1e4),h.src=t}else i(!1)}function Rs(t,i){const s=new Qt,h=new AbortController,_=setTimeout(()=>{h.abort(),yt(s,"TestPingServer: timeout",!1,i)},1e4);fetch(t,{signal:h.signal}).then(w=>{clearTimeout(_),w.ok?yt(s,"TestPingServer: ok",!0,i):yt(s,"TestPingServer: server error",!1,i)}).catch(()=>{clearTimeout(_),yt(s,"TestPingServer: error",!1,i)})}function yt(t,i,s,h,_){try{_&&(_.onload=null,_.onerror=null,_.onabort=null,_.ontimeout=null),h(s)}catch{}}function ks(){this.g=new cs}function Ds(t,i,s){const h=s||"";try{di(t,function(_,w){let I=_;A(_)&&(I=rn(_)),i.push(h+w+"="+encodeURIComponent(I))})}catch(_){throw i.push(h+"type="+encodeURIComponent("_badmap")),_}}function Se(t){this.l=t.Ub||null,this.j=t.eb||!1}b(Se,sn),Se.prototype.g=function(){return new be(this.l,this.j)},Se.prototype.i=function(t){return function(){return t}}({});function be(t,i){$.call(this),this.D=t,this.o=i,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}b(be,$),r=be.prototype,r.open=function(t,i){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=t,this.A=i,this.readyState=1,re(this)},r.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const i={headers:this.u,method:this.B,credentials:this.m,cache:void 0};t&&(i.body=t),(this.D||v).fetch(new Request(this.A,i)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,ie(this)),this.readyState=0},r.Sa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,re(this)),this.g&&(this.readyState=3,re(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof v.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;wi(this)}else t.text().then(this.Ra.bind(this),this.ga.bind(this))};function wi(t){t.j.read().then(t.Pa.bind(t)).catch(t.ga.bind(t))}r.Pa=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var i=t.value?t.value:new Uint8Array(0);(i=this.v.decode(i,{stream:!t.done}))&&(this.response=this.responseText+=i)}t.done?ie(this):re(this),this.readyState==3&&wi(this)}},r.Ra=function(t){this.g&&(this.response=this.responseText=t,ie(this))},r.Qa=function(t){this.g&&(this.response=t,ie(this))},r.ga=function(){this.g&&ie(this)};function ie(t){t.readyState=4,t.l=null,t.j=null,t.v=null,re(t)}r.setRequestHeader=function(t,i){this.u.append(t,i)},r.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],i=this.h.entries();for(var s=i.next();!s.done;)s=s.value,t.push(s[0]+": "+s[1]),s=i.next();return t.join(`\r
`)};function re(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(be.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});function Ei(t){let i="";return X(t,function(s,h){i+=h,i+=":",i+=s,i+=`\r
`}),i}function _n(t,i,s){t:{for(h in s){var h=!1;break t}h=!0}h||(s=Ei(s),typeof t=="string"?s!=null&&encodeURIComponent(String(s)):L(t,i,s))}function x(t){$.call(this),this.headers=new Map,this.o=t||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}b(x,$);var Os=/^https?$/i,Ls=["POST","PUT"];r=x.prototype,r.Ha=function(t){this.J=t},r.ea=function(t,i,s,h){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);i=i?i.toUpperCase():"GET",this.D=t,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():un.g(),this.v=this.o?Qn(this.o):Qn(un),this.g.onreadystatechange=D(this.Ea,this);try{this.B=!0,this.g.open(i,String(t),!0),this.B=!1}catch(w){Ii(this,w);return}if(t=s||"",s=new Map(this.headers),h)if(Object.getPrototypeOf(h)===Object.prototype)for(var _ in h)s.set(_,h[_]);else if(typeof h.keys=="function"&&typeof h.get=="function")for(const w of h.keys())s.set(w,h.get(w));else throw Error("Unknown input type for opt_headers: "+String(h));h=Array.from(s.keys()).find(w=>w.toLowerCase()=="content-type"),_=v.FormData&&t instanceof v.FormData,!(0<=Array.prototype.indexOf.call(Ls,i,void 0))||h||_||s.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[w,I]of s)this.g.setRequestHeader(w,I);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Si(this),this.u=!0,this.g.send(t),this.u=!1}catch(w){Ii(this,w)}};function Ii(t,i){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=i,t.m=5,Ai(t),Pe(t)}function Ai(t){t.A||(t.A=!0,q(t,"complete"),q(t,"error"))}r.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=t||7,q(this,"complete"),q(this,"abort"),Pe(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Pe(this,!0)),x.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?Ti(this):this.bb())},r.bb=function(){Ti(this)};function Ti(t){if(t.h&&typeof d<"u"&&(!t.v[1]||ft(t)!=4||t.Z()!=2)){if(t.u&&ft(t)==4)Kn(t.Ea,0,t);else if(q(t,"readystatechange"),ft(t)==4){t.h=!1;try{const I=t.Z();t:switch(I){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var i=!0;break t;default:i=!1}var s;if(!(s=i)){var h;if(h=I===0){var _=String(t.D).match(pi)[1]||null;!_&&v.self&&v.self.location&&(_=v.self.location.protocol.slice(0,-1)),h=!Os.test(_?_.toLowerCase():"")}s=h}if(s)q(t,"complete"),q(t,"success");else{t.m=6;try{var w=2<ft(t)?t.g.statusText:""}catch{w=""}t.l=w+" ["+t.Z()+"]",Ai(t)}}finally{Pe(t)}}}}function Pe(t,i){if(t.g){Si(t);const s=t.g,h=t.v[0]?()=>{}:null;t.g=null,t.v=null,i||q(t,"ready");try{s.onreadystatechange=h}catch{}}}function Si(t){t.I&&(v.clearTimeout(t.I),t.I=null)}r.isActive=function(){return!!this.g};function ft(t){return t.g?t.g.readyState:0}r.Z=function(){try{return 2<ft(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(t){if(this.g){var i=this.g.responseText;return t&&i.indexOf(t)==0&&(i=i.substring(t.length)),us(i)}};function bi(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.H){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function Ms(t){const i={};t=(t.g&&2<=ft(t)&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let h=0;h<t.length;h++){if(J(t[h]))continue;var s=g(t[h]);const _=s[0];if(s=s[1],typeof s!="string")continue;s=s.trim();const w=i[_]||[];i[_]=w,w.push(s)}m(i,function(h){return h.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function se(t,i,s){return s&&s.internalChannelParams&&s.internalChannelParams[t]||i}function Pi(t){this.Aa=0,this.i=[],this.j=new Qt,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=se("failFast",!1,t),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=se("baseRetryDelayMs",5e3,t),this.cb=se("retryDelaySeedMs",1e4,t),this.Wa=se("forwardChannelMaxRetries",2,t),this.wa=se("forwardChannelRequestTimeoutMs",2e4,t),this.pa=t&&t.xmlHttpFactory||void 0,this.Xa=t&&t.Tb||void 0,this.Ca=t&&t.useFetchStreams||!1,this.L=void 0,this.J=t&&t.supportsCrossDomainXhr||!1,this.K="",this.h=new hi(t&&t.concurrentRequestLimit),this.Da=new ks,this.P=t&&t.fastHandshake||!1,this.O=t&&t.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=t&&t.Rb||!1,t&&t.xa&&this.j.xa(),t&&t.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&t&&t.detectBufferingProxy||!1,this.ja=void 0,t&&t.longPollingTimeout&&0<t.longPollingTimeout&&(this.ja=t.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=Pi.prototype,r.la=8,r.G=1,r.connect=function(t,i,s,h){K(0),this.W=t,this.H=i||{},s&&h!==void 0&&(this.H.OSID=s,this.H.OAID=h),this.F=this.X,this.I=Ui(this,null,this.W),Ne(this)};function yn(t){if(Ci(t),t.G==3){var i=t.U++,s=ct(t.I);if(L(s,"SID",t.K),L(s,"RID",i),L(s,"TYPE","terminate"),oe(t,s),i=new mt(t,t.j,i),i.L=2,i.v=Te(ct(s)),s=!1,v.navigator&&v.navigator.sendBeacon)try{s=v.navigator.sendBeacon(i.v.toString(),"")}catch{}!s&&v.Image&&(new Image().src=i.v,s=!0),s||(i.g=xi(i.j,null),i.g.ea(i.v)),i.F=Date.now(),Ee(i)}Mi(t)}function Ce(t){t.g&&(wn(t),t.g.cancel(),t.g=null)}function Ci(t){Ce(t),t.u&&(v.clearTimeout(t.u),t.u=null),Re(t),t.h.cancel(),t.s&&(typeof t.s=="number"&&v.clearTimeout(t.s),t.s=null)}function Ne(t){if(!li(t.h)&&!t.s){t.s=!0;var i=t.Ga;Wt||$n(),zt||(Wt(),zt=!0),Xe.add(i,t),t.B=0}}function Us(t,i){return ui(t.h)>=t.h.j-(t.s?1:0)?!1:t.s?(t.i=i.D.concat(t.i),!0):t.G==1||t.G==2||t.B>=(t.Va?0:t.Wa)?!1:(t.s=Yt(D(t.Ga,t,i),Li(t,t.B)),t.B++,!0)}r.Ga=function(t){if(this.s)if(this.s=null,this.G==1){if(!t){this.U=Math.floor(1e5*Math.random()),t=this.U++;const _=new mt(this,this.j,t);let w=this.o;if(this.S&&(w?(w=u(w),p(w,this.S)):w=this.S),this.m!==null||this.O||(_.H=w,w=null),this.P)t:{for(var i=0,s=0;s<this.i.length;s++){e:{var h=this.i[s];if("__data__"in h.map&&(h=h.map.__data__,typeof h=="string")){h=h.length;break e}h=void 0}if(h===void 0)break;if(i+=h,4096<i){i=s;break t}if(i===4096||s===this.i.length-1){i=s+1;break t}}i=1e3}else i=1e3;i=Ri(this,_,i),s=ct(this.I),L(s,"RID",t),L(s,"CVER",22),this.D&&L(s,"X-HTTP-Session-Id",this.D),oe(this,s),w&&(this.O?i="headers="+encodeURIComponent(String(Ei(w)))+"&"+i:this.m&&_n(s,this.m,w)),mn(this.h,_),this.Ua&&L(s,"TYPE","init"),this.P?(L(s,"$req",i),L(s,"SID","null"),_.T=!0,fn(_,s,null)):fn(_,s,i),this.G=2}}else this.G==3&&(t?Ni(this,t):this.i.length==0||li(this.h)||Ni(this))};function Ni(t,i){var s;i?s=i.l:s=t.U++;const h=ct(t.I);L(h,"SID",t.K),L(h,"RID",s),L(h,"AID",t.T),oe(t,h),t.m&&t.o&&_n(h,t.m,t.o),s=new mt(t,t.j,s,t.B+1),t.m===null&&(s.H=t.o),i&&(t.i=i.D.concat(t.i)),i=Ri(t,s,1e3),s.I=Math.round(.5*t.wa)+Math.round(.5*t.wa*Math.random()),mn(t.h,s),fn(s,h,i)}function oe(t,i){t.H&&X(t.H,function(s,h){L(i,h,s)}),t.l&&di({},function(s,h){L(i,h,s)})}function Ri(t,i,s){s=Math.min(t.i.length,s);var h=t.l?D(t.l.Na,t.l,t):null;t:{var _=t.i;let w=-1;for(;;){const I=["count="+s];w==-1?0<s?(w=_[0].g,I.push("ofs="+w)):w=0:I.push("ofs="+w);let O=!0;for(let j=0;j<s;j++){let S=_[j].g;const G=_[j].map;if(S-=w,0>S)w=Math.max(0,_[j].g-100),O=!1;else try{Ds(G,I,"req"+S+"_")}catch{h&&h(G)}}if(O){h=I.join("&");break t}}}return t=t.i.splice(0,s),i.D=t,h}function ki(t){if(!t.g&&!t.u){t.Y=1;var i=t.Fa;Wt||$n(),zt||(Wt(),zt=!0),Xe.add(i,t),t.v=0}}function vn(t){return t.g||t.u||3<=t.v?!1:(t.Y++,t.u=Yt(D(t.Fa,t),Li(t,t.v)),t.v++,!0)}r.Fa=function(){if(this.u=null,Di(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var t=2*this.R;this.j.info("BP detection timer enabled: "+t),this.A=Yt(D(this.ab,this),t)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,K(10),Ce(this),Di(this))};function wn(t){t.A!=null&&(v.clearTimeout(t.A),t.A=null)}function Di(t){t.g=new mt(t,t.j,"rpc",t.Y),t.m===null&&(t.g.H=t.o),t.g.O=0;var i=ct(t.qa);L(i,"RID","rpc"),L(i,"SID",t.K),L(i,"AID",t.T),L(i,"CI",t.F?"0":"1"),!t.F&&t.ja&&L(i,"TO",t.ja),L(i,"TYPE","xmlhttp"),oe(t,i),t.m&&t.o&&_n(i,t.m,t.o),t.L&&(t.g.I=t.L);var s=t.g;t=t.ia,s.L=1,s.v=Te(ct(i)),s.m=null,s.P=!0,si(s,t)}r.Za=function(){this.C!=null&&(this.C=null,Ce(this),vn(this),K(19))};function Re(t){t.C!=null&&(v.clearTimeout(t.C),t.C=null)}function Oi(t,i){var s=null;if(t.g==i){Re(t),wn(t),t.g=null;var h=2}else if(gn(t.h,i))s=i.D,ci(t.h,i),h=1;else return;if(t.G!=0){if(i.o)if(h==1){s=i.m?i.m.length:0,i=Date.now()-i.F;var _=t.B;h=hn(),q(h,new ni(h,s)),Ne(t)}else ki(t);else if(_=i.s,_==3||_==0&&0<i.X||!(h==1&&Us(t,i)||h==2&&vn(t)))switch(s&&0<s.length&&(i=t.h,i.i=i.i.concat(s)),_){case 1:bt(t,5);break;case 4:bt(t,10);break;case 3:bt(t,6);break;default:bt(t,2)}}}function Li(t,i){let s=t.Ta+Math.floor(Math.random()*t.cb);return t.isActive()||(s*=2),s*i}function bt(t,i){if(t.j.info("Error code "+i),i==2){var s=D(t.fb,t),h=t.Xa;const _=!h;h=new St(h||"//www.google.com/images/cleardot.gif"),v.location&&v.location.protocol=="http"||Ie(h,"https"),Te(h),_?Ns(h.toString(),s):Rs(h.toString(),s)}else K(2);t.G=0,t.l&&t.l.sa(i),Mi(t),Ci(t)}r.fb=function(t){t?(this.j.info("Successfully pinged google.com"),K(2)):(this.j.info("Failed to ping google.com"),K(1))};function Mi(t){if(t.G=0,t.ka=[],t.l){const i=fi(t.h);(i.length!=0||t.i.length!=0)&&(M(t.ka,i),M(t.ka,t.i),t.h.i.length=0,F(t.i),t.i.length=0),t.l.ra()}}function Ui(t,i,s){var h=s instanceof St?ct(s):new St(s);if(h.g!="")i&&(h.g=i+"."+h.g),Ae(h,h.s);else{var _=v.location;h=_.protocol,i=i?i+"."+_.hostname:_.hostname,_=+_.port;var w=new St(null);h&&Ie(w,h),i&&(w.g=i),_&&Ae(w,_),s&&(w.l=s),h=w}return s=t.D,i=t.ya,s&&i&&L(h,s,i),L(h,"VER",t.la),oe(t,h),h}function xi(t,i,s){if(i&&!t.J)throw Error("Can't create secondary domain capable XhrIo object.");return i=t.Ca&&!t.pa?new x(new Se({eb:s})):new x(t.pa),i.Ha(t.J),i}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Vi(){}r=Vi.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function Q(t,i){$.call(this),this.g=new Pi(i),this.l=t,this.h=i&&i.messageUrlParams||null,t=i&&i.messageHeaders||null,i&&i.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=i&&i.initMessageHeaders||null,i&&i.messageContentType&&(t?t["X-WebChannel-Content-Type"]=i.messageContentType:t={"X-WebChannel-Content-Type":i.messageContentType}),i&&i.va&&(t?t["X-WebChannel-Client-Profile"]=i.va:t={"X-WebChannel-Client-Profile":i.va}),this.g.S=t,(t=i&&i.Sb)&&!J(t)&&(this.g.m=t),this.v=i&&i.supportsCrossDomainXhr||!1,this.u=i&&i.sendRawJson||!1,(i=i&&i.httpSessionIdParam)&&!J(i)&&(this.g.D=i,t=this.h,t!==null&&i in t&&(t=this.h,i in t&&delete t[i])),this.j=new xt(this)}b(Q,$),Q.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Q.prototype.close=function(){yn(this.g)},Q.prototype.o=function(t){var i=this.g;if(typeof t=="string"){var s={};s.__data__=t,t=s}else this.u&&(s={},s.__data__=rn(t),t=s);i.i.push(new vs(i.Ya++,t)),i.G==3&&Ne(i)},Q.prototype.N=function(){this.g.l=null,delete this.j,yn(this.g),delete this.g,Q.aa.N.call(this)};function Fi(t){on.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var i=t.__sm__;if(i){t:{for(const s in i){t=s;break t}t=void 0}(this.i=t)&&(t=this.i,i=i!==null&&t in i?i[t]:void 0),this.data=i}else this.data=t}b(Fi,on);function ji(){an.call(this),this.status=1}b(ji,an);function xt(t){this.g=t}b(xt,Vi),xt.prototype.ua=function(){q(this.g,"a")},xt.prototype.ta=function(t){q(this.g,new Fi(t))},xt.prototype.sa=function(t){q(this.g,new ji)},xt.prototype.ra=function(){q(this.g,"b")},Q.prototype.send=Q.prototype.o,Q.prototype.open=Q.prototype.m,Q.prototype.close=Q.prototype.close,ln.NO_ERROR=0,ln.TIMEOUT=8,ln.HTTP_ERROR=6,_s.COMPLETE="complete",fs.EventType=Xt,Xt.OPEN="a",Xt.CLOSE="b",Xt.ERROR="c",Xt.MESSAGE="d",$.prototype.listen=$.prototype.K,x.prototype.listenOnce=x.prototype.L,x.prototype.getLastError=x.prototype.Ka,x.prototype.getLastErrorCode=x.prototype.Ba,x.prototype.getStatus=x.prototype.Z,x.prototype.getResponseJson=x.prototype.Oa,x.prototype.getResponseText=x.prototype.oa,x.prototype.send=x.prototype.ea,x.prototype.setWithCredentials=x.prototype.Ha}).apply(typeof De<"u"?De:typeof self<"u"?self:typeof window<"u"?window:{});const Qi="@firebase/firestore",Zi="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Y.UNAUTHENTICATED=new Y(null),Y.GOOGLE_CREDENTIALS=new Y("google-credentials-uid"),Y.FIRST_PARTY=new Y("first-party-uid"),Y.MOCK_USER=new Y("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qe="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ve=new Mn("@firebase/firestore");function nt(r,...e){if(Ve.logLevel<=k.DEBUG){const n=e.map(Ur);Ve.debug(`Firestore (${qe}): ${r}`,...n)}}function Mr(r,...e){if(Ve.logLevel<=k.ERROR){const n=e.map(Ur);Ve.error(`Firestore (${qe}): ${r}`,...n)}}function Ur(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fe(r,e,n){let o="Unexpected state";typeof e=="string"?o=e:n=e,xr(r,o,n)}function xr(r,e,n){let o=`FIRESTORE (${qe}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(n!==void 0)try{o+=" CONTEXT: "+JSON.stringify(n)}catch{o+=" CONTEXT: "+n}throw Mr(o),new Error(o)}function ae(r,e,n,o){let a="Unexpected state";typeof n=="string"?a=n:o=n,r||xr(e,a,o)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class N extends It{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ua{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class ca{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Y.UNAUTHENTICATED))}shutdown(){}}class fa{constructor(e){this.t=e,this.currentUser=Y.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){ae(this.o===void 0,42304);let o=this.i;const a=E=>this.i!==o?(o=this.i,n(E)):Promise.resolve();let l=new he;this.o=()=>{this.i++,this.currentUser=this.u(),l.resolve(),l=new he,e.enqueueRetryable(()=>a(this.currentUser))};const d=()=>{const E=l;e.enqueueRetryable(async()=>{await E.promise,await a(this.currentUser)})},v=E=>{nt("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=E,this.o&&(this.auth.addAuthTokenListener(this.o),d())};this.t.onInit(E=>v(E)),setTimeout(()=>{if(!this.auth){const E=this.t.getImmediate({optional:!0});E?v(E):(nt("FirebaseAuthCredentialsProvider","Auth not yet detected"),l.resolve(),l=new he)}},0),d()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(o=>this.i!==e?(nt("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):o?(ae(typeof o.accessToken=="string",31837,{l:o}),new ua(o.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ae(e===null||typeof e=="string",2055,{h:e}),new Y(e)}}class da{constructor(e,n,o){this.P=e,this.T=n,this.I=o,this.type="FirstParty",this.user=Y.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class pa{constructor(e,n,o){this.P=e,this.T=n,this.I=o}getToken(){return Promise.resolve(new da(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(Y.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class tr{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ga{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Pt(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){ae(this.o===void 0,3512);const o=l=>{l.error!=null&&nt("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${l.error.message}`);const d=l.token!==this.m;return this.m=l.token,nt("FirebaseAppCheckTokenProvider",`Received ${d?"new":"existing"} token.`),d?n(l.token):Promise.resolve()};this.o=l=>{e.enqueueRetryable(()=>o(l))};const a=l=>{nt("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=l,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(l=>a(l)),setTimeout(()=>{if(!this.appCheck){const l=this.V.getImmediate({optional:!0});l?a(l):nt("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new tr(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(ae(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new tr(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ma(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let o=0;o<r;o++)n[o]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _a(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ya{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let o="";for(;o.length<20;){const a=ma(40);for(let l=0;l<a.length;++l)o.length<20&&a[l]<n&&(o+=e.charAt(a[l]%62))}return o}}function it(r,e){return r<e?-1:r>e?1:0}function va(r,e){let n=0;for(;n<r.length&&n<e.length;){const o=r.codePointAt(n),a=e.codePointAt(n);if(o!==a){if(o<128&&a<128)return it(o,a);{const l=_a(),d=wa(l.encode(er(r,n)),l.encode(er(e,n)));return d!==0?d:it(o,a)}}n+=o>65535?2:1}return it(r.length,e.length)}function er(r,e){return r.codePointAt(e)>65535?r.substring(e,e+2):r.substring(e,e+1)}function wa(r,e){for(let n=0;n<r.length&&n<e.length;++n)if(r[n]!==e[n])return it(r[n],e[n]);return it(r.length,e.length)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nr="__name__";class rt{constructor(e,n,o){n===void 0?n=0:n>e.length&&Fe(637,{offset:n,range:e.length}),o===void 0?o=e.length-n:o>e.length-n&&Fe(1746,{length:o,range:e.length-n}),this.segments=e,this.offset=n,this.len=o}get length(){return this.len}isEqual(e){return rt.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof rt?e.forEach(o=>{n.push(o)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,o=this.limit();n<o;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const o=Math.min(e.length,n.length);for(let a=0;a<o;a++){const l=rt.compareSegments(e.get(a),n.get(a));if(l!==0)return l}return it(e.length,n.length)}static compareSegments(e,n){const o=rt.isNumericId(e),a=rt.isNumericId(n);return o&&!a?-1:!o&&a?1:o&&a?rt.extractNumericId(e).compare(rt.extractNumericId(n)):va(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Vn.fromString(e.substring(4,e.length-2))}}class et extends rt{construct(e,n,o){return new et(e,n,o)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const o of e){if(o.indexOf("//")>=0)throw new N(C.INVALID_ARGUMENT,`Invalid segment (${o}). Paths must not contain // in them.`);n.push(...o.split("/").filter(a=>a.length>0))}return new et(n)}static emptyPath(){return new et([])}}const Ea=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ct extends rt{construct(e,n,o){return new Ct(e,n,o)}static isValidIdentifier(e){return Ea.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ct.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===nr}static keyField(){return new Ct([nr])}static fromServerFormat(e){const n=[];let o="",a=0;const l=()=>{if(o.length===0)throw new N(C.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(o),o=""};let d=!1;for(;a<e.length;){const v=e[a];if(v==="\\"){if(a+1===e.length)throw new N(C.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const E=e[a+1];if(E!=="\\"&&E!=="."&&E!=="`")throw new N(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);o+=E,a+=2}else v==="`"?(d=!d,a++):v!=="."||d?(o+=v,a++):(l(),a++)}if(l(),d)throw new N(C.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ct(n)}static emptyPath(){return new Ct([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(e){this.path=e}static fromPath(e){return new Nt(et.fromString(e))}static fromName(e){return new Nt(et.fromString(e).popFirst(5))}static empty(){return new Nt(et.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&et.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return et.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new Nt(new et(e.slice()))}}function Ia(r,e,n,o){if(e===!0&&o===!0)throw new N(C.INVALID_ARGUMENT,`${r} and ${n} cannot be used together.`)}function Aa(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V(r,e){const n={typeString:r};return e&&(n.value=e),n}function pe(r,e){if(!Aa(r))throw new N(C.INVALID_ARGUMENT,"JSON must be an object");let n;for(const o in e)if(e[o]){const a=e[o].typeString,l="value"in e[o]?{value:e[o].value}:void 0;if(!(o in r)){n=`JSON missing required field: '${o}'`;break}const d=r[o];if(a&&typeof d!==a){n=`JSON field '${o}' must be a ${a}.`;break}if(l!==void 0&&d!==l.value){n=`Expected '${o}' field to equal '${l.value}'`;break}}if(n)throw new N(C.INVALID_ARGUMENT,n);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ir=-62135596800,rr=1e6;class st{static now(){return st.fromMillis(Date.now())}static fromDate(e){return st.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),o=Math.floor((e-1e3*n)*rr);return new st(n,o)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new N(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new N(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<ir)throw new N(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new N(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/rr}_compareTo(e){return this.seconds===e.seconds?it(this.nanoseconds,e.nanoseconds):it(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:st._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(pe(e,st._jsonSchema))return new st(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-ir;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}st._jsonSchemaVersion="firestore/timestamp/1.0",st._jsonSchema={type:V("string",st._jsonSchemaVersion),seconds:V("number"),nanoseconds:V("number")};function Ta(r){return r.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sa extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(a){try{return atob(a)}catch(l){throw typeof DOMException<"u"&&l instanceof DOMException?new Sa("Invalid base64 string: "+l):l}}(e);return new Ot(n)}static fromUint8Array(e){const n=function(a){let l="";for(let d=0;d<a.length;++d)l+=String.fromCharCode(a[d]);return l}(e);return new Ot(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const o=new Uint8Array(n.length);for(let a=0;a<n.length;a++)o[a]=n.charCodeAt(a);return o}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return it(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ot.EMPTY_BYTE_STRING=new Ot("");const sr="(default)";class je{constructor(e,n){this.projectId=e,this.database=n||sr}static empty(){return new je("","")}get isDefaultDatabase(){return this.database===sr}isEqual(e){return e instanceof je&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ba{constructor(e,n=null,o=[],a=[],l=null,d="F",v=null,E=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=o,this.filters=a,this.limit=l,this.limitType=d,this.startAt=v,this.endAt=E,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function Pa(r){return new ba(r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var or,T;(T=or||(or={}))[T.OK=0]="OK",T[T.CANCELLED=1]="CANCELLED",T[T.UNKNOWN=2]="UNKNOWN",T[T.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",T[T.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",T[T.NOT_FOUND=5]="NOT_FOUND",T[T.ALREADY_EXISTS=6]="ALREADY_EXISTS",T[T.PERMISSION_DENIED=7]="PERMISSION_DENIED",T[T.UNAUTHENTICATED=16]="UNAUTHENTICATED",T[T.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",T[T.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",T[T.ABORTED=10]="ABORTED",T[T.OUT_OF_RANGE=11]="OUT_OF_RANGE",T[T.UNIMPLEMENTED=12]="UNIMPLEMENTED",T[T.INTERNAL=13]="INTERNAL",T[T.UNAVAILABLE=14]="UNAVAILABLE",T[T.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Vn([4294967295,4294967295],0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ca=41943040;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Na=1048576;function Pn(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ra{constructor(e,n,o=1e3,a=1.5,l=6e4){this.Fi=e,this.timerId=n,this.d_=o,this.E_=a,this.A_=l,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const n=Math.floor(this.R_+this.p_()),o=Math.max(0,Date.now()-this.m_),a=Math.max(0,n-o);a>0&&nt("ExponentialBackoff",`Backing off for ${a} ms (base delay: ${this.R_} ms, delay with jitter: ${n} ms, last attempt: ${o} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,a,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{constructor(e,n,o,a,l){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=o,this.op=a,this.removalCallback=l,this.deferred=new he,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(d=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,o,a,l){const d=Date.now()+o,v=new Fn(e,n,d,a,l);return v.start(o),v}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(C.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var ar,hr;(hr=ar||(ar={})).Fa="default",hr.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ka(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lr=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Da="firestore.googleapis.com",ur=!0;class cr{constructor(e){var n,o;if(e.host===void 0){if(e.ssl!==void 0)throw new N(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Da,this.ssl=ur}else this.host=e.host,this.ssl=(n=e.ssl)!==null&&n!==void 0?n:ur;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Ca;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Na)throw new N(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Ia("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ka((o=e.experimentalLongPollingOptions)!==null&&o!==void 0?o:{}),function(l){if(l.timeoutSeconds!==void 0){if(isNaN(l.timeoutSeconds))throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (must not be NaN)`);if(l.timeoutSeconds<5)throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (minimum allowed value is 5)`);if(l.timeoutSeconds>30)throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(o,a){return o.timeoutSeconds===a.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Oa{constructor(e,n,o,a){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=o,this._app=a,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new cr({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new N(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new N(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new cr(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(o){if(!o)return new ca;switch(o.type){case"firstParty":return new pa(o.sessionIndex||"0",o.iamToken||null,o.authTokenFactory||null);case"provider":return o.client;default:throw new N(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const o=lr.get(n);o&&(nt("ComponentProvider","Removing Datastore"),lr.delete(n),o.terminate())}(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{constructor(e,n,o){this.converter=n,this._query=o,this.type="query",this.firestore=e}withConverter(e){return new jn(this.firestore,e,this._query)}}class ot{constructor(e,n,o){this.converter=n,this._key=o,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Bn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ot(this.firestore,e,this._key)}toJSON(){return{type:ot._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,o){if(pe(n,ot._jsonSchema))return new ot(e,o||null,new Nt(et.fromString(n.referencePath)))}}ot._jsonSchemaVersion="firestore/documentReference/1.0",ot._jsonSchema={type:V("string",ot._jsonSchemaVersion),referencePath:V("string")};class Bn extends jn{constructor(e,n,o){super(e,n,Pa(o)),this._path=o,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ot(this.firestore,null,new Nt(e))}withConverter(e){return new Bn(this.firestore,e,this._path)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fr="AsyncQueue";class dr{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new Ra(this,"async_queue_retry"),this.oc=()=>{const o=Pn();o&&nt(fr,"Visibility state changed to "+o.visibilityState),this.F_.y_()},this._c=e;const n=Pn();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const n=Pn();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});const n=new he;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!Ta(e))throw e;nt(fr,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){const n=this._c.then(()=>(this.nc=!0,e().catch(o=>{throw this.tc=o,this.nc=!1,Mr("INTERNAL UNHANDLED ERROR: ",pr(o)),o}).then(o=>(this.nc=!1,o))));return this._c=n,n}enqueueAfterDelay(e,n,o){this.ac(),this.sc.indexOf(e)>-1&&(n=0);const a=Fn.createAndSchedule(this,e,n,o,l=>this.lc(l));return this.ec.push(a),a}ac(){this.tc&&Fe(47125,{hc:pr(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const n of this.ec)if(n.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((n,o)=>n.targetTimeMs-o.targetTimeMs);for(const n of this.ec)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){const n=this.ec.indexOf(e);this.ec.splice(n,1)}}function pr(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class La extends Oa{constructor(e,n,o,a){super(e,n,o,a),this.type="firestore",this._queue=new dr,this._persistenceKey=a?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new dr(e),this._firestoreClient=void 0,await e}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new dt(Ot.fromBase64String(e))}catch(n){throw new N(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new dt(Ot.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:dt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(pe(e,dt._jsonSchema))return dt.fromBase64String(e.bytes)}}dt._jsonSchemaVersion="firestore/bytes/1.0",dt._jsonSchema={type:V("string",dt._jsonSchemaVersion),bytes:V("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vr{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new N(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ct(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new N(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new N(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return it(this._lat,e._lat)||it(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:kt._jsonSchemaVersion}}static fromJSON(e){if(pe(e,kt._jsonSchema))return new kt(e.latitude,e.longitude)}}kt._jsonSchemaVersion="firestore/geoPoint/1.0",kt._jsonSchema={type:V("string",kt._jsonSchemaVersion),latitude:V("number"),longitude:V("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(o,a){if(o.length!==a.length)return!1;for(let l=0;l<o.length;++l)if(o[l]!==a[l])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Dt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(pe(e,Dt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new Dt(e.vectorValues);throw new N(C.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Dt._jsonSchemaVersion="firestore/vectorValue/1.0",Dt._jsonSchema={type:V("string",Dt._jsonSchemaVersion),vectorValues:V("object")};const Ma=new RegExp("[~\\*/\\[\\]]");function Ua(r,e,n){if(e.search(Ma)>=0)throw gr(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r);try{return new Vr(...e.split("."))._internalPath}catch{throw gr(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r)}}function gr(r,e,n,o,a){let l=`Function ${e}() called with invalid data`;l+=". ";let d="";return new N(C.INVALID_ARGUMENT,l+r+d)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fr{constructor(e,n,o,a,l){this._firestore=e,this._userDataWriter=n,this._key=o,this._document=a,this._converter=l}get id(){return this._key.path.lastSegment()}get ref(){return new ot(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new xa(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(jr("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class xa extends Fr{data(){return super.data()}}function jr(r,e){return typeof e=="string"?Ua(r,e):e instanceof Vr?e._internalPath:e._delegate._internalPath}class Oe{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Ft extends Fr{constructor(e,n,o,a,l,d){super(e,n,o,a,d),this._firestore=e,this._firestoreImpl=e,this.metadata=l}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new Me(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const o=this._document.data.field(jr("DocumentSnapshot.get",e));if(o!==null)return this._userDataWriter.convertValue(o,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new N(C.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,n={};return n.type=Ft._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}Ft._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ft._jsonSchema={type:V("string",Ft._jsonSchemaVersion),bundleSource:V("string","DocumentSnapshot"),bundleName:V("string"),bundle:V("string")};class Me extends Ft{data(e={}){return super.data(e)}}class le{constructor(e,n,o,a){this._firestore=e,this._userDataWriter=n,this._snapshot=a,this.metadata=new Oe(a.hasPendingWrites,a.fromCache),this.query=o}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(o=>{e.call(n,new Me(this._firestore,this._userDataWriter,o.key,o,new Oe(this._snapshot.mutatedKeys.has(o.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new N(C.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(a,l){if(a._snapshot.oldDocs.isEmpty()){let d=0;return a._snapshot.docChanges.map(v=>{const E=new Me(a._firestore,a._userDataWriter,v.doc.key,v.doc,new Oe(a._snapshot.mutatedKeys.has(v.doc.key),a._snapshot.fromCache),a.query.converter);return v.doc,{type:"added",doc:E,oldIndex:-1,newIndex:d++}})}{let d=a._snapshot.oldDocs;return a._snapshot.docChanges.filter(v=>l||v.type!==3).map(v=>{const E=new Me(a._firestore,a._userDataWriter,v.doc.key,v.doc,new Oe(a._snapshot.mutatedKeys.has(v.doc.key),a._snapshot.fromCache),a.query.converter);let A=-1,R=-1;return v.type!==0&&(A=d.indexOf(v.doc.key),d=d.delete(v.doc.key)),v.type!==1&&(d=d.add(v.doc),R=d.indexOf(v.doc.key)),{type:Va(v.type),doc:E,oldIndex:A,newIndex:R}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new N(C.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=le._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=ya.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],o=[],a=[];return this.docs.forEach(l=>{l._document!==null&&(n.push(l._document),o.push(this._userDataWriter.convertObjectMap(l._document.data.value.mapValue.fields,"previous")),a.push(l.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Va(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Fe(61501,{type:r})}}le._jsonSchemaVersion="firestore/querySnapshot/1.0",le._jsonSchema={type:V("string",le._jsonSchemaVersion),bundleSource:V("string","QuerySnapshot"),bundleName:V("string"),bundle:V("string")};(function(e,n=!0){(function(a){qe=a})(ze),$t(new Ht("firestore",(o,{instanceIdentifier:a,options:l})=>{const d=o.getProvider("app").getImmediate(),v=new La(new fa(o.getProvider("auth-internal")),new ga(d,o.getProvider("app-check-internal")),function(A,R){if(!Object.prototype.hasOwnProperty.apply(A.options,["projectId"]))throw new N(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new je(A.options.projectId,R)}(d,a),d);return l=Object.assign({useFetchStreams:n},l),v._setSettings(l),v},"PUBLIC").setMultipleInstances(!0)),Et(Qi,Zi,e),Et(Qi,Zi,"esm2017")})();var Fa="firebase",ja="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Et(Fa,ja,"app");function Br(r,e){var n={};for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&e.indexOf(o)<0&&(n[o]=r[o]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var a=0,o=Object.getOwnPropertySymbols(r);a<o.length;a++)e.indexOf(o[a])<0&&Object.prototype.propertyIsEnumerable.call(r,o[a])&&(n[o[a]]=r[o[a]]);return n}function Hr(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Ba=Hr,$r=new de("auth","Firebase",Hr());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Be=new Mn("@firebase/auth");function Ha(r,...e){Be.logLevel<=k.WARN&&Be.warn(`Auth (${ze}): ${r}`,...e)}function Ue(r,...e){Be.logLevel<=k.ERROR&&Be.error(`Auth (${ze}): ${r}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mr(r,...e){throw Hn(r,...e)}function Gr(r,...e){return Hn(r,...e)}function Wr(r,e,n){const o=Object.assign(Object.assign({},Ba()),{[e]:n});return new de("auth","Firebase",o).create(e,{appName:r.name})}function xe(r){return Wr(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Hn(r,...e){if(typeof r!="string"){const n=e[0],o=[...e.slice(1)];return o[0]&&(o[0].appName=r.name),r._errorFactory.create(n,...o)}return $r.create(r,...e)}function P(r,e,...n){if(!r)throw Hn(e,...n)}function ue(r){const e="INTERNAL ASSERTION FAILED: "+r;throw Ue(e),new Error(e)}function He(r,e){r||ue(e)}function $a(){return _r()==="http:"||_r()==="https:"}function _r(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ga(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&($a()||Xs()||"connection"in navigator)?navigator.onLine:!0}function Wa(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ge{constructor(e,n){this.shortDelay=e,this.longDelay=n,He(n>e,"Short delay should be less than long delay!"),this.isMobile=qs()||Js()}get(){return Ga()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function za(r,e){He(r.emulator,"Emulator should always be set here");const{url:n}=r.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zr{static initialize(e,n,o){this.fetchImpl=e,n&&(this.headersImpl=n),o&&(this.responseImpl=o)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ue("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ue("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ue("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qa={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ka=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Xa=new ge(3e4,6e4);function qr(r,e){return r.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:r.tenantId}):e}async function Ke(r,e,n,o,a={}){return Kr(r,a,async()=>{let l={},d={};o&&(e==="GET"?d=o:l={body:JSON.stringify(o)});const v=Rr(Object.assign({key:r.config.apiKey},d)).slice(1),E=await r._getAdditionalHeaders();E["Content-Type"]="application/json",r.languageCode&&(E["X-Firebase-Locale"]=r.languageCode);const A=Object.assign({method:e,headers:E},l);return Ks()||(A.referrerPolicy="no-referrer"),r.emulatorConfig&&Nr(r.emulatorConfig.host)&&(A.credentials="include"),zr.fetch()(await Xr(r,r.config.apiHost,n,v),A)})}async function Kr(r,e,n){r._canInitEmulator=!1;const o=Object.assign(Object.assign({},qa),e);try{const a=new Ja(r),l=await Promise.race([n(),a.promise]);a.clearNetworkTimeout();const d=await l.json();if("needConfirmation"in d)throw Le(r,"account-exists-with-different-credential",d);if(l.ok&&!("errorMessage"in d))return d;{const v=l.ok?d.errorMessage:d.error.message,[E,A]=v.split(" : ");if(E==="FEDERATED_USER_ID_ALREADY_LINKED")throw Le(r,"credential-already-in-use",d);if(E==="EMAIL_EXISTS")throw Le(r,"email-already-in-use",d);if(E==="USER_DISABLED")throw Le(r,"user-disabled",d);const R=o[E]||E.toLowerCase().replace(/[_\s]+/g,"-");if(A)throw Wr(r,R,A);mr(r,R)}}catch(a){if(a instanceof It)throw a;mr(r,"network-request-failed",{message:String(a)})}}async function Xr(r,e,n,o){const a=`${e}${n}?${o}`,l=r,d=l.config.emulator?za(r.config,a):`${r.config.apiScheme}://${a}`;return Ka.includes(n)&&(await l._persistenceManagerAvailable,l._getPersistenceType()==="COOKIE")?l._getPersistence()._getFinalTarget(d).toString():d}class Ja{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,o)=>{this.timer=setTimeout(()=>o(Gr(this.auth,"network-request-failed")),Xa.get())})}}function Le(r,e,n){const o={appName:r.name};n.email&&(o.email=n.email),n.phoneNumber&&(o.phoneNumber=n.phoneNumber);const a=Gr(r,e,o);return a.customData._tokenResponse=n,a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ya(r,e){return Ke(r,"POST","/v1/accounts:delete",e)}async function $e(r,e){return Ke(r,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ce(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Qa(r,e=!1){const n=We(r),o=await n.getIdToken(e),a=Jr(o);P(a&&a.exp&&a.auth_time&&a.iat,n.auth,"internal-error");const l=typeof a.firebase=="object"?a.firebase:void 0,d=l?.sign_in_provider;return{claims:a,token:o,authTime:ce(Cn(a.auth_time)),issuedAtTime:ce(Cn(a.iat)),expirationTime:ce(Cn(a.exp)),signInProvider:d||null,signInSecondFactor:l?.sign_in_second_factor||null}}function Cn(r){return Number(r)*1e3}function Jr(r){const[e,n,o]=r.split(".");if(e===void 0||n===void 0||o===void 0)return Ue("JWT malformed, contained fewer than 3 sections"),null;try{const a=Cr(n);return a?JSON.parse(a):(Ue("Failed to decode base64 JWT payload"),null)}catch(a){return Ue("Caught error parsing JWT payload as JSON",a?.toString()),null}}function yr(r){const e=Jr(r);return P(e,"internal-error"),P(typeof e.exp<"u","internal-error"),P(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function On(r,e,n=!1){if(n)return e;try{return await e}catch(o){throw o instanceof It&&Za(o)&&r.auth.currentUser===r&&await r.auth.signOut(),o}}function Za({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class th{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const o=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),o}else{this.errorBackoff=3e4;const a=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ln{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ce(this.lastLoginAt),this.creationTime=ce(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ge(r){var e;const n=r.auth,o=await r.getIdToken(),a=await On(r,$e(n,{idToken:o}));P(a?.users.length,n,"internal-error");const l=a.users[0];r._notifyReloadListener(l);const d=!((e=l.providerUserInfo)===null||e===void 0)&&e.length?Yr(l.providerUserInfo):[],v=nh(r.providerData,d),E=r.isAnonymous,A=!(r.email&&l.passwordHash)&&!v?.length,R=E?A:!1,U={uid:l.localId,displayName:l.displayName||null,photoURL:l.photoUrl||null,email:l.email||null,emailVerified:l.emailVerified||!1,phoneNumber:l.phoneNumber||null,tenantId:l.tenantId||null,providerData:v,metadata:new Ln(l.createdAt,l.lastLoginAt),isAnonymous:R};Object.assign(r,U)}async function eh(r){const e=We(r);await Ge(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function nh(r,e){return[...r.filter(o=>!e.some(a=>a.providerId===o.providerId)),...e]}function Yr(r){return r.map(e=>{var{providerId:n}=e,o=Br(e,["providerId"]);return{providerId:n,uid:o.rawId||"",displayName:o.displayName||null,email:o.email||null,phoneNumber:o.phoneNumber||null,photoURL:o.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ih(r,e){const n=await Kr(r,{},async()=>{const o=Rr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:a,apiKey:l}=r.config,d=await Xr(r,a,"/v1/token",`key=${l}`),v=await r._getAdditionalHeaders();v["Content-Type"]="application/x-www-form-urlencoded";const E={method:"POST",headers:v,body:o};return r.emulatorConfig&&Nr(r.emulatorConfig.host)&&(E.credentials="include"),zr.fetch()(d,E)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function rh(r,e){return Ke(r,"POST","/v2/accounts:revokeToken",qr(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){P(e.idToken,"internal-error"),P(typeof e.idToken<"u","internal-error"),P(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):yr(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){P(e.length!==0,"internal-error");const n=yr(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(P(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:o,refreshToken:a,expiresIn:l}=await ih(e,n);this.updateTokensAndExpiration(o,a,Number(l))}updateTokensAndExpiration(e,n,o){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+o*1e3}static fromJSON(e,n){const{refreshToken:o,accessToken:a,expirationTime:l}=n,d=new jt;return o&&(P(typeof o=="string","internal-error",{appName:e}),d.refreshToken=o),a&&(P(typeof a=="string","internal-error",{appName:e}),d.accessToken=a),l&&(P(typeof l=="number","internal-error",{appName:e}),d.expirationTime=l),d}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new jt,this.toJSON())}_performRefresh(){return ue("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vt(r,e){P(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class at{constructor(e){var{uid:n,auth:o,stsTokenManager:a}=e,l=Br(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new th(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=o,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new Ln(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(e){const n=await On(this,this.stsTokenManager.getToken(this.auth,e));return P(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Qa(this,e)}reload(){return eh(this)}_assign(e){this!==e&&(P(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new at(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){P(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let o=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),o=!0),n&&await Ge(this),await this.auth._persistUserIfCurrent(this),o&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Pt(this.auth.app))return Promise.reject(xe(this.auth));const e=await this.getIdToken();return await On(this,Ya(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var o,a,l,d,v,E,A,R;const U=(o=n.displayName)!==null&&o!==void 0?o:void 0,D=(a=n.email)!==null&&a!==void 0?a:void 0,z=(l=n.phoneNumber)!==null&&l!==void 0?l:void 0,b=(d=n.photoURL)!==null&&d!==void 0?d:void 0,F=(v=n.tenantId)!==null&&v!==void 0?v:void 0,M=(E=n._redirectEventId)!==null&&E!==void 0?E:void 0,lt=(A=n.createdAt)!==null&&A!==void 0?A:void 0,J=(R=n.lastLoginAt)!==null&&R!==void 0?R:void 0,{uid:B,emailVerified:Z,isAnonymous:At,providerData:X,stsTokenManager:m}=n;P(B&&m,e,"internal-error");const u=jt.fromJSON(this.name,m);P(typeof B=="string",e,"internal-error"),vt(U,e.name),vt(D,e.name),P(typeof Z=="boolean",e,"internal-error"),P(typeof At=="boolean",e,"internal-error"),vt(z,e.name),vt(b,e.name),vt(F,e.name),vt(M,e.name),vt(lt,e.name),vt(J,e.name);const f=new at({uid:B,auth:e,email:D,emailVerified:Z,displayName:U,isAnonymous:At,photoURL:b,phoneNumber:z,tenantId:F,stsTokenManager:u,createdAt:lt,lastLoginAt:J});return X&&Array.isArray(X)&&(f.providerData=X.map(p=>Object.assign({},p))),M&&(f._redirectEventId=M),f}static async _fromIdTokenResponse(e,n,o=!1){const a=new jt;a.updateFromServerResponse(n);const l=new at({uid:n.localId,auth:e,stsTokenManager:a,isAnonymous:o});return await Ge(l),l}static async _fromGetAccountInfoResponse(e,n,o){const a=n.users[0];P(a.localId!==void 0,"internal-error");const l=a.providerUserInfo!==void 0?Yr(a.providerUserInfo):[],d=!(a.email&&a.passwordHash)&&!l?.length,v=new jt;v.updateFromIdToken(o);const E=new at({uid:a.localId,auth:e,stsTokenManager:v,isAnonymous:d}),A={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:l,metadata:new Ln(a.createdAt,a.lastLoginAt),isAnonymous:!(a.email&&a.passwordHash)&&!l?.length};return Object.assign(E,A),E}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vr=new Map;function Rt(r){He(r instanceof Function,"Expected a class definition");let e=vr.get(r);return e?(He(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,vr.set(r,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Qr.type="NONE";const wr=Qr;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nn(r,e,n){return`firebase:${r}:${e}:${n}`}class Bt{constructor(e,n,o){this.persistence=e,this.auth=n,this.userKey=o;const{config:a,name:l}=this.auth;this.fullUserKey=Nn(this.userKey,a.apiKey,l),this.fullPersistenceKey=Nn("persistence",a.apiKey,l),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await $e(this.auth,{idToken:e}).catch(()=>{});return n?at._fromGetAccountInfoResponse(this.auth,n,e):null}return at._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,o="authUser"){if(!n.length)return new Bt(Rt(wr),e,o);const a=(await Promise.all(n.map(async A=>{if(await A._isAvailable())return A}))).filter(A=>A);let l=a[0]||Rt(wr);const d=Nn(o,e.config.apiKey,e.name);let v=null;for(const A of n)try{const R=await A._get(d);if(R){let U;if(typeof R=="string"){const D=await $e(e,{idToken:R}).catch(()=>{});if(!D)break;U=await at._fromGetAccountInfoResponse(e,D,R)}else U=at._fromJSON(e,R);A!==l&&(v=U),l=A;break}}catch{}const E=a.filter(A=>A._shouldAllowMigration);return!l._shouldAllowMigration||!E.length?new Bt(l,e,o):(l=E[0],v&&await l._set(d,v.toJSON()),await Promise.all(n.map(async A=>{if(A!==l)try{await A._remove(d)}catch{}})),new Bt(l,e,o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Er(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(hh(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(sh(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(uh(e))return"Blackberry";if(ch(e))return"Webos";if(oh(e))return"Safari";if((e.includes("chrome/")||ah(e))&&!e.includes("edge/"))return"Chrome";if(lh(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,o=r.match(n);if(o?.length===2)return o[1]}return"Other"}function sh(r=ht()){return/firefox\//i.test(r)}function oh(r=ht()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function ah(r=ht()){return/crios\//i.test(r)}function hh(r=ht()){return/iemobile/i.test(r)}function lh(r=ht()){return/android/i.test(r)}function uh(r=ht()){return/blackberry/i.test(r)}function ch(r=ht()){return/webos/i.test(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zr(r,e=[]){let n;switch(r){case"Browser":n=Er(ht());break;case"Worker":n=`${Er(ht())}-${r}`;break;default:n=r}const o=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${ze}/${o}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fh{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const o=l=>new Promise((d,v)=>{try{const E=e(l);d(E)}catch(E){v(E)}});o.onAbort=n,this.queue.push(o);const a=this.queue.length-1;return()=>{this.queue[a]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const o of this.queue)await o(e),o.onAbort&&n.push(o.onAbort)}catch(o){n.reverse();for(const a of n)try{a()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:o?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dh(r,e={}){return Ke(r,"GET","/v2/passwordPolicy",qr(r,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ph=6;class gh{constructor(e){var n,o,a,l;const d=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=d.minPasswordLength)!==null&&n!==void 0?n:ph,d.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=d.maxPasswordLength),d.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=d.containsLowercaseCharacter),d.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=d.containsUppercaseCharacter),d.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=d.containsNumericCharacter),d.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=d.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(a=(o=e.allowedNonAlphanumericCharacters)===null||o===void 0?void 0:o.join(""))!==null&&a!==void 0?a:"",this.forceUpgradeOnSignin=(l=e.forceUpgradeOnSignin)!==null&&l!==void 0?l:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,o,a,l,d,v;const E={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,E),this.validatePasswordCharacterOptions(e,E),E.isValid&&(E.isValid=(n=E.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),E.isValid&&(E.isValid=(o=E.meetsMaxPasswordLength)!==null&&o!==void 0?o:!0),E.isValid&&(E.isValid=(a=E.containsLowercaseLetter)!==null&&a!==void 0?a:!0),E.isValid&&(E.isValid=(l=E.containsUppercaseLetter)!==null&&l!==void 0?l:!0),E.isValid&&(E.isValid=(d=E.containsNumericCharacter)!==null&&d!==void 0?d:!0),E.isValid&&(E.isValid=(v=E.containsNonAlphanumericCharacter)!==null&&v!==void 0?v:!0),E}validatePasswordLengthOptions(e,n){const o=this.customStrengthOptions.minPasswordLength,a=this.customStrengthOptions.maxPasswordLength;o&&(n.meetsMinPasswordLength=e.length>=o),a&&(n.meetsMaxPasswordLength=e.length<=a)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let o;for(let a=0;a<e.length;a++)o=e.charAt(a),this.updatePasswordCharacterOptionsStatuses(n,o>="a"&&o<="z",o>="A"&&o<="Z",o>="0"&&o<="9",this.allowedNonAlphanumericCharacters.includes(o))}updatePasswordCharacterOptionsStatuses(e,n,o,a,l){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=o)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=a)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh{constructor(e,n,o,a){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=o,this.config=a,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ir(this),this.idTokenSubscription=new Ir(this),this.beforeStateQueue=new fh(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=$r,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=a.sdkClientVersion,this._persistenceManagerAvailable=new Promise(l=>this._resolvePersistenceManagerAvailable=l)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Rt(n)),this._initializationPromise=this.queue(async()=>{var o,a,l;if(!this._deleted&&(this.persistenceManager=await Bt.create(this,e),(o=this._resolvePersistenceManagerAvailable)===null||o===void 0||o.call(this),!this._deleted)){if(!((a=this._popupRedirectResolver)===null||a===void 0)&&a._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((l=this.currentUser)===null||l===void 0?void 0:l.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await $e(this,{idToken:e}),o=await at._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(o)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Pt(this.app)){const d=this.app.settings.authIdToken;return d?new Promise(v=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(d).then(v,v))}):this.directlySetCurrentUser(null)}const o=await this.assertedPersistence.getCurrentUser();let a=o,l=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const d=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,v=a?._redirectEventId,E=await this.tryRedirectSignIn(e);(!d||d===v)&&E?.user&&(a=E.user,l=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(a)}catch(d){a=o,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(d))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return P(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Ge(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Wa()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Pt(this.app))return Promise.reject(xe(this));const n=e?We(e):null;return n&&P(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&P(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Pt(this.app)?Promise.reject(xe(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Pt(this.app)?Promise.reject(xe(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Rt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await dh(this),n=new gh(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new de("auth","Firebase",e())}onAuthStateChanged(e,n,o){return this.registerStateListener(this.authStateSubscription,e,n,o)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,o){return this.registerStateListener(this.idTokenSubscription,e,n,o)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const o=this.onAuthStateChanged(()=>{o(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),o={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(o.tenantId=this.tenantId),await rh(this,o)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const o=await this.getOrInitRedirectPersistenceManager(n);return e===null?o.removeCurrentUser():o.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Rt(e)||this._popupRedirectResolver;P(n,this,"argument-error"),this.redirectPersistenceManager=await Bt.create(this,[Rt(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,o;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((o=this.redirectUser)===null||o===void 0?void 0:o._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const o=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==o&&(this.lastNotifiedUid=o,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,o,a){if(this._deleted)return()=>{};const l=typeof n=="function"?n:n.next.bind(n);let d=!1;const v=this._isInitialized?Promise.resolve():this._initializationPromise;if(P(v,this,"internal-error"),v.then(()=>{d||l(this.currentUser)}),typeof n=="function"){const E=e.addObserver(n,o,a);return()=>{d=!0,E()}}else{const E=e.addObserver(n);return()=>{d=!0,E()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return P(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Zr(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const o=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());o&&(n["X-Firebase-Client"]=o);const a=await this._getAppCheckToken();return a&&(n["X-Firebase-AppCheck"]=a),n}async _getAppCheckToken(){var e;if(Pt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n?.error&&Ha(`Error while retrieving App Check token: ${n.error}`),n?.token}}function _h(r){return We(r)}class Ir{constructor(e){this.auth=e,this.observer=null,this.addObserver=no(n=>this.observer=n)}get next(){return P(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}function yh(r,e){const n=e?.persistence||[],o=(Array.isArray(n)?n:[n]).map(Rt);e?.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(o,e?.popupRedirectResolver)}new ge(3e4,6e4);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new ge(2e3,1e4);/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new ge(3e4,6e4);/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new ge(5e3,15e3);var Ar="@firebase/auth",Tr="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vh{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(o=>{e(o?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){P(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wh(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Eh(r){$t(new Ht("auth",(e,{options:n})=>{const o=e.getProvider("app").getImmediate(),a=e.getProvider("heartbeat"),l=e.getProvider("app-check-internal"),{apiKey:d,authDomain:v}=o.options;P(d&&!d.includes(":"),"invalid-api-key",{appName:o.name});const E={apiKey:d,authDomain:v,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Zr(r)},A=new mh(o,a,l,E);return yh(A,n),A},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,o)=>{e.getProvider("auth-internal").initialize()})),$t(new Ht("auth-internal",e=>{const n=_h(e.getProvider("auth").getImmediate());return(o=>new vh(o))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Et(Ar,Tr,wh(r)),Et(Ar,Tr,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ih=5*60;zs("authIdTokenMaxAge");Eh("Browser");
//# sourceMappingURL=firebase-NvekqPa5.js.map
