if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,i,o)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const c={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return r;case"module":return c;default:return e(s)}})).then(e=>{const s=o(...e);return r.default||(r.default=s),r})}))}}define("./sw.js",["./workbox-24f346ed"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"_assets/css/global.css",revision:"261128b2d412b8c7feb30b763c7f0fe6"},{url:"_assets/js/global.js",revision:"a33e924aebdbc383e925a6c18c6450a9"},{url:"_assets/js/home.js",revision:"35700234051d704115815491805c5891"},{url:"_assets/js/moment.js",revision:"b9abfc33f4932497e3b5269261a25188"},{url:"employees/add/index.html",revision:"70cdcdf5d9294573c21e737eb492108d"},{url:"employees/add/logic.js",revision:"10d3303af85931e9a068430d678a4f69"},{url:"employees/index.html",revision:"1a92c18df5a62015212000098bd885d4"},{url:"employees/logic.js",revision:"5d336a542a938e92a87be5f09f5a4432"},{url:"employees/profile/edit/index.html",revision:"adba6d05cc9059c9df1942456d8af5a2"},{url:"employees/profile/edit/logic.js",revision:"dfbc8c606b6b5a70a72b1f783b700fac"},{url:"employees/profile/index.html",revision:"6916fac7d8edfcb440ee3da5a3dc2497"},{url:"employees/profile/logic.js",revision:"5d85c915bc58a672dfb711b41cc974e1"},{url:"forgot-password/index.html",revision:"25728b15122d3bb4be4c59f091073ddd"},{url:"forgot-password/logic.js",revision:"0102a99f6492ed5fffe0faa56fa8e6f1"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"index.html",revision:"a83827b6c37cb4e3185d31dbdf28fea9"},{url:"login/index.html",revision:"65bce3430a3a9e11432f0755a76efd9e"},{url:"login/logic.js",revision:"fbddd500170ed5b85912acc6bf8429a6"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"a39c04f3fd5a96ada62b08d898ba27ba"},{url:"logout/logic.js",revision:"c124e9ac489fc97ac1b5f77b24132b8d"},{url:"password-must-change/index.html",revision:"bb98d83696bac99cc3c6cc0fc3a65a6e"},{url:"password-must-change/logic.js",revision:"f885d83f848efde1f4de94e3c5178bde"},{url:"register-confirm/index.html",revision:"3f27586dcd5e7f070ac8d1272b3ad4b5"},{url:"register-confirm/logic.js",revision:"bc4e42e76fc6db98ab07932b4154656f"},{url:"register/index.html",revision:"1a5f01b29db7c9a50d1d900404c4b5f6"},{url:"register/logic.js",revision:"cbe38ba5f3f20bc3cccbbdf0941a7098"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"c748ecca6ee02af2e18ec663f4c0995d"},{url:"reset-password/logic.js",revision:"0bc30f1646911bbcf7636c32dd79f2ad"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
