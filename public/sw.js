if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,i,o)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const d={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return r;case"module":return d;default:return e(s)}})).then(e=>{const s=o(...e);return r.default||(r.default=s),r})}))}}define("./sw.js",["./workbox-24f346ed"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"_assets/css/global.css",revision:"c02c5dddcb74c76547e7bfed2e397cdf"},{url:"_assets/js/global.js",revision:"fed1f5d9cd0b980fbdb755b5282669d1"},{url:"_assets/js/home.js",revision:"fdf680007eb0683d9927f7811672c682"},{url:"employees/add/index.html",revision:"6e0178bbcd98e02130d97fc31a11d36b"},{url:"employees/add/logic.js",revision:"572c55910dc2f2592b8245a3014e55b0"},{url:"employees/id/index.html",revision:"3bf1e17896f59c78f7d7f22ae281d5da"},{url:"employees/id/logic.js",revision:"e39d273ab50517cc90bd6e94b5c15897"},{url:"employees/index.html",revision:"f86681a1082a10e76899c769cb5cf481"},{url:"employees/logic.js",revision:"a8d5f57d0fce51a055821add932685a9"},{url:"forgot-password/index.html",revision:"25728b15122d3bb4be4c59f091073ddd"},{url:"forgot-password/logic.js",revision:"0102a99f6492ed5fffe0faa56fa8e6f1"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"index.html",revision:"830eb261faae164e11b3694d94c28fd1"},{url:"login/index.html",revision:"65bce3430a3a9e11432f0755a76efd9e"},{url:"login/logic.js",revision:"d4ca426e0b386fb544930f9ef5249bf8"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"a39c04f3fd5a96ada62b08d898ba27ba"},{url:"logout/logic.js",revision:"c124e9ac489fc97ac1b5f77b24132b8d"},{url:"register-confirm/index.html",revision:"3f27586dcd5e7f070ac8d1272b3ad4b5"},{url:"register-confirm/logic.js",revision:"bf3c024db9e37a14aceb2b5707ed39c9"},{url:"register/index.html",revision:"1a5f01b29db7c9a50d1d900404c4b5f6"},{url:"register/logic.js",revision:"cbe38ba5f3f20bc3cccbbdf0941a7098"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"c748ecca6ee02af2e18ec663f4c0995d"},{url:"reset-password/logic.js",revision:"0bc30f1646911bbcf7636c32dd79f2ad"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
