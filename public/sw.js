if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let i=Promise.resolve();return s[e]||(i=new Promise((async i=>{if("document"in self){const s=document.createElement("script");s.src=e,document.head.appendChild(s),s.onload=i}else importScripts(e),i()}))),i.then((()=>{if(!s[e])throw new Error(`Module ${e} didn’t register its module`);return s[e]}))},i=(i,s)=>{Promise.all(i.map(e)).then((e=>s(1===e.length?e[0]:e)))},s={require:Promise.resolve(i)};self.define=(i,r,o)=>{s[i]||(s[i]=Promise.resolve().then((()=>{let s={};const d={uri:location.origin+i.slice(1)};return Promise.all(r.map((i=>{switch(i){case"exports":return s;case"module":return d;default:return e(i)}}))).then((e=>{const i=o(...e);return s.default||(s.default=i),s}))})))}}define("./sw.js",["./workbox-6acbdf4d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap.css",revision:"b2c06c42fd29dbb0b1205956752272e5"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.bundle.min.js",revision:"21f815ff6d1883c4e81d821d38ff4070"},{url:"_assets/css/global.css",revision:"aa06f204678c22c8ab0a3f04de5a84bc"},{url:"_assets/css/home.css",revision:"ec8d83908977b40948d2e482b9971ab6"},{url:"_assets/js/enforceaccess.js",revision:"dc7a6bfb40799ea1b9dea6f74d323f76"},{url:"_assets/js/global.js",revision:"9e7c1ae07871d9c9173e08721e9edec3"},{url:"_assets/js/home.js",revision:"5d42d4f9e8b1d3f3f75c1f63d2cb2f81"},{url:"_assets/js/jquery-3.5.1.slim.min.js",revision:"fb8409a092adc6e8be17e87d59e0595e"},{url:"_assets/js/moment-timezone-with-data-2012-2022.min.js",revision:"fdf4854a41873ce3d982b5f8daf0f01e"},{url:"_assets/js/moment.js",revision:"b9abfc33f4932497e3b5269261a25188"},{url:"_assets/js/popper.min.js",revision:"1022eaf388cc780bcfeb6456157adb7d"},{url:"employees/add/index.html",revision:"7af5d626c8e02fb5eaa55e1a7c7a9e5b"},{url:"employees/add/logic.js",revision:"46766fb3cf819da86d7cd564e3ab6977"},{url:"employees/index.html",revision:"248d9162c7923450ae51b694805bf3e2"},{url:"employees/logic.js",revision:"0422a55f8687fc58e4bfd87a652364c6"},{url:"employees/profile/edit/index.html",revision:"256c944a1d017de40a3e8a4fee3388b7"},{url:"employees/profile/edit/logic.js",revision:"63bf6d40bb2308a172a55172c77a36a9"},{url:"employees/profile/index.html",revision:"14ccb6e391085ad072f0779cc7124fc9"},{url:"employees/profile/logic.js",revision:"99f19b7c8b8c263ecbd9d87b1d49c4c8"},{url:"employees/time/index.html",revision:"219b26988049dc7a6912b02482dc5f89"},{url:"employees/time/logic.js",revision:"9c72990161fc43bfe5e452b2227f06e3"},{url:"employment/add-a-job/index.html",revision:"8167b02f66c04a382e8ade7a45ccd70b"},{url:"employment/add-a-job/logic.js",revision:"e544bc245565f87cf6ad285b0f262d2a"},{url:"employment/employers/add/index.html",revision:"ed5d5e4d2765cd1dc8588c74ffb2b35d"},{url:"employment/employers/add/logic.js",revision:"66a407b64c1a9b5c8cce05a827bab13c"},{url:"employment/employers/index.html",revision:"8140b436da2c2085808cbc86f9ab16ac"},{url:"employment/employers/logic.js",revision:"b20720ffeebeb6abfa6bd863d3b52976"},{url:"employment/employers/profile/edit/index.html",revision:"6c23b12e29308215f8144c84b63c3f48"},{url:"employment/employers/profile/edit/logic.js",revision:"ba07db77f1796ff7427cd110cb74475a"},{url:"employment/employers/profile/index.html",revision:"db87e07a7560dc4f28ce42947c97cc85"},{url:"employment/employers/profile/logic.js",revision:"63e50c300de04f1fb3006187862a543d"},{url:"employment/index.html",revision:"7dd6ab7374fa1e629eea406c8576f6e7"},{url:"employment/logic.js",revision:"f3fc8baeb38dd529e571bacba584d8b0"},{url:"employment/profile/edit/index.html",revision:"b772479e780c869c26d1f5f67039bbec"},{url:"employment/profile/edit/logic.js",revision:"fb1c4dfc8ac22b1932149e3da2b974a0"},{url:"employment/profile/index.html",revision:"2b20f65bba78c575313105df9dd30dca"},{url:"employment/profile/logic.js",revision:"468d67bc0c9a50fedaec9114223091b9"},{url:"forgot-password/index.html",revision:"77860ba7833e787c9f3cc1bbbff4374e"},{url:"forgot-password/logic.js",revision:"52048fe65c84750da9b19ed6af0ba182"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"housing/add-a-home/index.html",revision:"74bfb4affb86a5ba4b5198cacf869755"},{url:"housing/add-a-home/logic.js",revision:"36a5f40484eca8f29c54e94cac341f9c"},{url:"housing/index.html",revision:"4057239b34d8eec80121ff2e06ff464e"},{url:"housing/logic.js",revision:"8c46e46bfb86db107847a9228f1db9c4"},{url:"housing/providers/add/index.html",revision:"a40e84bafeae38baeec0911f4812a1ba"},{url:"housing/providers/add/logic.js",revision:"b7514ae4167ae8726d6cfd3127f86145"},{url:"housing/providers/index.html",revision:"3282faf984246d2298773088ad86a6b1"},{url:"housing/providers/logic.js",revision:"2cf294982c7646f8e07a9c4696a8c7c1"},{url:"housing/providers/profile/edit/index.html",revision:"3dcb7e1f19aef9ace905bef87ac57e27"},{url:"housing/providers/profile/edit/logic.js",revision:"8efb627bf851e15d90d6932dc6a8f84b"},{url:"housing/providers/profile/index.html",revision:"394f3b17aeb890ce300f02ba4828d145"},{url:"housing/providers/profile/logic.js",revision:"67935ab2e030c6b9df3faa42e7418fd0"},{url:"index.html",revision:"ec98865d1667fa279164ff2753e493f9"},{url:"login/index.html",revision:"0867b6bdfd8acf9455f5588f777dd314"},{url:"login/logic.js",revision:"bb3bccd000288e024c0311ff7539da88"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"4edc96489daa53bb2dd42a4eeb597605"},{url:"logout/logic.js",revision:"70c480676cd00ef0950d9e84b2911fcb"},{url:"offline/index.html",revision:"acc31e52037aa4f2f3134fe816a04fc0"},{url:"offline/logic.js",revision:"b92a0c52fa2df2fadf955a2395dfc546"},{url:"participants/add/index.html",revision:"b2663261b6df53c39a1c8f9a8151d5c8"},{url:"participants/add/logic.js",revision:"7b7d7bb6efd539f1fcf2801f0631f80a"},{url:"participants/index.html",revision:"f718fae2b6de475c4a22884edbc2b65f"},{url:"participants/logic.js",revision:"1864a7dfcbbbf6321d0e3813a7066d5d"},{url:"participants/profile/edit/index.html",revision:"de1ab89274d927d7dcde26d5a3a5c44f"},{url:"participants/profile/edit/logic.js",revision:"347b29e7393c1cca6387627c2dbea7fb"},{url:"participants/profile/index.html",revision:"98afe29610ec3db797b9f5130760e5cf"},{url:"participants/profile/logic.js",revision:"0de747bee72d6c8e4d0630ec611bd9ad"},{url:"password-must-change/index.html",revision:"a64a0d1ed1cf7fdb6fdbdc62160c8cf5"},{url:"password-must-change/logic.js",revision:"4431cc7df61013a14c2304cba9309129"},{url:"profile/index.html",revision:"bf0751a3fa8a777d2467261c45e60a2e"},{url:"profile/logic.js",revision:"0f1f3ce719843cbca5ae14aa3d68f108"},{url:"register-confirm/index.html",revision:"d0b02c3eafc98cee8658e6586d68c7aa"},{url:"register-confirm/logic.js",revision:"acca4fdd73d6a545c7ed43d051a3fb6c"},{url:"register/index.html",revision:"5f9c6bce7d3b72a11cbaa658962f8163"},{url:"register/logic.js",revision:"abdc881565dbc686846bedfc74b80abf"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"10b806d8e67b244fa40ff0fd2f7b3f0f"},{url:"reset-password/logic.js",revision:"78908cd2413823bb373469b258d27494"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
