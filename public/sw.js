if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return i[e]||(s=new Promise(async s=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=s}else importScripts(e),s()})),s.then(()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]})},s=(s,i)=>{Promise.all(s.map(e)).then(e=>i(1===e.length?e[0]:e))},i={require:Promise.resolve(s)};self.define=(s,r,o)=>{i[s]||(i[s]=Promise.resolve().then(()=>{let i={};const c={uri:location.origin+s.slice(1)};return Promise.all(r.map(s=>{switch(s){case"exports":return i;case"module":return c;default:return e(s)}})).then(e=>{const s=o(...e);return i.default||(i.default=s),i})}))}}define("./sw.js",["./workbox-24f346ed"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"_assets/css/global.css",revision:"aa06f204678c22c8ab0a3f04de5a84bc"},{url:"_assets/css/home.css",revision:"ec8d83908977b40948d2e482b9971ab6"},{url:"_assets/js/global.js",revision:"f94bbb3b98b30ceebda3a15e50f727aa"},{url:"_assets/js/home.js",revision:"b6887e5b464e57e2f3489c7f500b4309"},{url:"_assets/js/moment.js",revision:"b9abfc33f4932497e3b5269261a25188"},{url:"employees/add/index.html",revision:"e6189bada0e6ffaed229192852d79e5a"},{url:"employees/add/logic.js",revision:"949aa64092cf51bf7331e246759116ae"},{url:"employees/index.html",revision:"8dacf36cdd1d4d61f957dacf01f44142"},{url:"employees/logic.js",revision:"5af1f8c9c992f943d93ff39144ef03d5"},{url:"employees/profile/edit/index.html",revision:"43e1ad90be35b44890d3fe877d82dd3e"},{url:"employees/profile/edit/logic.js",revision:"dfbc8c606b6b5a70a72b1f783b700fac"},{url:"employees/profile/index.html",revision:"4b5b431cd4bee7ea6ed77244b122847e"},{url:"employees/profile/logic.js",revision:"30735b5ebc3f0d0d35543dc1d047c761"},{url:"employees/time/index.html",revision:"ada58d8bc7e90feba8c4d8c56fbc5306"},{url:"employees/time/logic.js",revision:"cfad26a763943086d864c98d21fcac62"},{url:"forgot-password/index.html",revision:"25728b15122d3bb4be4c59f091073ddd"},{url:"forgot-password/logic.js",revision:"0102a99f6492ed5fffe0faa56fa8e6f1"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"index.html",revision:"fcbe82a2809d2837f15f4a2cef42f5ac"},{url:"login/index.html",revision:"65bce3430a3a9e11432f0755a76efd9e"},{url:"login/logic.js",revision:"fbddd500170ed5b85912acc6bf8429a6"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"a39c04f3fd5a96ada62b08d898ba27ba"},{url:"logout/logic.js",revision:"c124e9ac489fc97ac1b5f77b24132b8d"},{url:"password-must-change/index.html",revision:"b5a6ac9bcc74e8615e923aaca6d73c34"},{url:"password-must-change/logic.js",revision:"1c1f229b05a20df8891312e1457e402a"},{url:"register-confirm/index.html",revision:"3f27586dcd5e7f070ac8d1272b3ad4b5"},{url:"register-confirm/logic.js",revision:"bc4e42e76fc6db98ab07932b4154656f"},{url:"register/index.html",revision:"1a5f01b29db7c9a50d1d900404c4b5f6"},{url:"register/logic.js",revision:"cbe38ba5f3f20bc3cccbbdf0941a7098"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"c748ecca6ee02af2e18ec663f4c0995d"},{url:"reset-password/logic.js",revision:"0bc30f1646911bbcf7636c32dd79f2ad"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
