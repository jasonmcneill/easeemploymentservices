if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let i=Promise.resolve();return s[e]||(i=new Promise((async i=>{if("document"in self){const s=document.createElement("script");s.src=e,document.head.appendChild(s),s.onload=i}else importScripts(e),i()}))),i.then((()=>{if(!s[e])throw new Error(`Module ${e} didn’t register its module`);return s[e]}))},i=(i,s)=>{Promise.all(i.map(e)).then((e=>s(1===e.length?e[0]:e)))},s={require:Promise.resolve(i)};self.define=(i,r,d)=>{s[i]||(s[i]=Promise.resolve().then((()=>{let s={};const o={uri:location.origin+i.slice(1)};return Promise.all(r.map((i=>{switch(i){case"exports":return s;case"module":return o;default:return e(i)}}))).then((e=>{const i=d(...e);return s.default||(s.default=i),s}))})))}}define("./sw.js",["./workbox-5fdfb7c0"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap.css",revision:"b2c06c42fd29dbb0b1205956752272e5"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.bundle.min.js",revision:"21f815ff6d1883c4e81d821d38ff4070"},{url:"_assets/css/global.css",revision:"aa06f204678c22c8ab0a3f04de5a84bc"},{url:"_assets/css/home.css",revision:"47e959c521f5a6bba9d1760fbfdee268"},{url:"_assets/js/enforceaccess.js",revision:"30f47762e29904fb02ffcf5544cf385f"},{url:"_assets/js/global.js",revision:"0accba53bb3f53bcfe1d0cb42856848f"},{url:"_assets/js/home.js",revision:"2f3a431288b333d50d9b39a97b3edd45"},{url:"_assets/js/jquery-3.5.1.slim.min.js",revision:"fb8409a092adc6e8be17e87d59e0595e"},{url:"_assets/js/moment-timezone-with-data-2012-2022.min.js",revision:"fdf4854a41873ce3d982b5f8daf0f01e"},{url:"_assets/js/moment.js",revision:"b9abfc33f4932497e3b5269261a25188"},{url:"_assets/js/popper.min.js",revision:"1022eaf388cc780bcfeb6456157adb7d"},{url:"employees/add/index.html",revision:"6940ea83fecc00173f0508fe3b6774db"},{url:"employees/add/logic.js",revision:"1911b811142cf7efb3dda8a6e53f653a"},{url:"employees/index.html",revision:"248d9162c7923450ae51b694805bf3e2"},{url:"employees/logic.js",revision:"0422a55f8687fc58e4bfd87a652364c6"},{url:"employees/profile/edit/index.html",revision:"c72c1575aa8af874e655015e94c07340"},{url:"employees/profile/edit/logic.js",revision:"63bf6d40bb2308a172a55172c77a36a9"},{url:"employees/profile/index.html",revision:"628cea4a9d909c2d997ef8a1a7c0e820"},{url:"employees/profile/logic.js",revision:"f78b23b893870757dd176cafb0fff416"},{url:"employees/time/index.html",revision:"219b26988049dc7a6912b02482dc5f89"},{url:"employees/time/logic.js",revision:"b92fad81aa075fbd6776f1c81aed8e04"},{url:"employees/time/summary/index.html",revision:"52cdb38cfa00668f88419522cc6a952f"},{url:"employees/time/summary/logic.js",revision:"83aed489e93a76e0942b20c7c0ded997"},{url:"employment/add-a-job/index.html",revision:"6bb8831f875d4a27e3dc008be7ae3584"},{url:"employment/add-a-job/logic.js",revision:"e544bc245565f87cf6ad285b0f262d2a"},{url:"employment/employers/add/index.html",revision:"ed5d5e4d2765cd1dc8588c74ffb2b35d"},{url:"employment/employers/add/logic.js",revision:"66a407b64c1a9b5c8cce05a827bab13c"},{url:"employment/employers/index.html",revision:"8140b436da2c2085808cbc86f9ab16ac"},{url:"employment/employers/logic.js",revision:"b20720ffeebeb6abfa6bd863d3b52976"},{url:"employment/employers/profile/edit/index.html",revision:"6c23b12e29308215f8144c84b63c3f48"},{url:"employment/employers/profile/edit/logic.js",revision:"ba07db77f1796ff7427cd110cb74475a"},{url:"employment/employers/profile/index.html",revision:"db87e07a7560dc4f28ce42947c97cc85"},{url:"employment/employers/profile/logic.js",revision:"63e50c300de04f1fb3006187862a543d"},{url:"employment/index.html",revision:"377ab87876e71ff5d613de7326ad22cd"},{url:"employment/logic.js",revision:"f3fc8baeb38dd529e571bacba584d8b0"},{url:"employment/profile/edit/index.html",revision:"59119d75a79732d33578f1eed4a8198f"},{url:"employment/profile/edit/logic.js",revision:"fb1c4dfc8ac22b1932149e3da2b974a0"},{url:"employment/profile/index.html",revision:"2298af5bb9f44e426c2de6ef6d8ee696"},{url:"employment/profile/logic.js",revision:"4fb12eaa245e30c1be85025dbc5dbca8"},{url:"forgot-password/index.html",revision:"863cfe286f61668a09beeb9280eb1413"},{url:"forgot-password/logic.js",revision:"52048fe65c84750da9b19ed6af0ba182"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"housing/add-a-home/index.html",revision:"a574f7e92d7ffe20607576ba8729d993"},{url:"housing/add-a-home/logic.js",revision:"36a5f40484eca8f29c54e94cac341f9c"},{url:"housing/index.html",revision:"fd9c38b2acd560575846eba2b307a298"},{url:"housing/logic.js",revision:"00f2238b5ba0126e7de8aba23176f17c"},{url:"housing/profile/edit/index.html",revision:"e88e93e92a09c8fbf744079cf5019d27"},{url:"housing/profile/edit/logic.js",revision:"dbf5dc62f3eebf5b387c50ed3dfab94b"},{url:"housing/profile/index.html",revision:"34db667aba688c0d8b85eb06f0c85c11"},{url:"housing/profile/logic.js",revision:"45734fdb48214bc1f92f94d88edc0bff"},{url:"housing/providers/add/index.html",revision:"a40e84bafeae38baeec0911f4812a1ba"},{url:"housing/providers/add/logic.js",revision:"f161cd8570b28ac63eaf9abb56279af8"},{url:"housing/providers/index.html",revision:"3282faf984246d2298773088ad86a6b1"},{url:"housing/providers/logic.js",revision:"01a71d9e2a502965cdd3ee155c71c1d3"},{url:"housing/providers/profile/edit/index.html",revision:"3dcb7e1f19aef9ace905bef87ac57e27"},{url:"housing/providers/profile/edit/logic.js",revision:"8efb627bf851e15d90d6932dc6a8f84b"},{url:"housing/providers/profile/index.html",revision:"394f3b17aeb890ce300f02ba4828d145"},{url:"housing/providers/profile/logic.js",revision:"67935ab2e030c6b9df3faa42e7418fd0"},{url:"index.html",revision:"9a8f0dc286d68d3342b37e36fcb5de3b"},{url:"login/index.html",revision:"0867b6bdfd8acf9455f5588f777dd314"},{url:"login/logic.js",revision:"bb3bccd000288e024c0311ff7539da88"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"4edc96489daa53bb2dd42a4eeb597605"},{url:"logout/logic.js",revision:"70c480676cd00ef0950d9e84b2911fcb"},{url:"offline/index.html",revision:"acc31e52037aa4f2f3134fe816a04fc0"},{url:"offline/logic.js",revision:"b92a0c52fa2df2fadf955a2395dfc546"},{url:"participants/add/index.html",revision:"dcd9ada5199478fd1f836cb3c1b94f7d"},{url:"participants/add/logic.js",revision:"b6c45c5f6699eb6008774ebb3ed56b71"},{url:"participants/casenotes/index.html",revision:"533d7424168693e7745b6b033b482ea9"},{url:"participants/casenotes/logic.js",revision:"bd23d6027684f53785fa39b0ccd1918d"},{url:"participants/index.html",revision:"f3375b98103826691205fa3c87a92245"},{url:"participants/logic.js",revision:"d0ce273350a10faaefa57efb24d04dfd"},{url:"participants/profile/edit/index.html",revision:"ef3d5b731dbdc79d7a7614f64264adc5"},{url:"participants/profile/edit/logic.js",revision:"ad99ccbe63124f1b49f4f5ae250d17f4"},{url:"participants/profile/index.html",revision:"0119b44be531d12d8ace508c3e6a7632"},{url:"participants/profile/logic.js",revision:"d0c42e044d09355f72a36ac28d686124"},{url:"password-must-change/index.html",revision:"a64a0d1ed1cf7fdb6fdbdc62160c8cf5"},{url:"password-must-change/logic.js",revision:"4431cc7df61013a14c2304cba9309129"},{url:"profile/index.html",revision:"8a35fb4f7d1024fe5754a3dd4d99b977"},{url:"profile/logic.js",revision:"0f1f3ce719843cbca5ae14aa3d68f108"},{url:"register-confirm/index.html",revision:"d0b02c3eafc98cee8658e6586d68c7aa"},{url:"register-confirm/logic.js",revision:"acca4fdd73d6a545c7ed43d051a3fb6c"},{url:"register/index.html",revision:"5ddb06789c359709b7969457b3967043"},{url:"register/logic.js",revision:"c8805b0fbf37f371be5182d5d93c4182"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"10b806d8e67b244fa40ff0fd2f7b3f0f"},{url:"reset-password/logic.js",revision:"78908cd2413823bb373469b258d27494"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
