if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,i,o)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const d={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return r;case"module":return d;default:return e(s)}})).then(e=>{const s=o(...e);return r.default||(r.default=s),r})}))}}define("./sw.js",["./workbox-24f346ed"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"_assets/css/global.css",revision:"df90aa1c32f87c42fc0983f1f24d83d0"},{url:"_assets/js/global.js",revision:"9520dc610ebb3b4d08a4a70d1380e5aa"},{url:"_assets/js/home.js",revision:"35700234051d704115815491805c5891"},{url:"_assets/js/moment.js",revision:"b9abfc33f4932497e3b5269261a25188"},{url:"employees/add/index.html",revision:"be986f692ce6f845fa7ff283601834e9"},{url:"employees/add/logic.js",revision:"e8e69e38ecca0670e4bff3690d0f1595"},{url:"employees/index.html",revision:"1a92c18df5a62015212000098bd885d4"},{url:"employees/logic.js",revision:"871ae0e1bcb123b5bfffebdc61e8e937"},{url:"employees/profile/edit/index.html",revision:"6bd168d070cb1b9ab271ad77c9037feb"},{url:"employees/profile/edit/logic.js",revision:"de161130c0d594f7419b5968a166bcf5"},{url:"employees/profile/index.html",revision:"d004c98d0fa8ad402c0c716858c0d8aa"},{url:"employees/profile/logic.js",revision:"b755caa0c57d4efdbe04f8743f5bd142"},{url:"forgot-password/index.html",revision:"25728b15122d3bb4be4c59f091073ddd"},{url:"forgot-password/logic.js",revision:"0102a99f6492ed5fffe0faa56fa8e6f1"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"index.html",revision:"a83827b6c37cb4e3185d31dbdf28fea9"},{url:"login/index.html",revision:"65bce3430a3a9e11432f0755a76efd9e"},{url:"login/logic.js",revision:"fbddd500170ed5b85912acc6bf8429a6"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"a39c04f3fd5a96ada62b08d898ba27ba"},{url:"logout/logic.js",revision:"c124e9ac489fc97ac1b5f77b24132b8d"},{url:"password-must-change/index.html",revision:"50c62a8b3d0a635ab07f41597d2cfca5"},{url:"password-must-change/logic.js",revision:"1dd2de626c082a437c37cd53882a39f5"},{url:"register-confirm/index.html",revision:"3f27586dcd5e7f070ac8d1272b3ad4b5"},{url:"register-confirm/logic.js",revision:"bf3c024db9e37a14aceb2b5707ed39c9"},{url:"register/index.html",revision:"1a5f01b29db7c9a50d1d900404c4b5f6"},{url:"register/logic.js",revision:"cbe38ba5f3f20bc3cccbbdf0941a7098"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"c748ecca6ee02af2e18ec663f4c0995d"},{url:"reset-password/logic.js",revision:"0bc30f1646911bbcf7636c32dd79f2ad"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
