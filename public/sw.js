if(!self.define){const s=s=>{"require"!==s&&(s+=".js");let e=Promise.resolve();return a[s]||(e=new Promise(async e=>{if("document"in self){const a=document.createElement("script");a.src=s,document.head.appendChild(a),a.onload=e}else importScripts(s),e()})),e.then(()=>{if(!a[s])throw new Error(`Module ${s} didn’t register its module`);return a[s]})},e=(e,a)=>{Promise.all(e.map(s)).then(s=>a(1===s.length?s[0]:s))},a={require:Promise.resolve(e)};self.define=(e,r,t)=>{a[e]||(a[e]=Promise.resolve().then(()=>{let a={};const i={uri:location.origin+e.slice(1)};return Promise.all(r.map(e=>{switch(e){case"exports":return a;case"module":return i;default:return s(e)}})).then(s=>{const e=t(...s);return a.default||(a.default=e),a})}))}}define("./sw.js",["./workbox-24f346ed"],(function(s){"use strict";self.addEventListener("message",s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()}),s.precacheAndRoute([{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-grid.css",revision:"56190e233adeee9042990edaef6ab6dd"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-grid.min.css",revision:"669404687b63e2bb1d1830bdc0365d7e"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-reboot.css",revision:"e5e6a51b28495e17e8ae63d2719d573c"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-reboot.min.css",revision:"78c67048b56f66e7702c7f718868f9d3"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap.css",revision:"b2c06c42fd29dbb0b1205956752272e5"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap.min.css",revision:"816af0eddd3b4822c2756227c7e7b7ee"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.bundle.js",revision:"f6f318002edd81c17fe079429cd8d866"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.bundle.min.js",revision:"21f815ff6d1883c4e81d821d38ff4070"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.js",revision:"54bdb9610fd9a27da4fddd99c39de9e5"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.min.js",revision:"02d223393e00c273efdcb1ade8f4f8b1"},{url:"_assets/Chart.js/Chart.bundle.js",revision:"fa54734fcf81ccf0f5d3940e146ea02e"},{url:"_assets/Chart.js/Chart.bundle.min.js",revision:"86cc8cd0eb5d5a2b42c1fa46b922d338"},{url:"_assets/Chart.js/Chart.css",revision:"28dc89b92b7e59392029cfd2769027ab"},{url:"_assets/Chart.js/Chart.js",revision:"aa0d045c7eefcedf60a4e27a6c613d19"},{url:"_assets/Chart.js/Chart.min.css",revision:"7d8693e997109f2aeac04066301679d6"},{url:"_assets/Chart.js/Chart.min.js",revision:"b5c2301eb15826bf38c9bdcaa3bbe786"},{url:"_assets/Chart.js/samples/advanced/content-security-policy.css",revision:"83d50245700d50f59c5bb6afa2f3f2ca"},{url:"_assets/Chart.js/samples/advanced/content-security-policy.html",revision:"4c23ecb312396d6ee8191753bae12f9d"},{url:"_assets/Chart.js/samples/advanced/content-security-policy.js",revision:"7785874422bcf88cea6ca9864b2f0c7f"},{url:"_assets/Chart.js/samples/advanced/progress-bar.html",revision:"dd0af1c1a317fdefb829ead9ae669397"},{url:"_assets/Chart.js/samples/charts/area/analyser.js",revision:"6e2a01854d79b9e116102793ec450e04"},{url:"_assets/Chart.js/samples/charts/area/line-boundaries.html",revision:"af252f5fdb23e37202b4ce56e1a22785"},{url:"_assets/Chart.js/samples/charts/area/line-datasets.html",revision:"76fd06679e32cb0b75377bc9fafadee6"},{url:"_assets/Chart.js/samples/charts/area/line-stacked.html",revision:"d225a926dee652fd3bd498eaf37054ac"},{url:"_assets/Chart.js/samples/charts/area/radar.html",revision:"9e8935bc6a764083a59ad0dd6120de0f"},{url:"_assets/Chart.js/samples/charts/bar/horizontal.html",revision:"a141d5bdee612a06e6eafc329fb4e317"},{url:"_assets/Chart.js/samples/charts/bar/multi-axis.html",revision:"b29ec12869e9c2f42c841ad8a8e12122"},{url:"_assets/Chart.js/samples/charts/bar/stacked-group.html",revision:"46f912e454750c0031508aca723bf80d"},{url:"_assets/Chart.js/samples/charts/bar/stacked.html",revision:"701fb3323e59ecf79e36f9e4a7a4ae28"},{url:"_assets/Chart.js/samples/charts/bar/vertical.html",revision:"2c000a0906cf1bccaf9007f78395d2f9"},{url:"_assets/Chart.js/samples/charts/bubble.html",revision:"a274409ba13967c78948aee03d46cf37"},{url:"_assets/Chart.js/samples/charts/combo-bar-line.html",revision:"b6ec0dcf11f84f328bcb73d9deda675a"},{url:"_assets/Chart.js/samples/charts/doughnut.html",revision:"2a024bd2b13d69e0bbb3a16d8ed8aaf1"},{url:"_assets/Chart.js/samples/charts/line/basic.html",revision:"11ad0a1d4567918afd43e5810aac977c"},{url:"_assets/Chart.js/samples/charts/line/interpolation-modes.html",revision:"358b9972a0d76b0be1b83136f7522a48"},{url:"_assets/Chart.js/samples/charts/line/line-styles.html",revision:"e2c99f9dcf76952583cfb4a3387b9b50"},{url:"_assets/Chart.js/samples/charts/line/multi-axis.html",revision:"83212f4a8b1931b66926f035955c72ff"},{url:"_assets/Chart.js/samples/charts/line/point-sizes.html",revision:"55f6aec91e2915bc9ab85f93e754dbce"},{url:"_assets/Chart.js/samples/charts/line/point-styles.html",revision:"4a6773b9dc0a9f17dfb992578d254288"},{url:"_assets/Chart.js/samples/charts/line/skip-points.html",revision:"4effa40301b4680d0bd2e79664c7b7ee"},{url:"_assets/Chart.js/samples/charts/line/stepped.html",revision:"d0509e0617742b69fbadc1dec0ebd009"},{url:"_assets/Chart.js/samples/charts/pie.html",revision:"6b77a0dde88d6a9a11641057085fbec7"},{url:"_assets/Chart.js/samples/charts/polar-area.html",revision:"ca981f93c5a4a262ddd78d3203f92e7e"},{url:"_assets/Chart.js/samples/charts/radar-skip-points.html",revision:"b9f97905fe6c29e78caa63fec0c80e26"},{url:"_assets/Chart.js/samples/charts/radar.html",revision:"7a361db224e95f89c5438804a6a8a61b"},{url:"_assets/Chart.js/samples/charts/scatter/basic.html",revision:"2187872259b5782934ed3c8f9b0e7d80"},{url:"_assets/Chart.js/samples/charts/scatter/multi-axis.html",revision:"8be5e3c4b87e127b623e65fb86c115eb"},{url:"_assets/Chart.js/samples/index.html",revision:"045875e15d22885512b71d801fffe862"},{url:"_assets/Chart.js/samples/legend/callbacks.html",revision:"79b32e83f8e1f5f89b9603228b071174"},{url:"_assets/Chart.js/samples/legend/point-style.html",revision:"55958076580ab966b0a57459fb312edc"},{url:"_assets/Chart.js/samples/legend/positioning.html",revision:"f1fcf9a0c605c40b8d61e8dd0fc5c070"},{url:"_assets/Chart.js/samples/samples.js",revision:"6178380bbb5be9cfc72baf4136682e28"},{url:"_assets/Chart.js/samples/scales/filtering-labels.html",revision:"f487d6c647a6eb267c4a4f33d027ba6e"},{url:"_assets/Chart.js/samples/scales/gridlines-display.html",revision:"1f84ead96c4609372c70271f93f57aaa"},{url:"_assets/Chart.js/samples/scales/gridlines-style.html",revision:"05a0de0686a4c16995a93aed03b3afe1"},{url:"_assets/Chart.js/samples/scales/linear/min-max-suggested.html",revision:"966594c2b4a0bdb1d37594b08cbd8bd9"},{url:"_assets/Chart.js/samples/scales/linear/min-max.html",revision:"fd8b513cb8f4681291d88bf71de33d09"},{url:"_assets/Chart.js/samples/scales/linear/step-size.html",revision:"6040087ea9fe7d1758666095778f34da"},{url:"_assets/Chart.js/samples/scales/logarithmic/line.html",revision:"7c47803e4fd70833b4ace16d0fdea4ee"},{url:"_assets/Chart.js/samples/scales/logarithmic/scatter.html",revision:"c6e51621d222be29b6f8e5f0070873cd"},{url:"_assets/Chart.js/samples/scales/multiline-labels.html",revision:"fdc7bdc7d6d1e70c39c5ddd2e7232d95"},{url:"_assets/Chart.js/samples/scales/non-numeric-y.html",revision:"eef4720f93e8853a267bf5e7a91e2d98"},{url:"_assets/Chart.js/samples/scales/time/combo.html",revision:"7024111b452bf16bd15574b43c11810f"},{url:"_assets/Chart.js/samples/scales/time/financial.html",revision:"2b710d7b1f420a218a7e88963269a5e4"},{url:"_assets/Chart.js/samples/scales/time/line-point-data.html",revision:"5089790cf35f97f218288bf43bec98f3"},{url:"_assets/Chart.js/samples/scales/time/line.html",revision:"93e9f1e85b339fff723d14a233218621"},{url:"_assets/Chart.js/samples/scales/toggle-scale-type.html",revision:"47a9538ef2dfe836219f5d1aceb668bb"},{url:"_assets/Chart.js/samples/scriptable/bar.html",revision:"e419f842007b9f0f820d6850d9e4e976"},{url:"_assets/Chart.js/samples/scriptable/bubble.html",revision:"06382e22bd4b09764a515225e3224b20"},{url:"_assets/Chart.js/samples/scriptable/line.html",revision:"49eab3ca161e4205e70a71890a53cd56"},{url:"_assets/Chart.js/samples/scriptable/pie.html",revision:"718da660320545110ef4b6ee45358aba"},{url:"_assets/Chart.js/samples/scriptable/polar.html",revision:"204ef318b7d15573840987083d9e21cf"},{url:"_assets/Chart.js/samples/scriptable/radar.html",revision:"c892538fc9affdc7ba32b5f01118619b"},{url:"_assets/Chart.js/samples/style.css",revision:"c88e01bac9c42fa3afec19a2d9a4fd8a"},{url:"_assets/Chart.js/samples/tooltips/border.html",revision:"945ccb7e15fe7f862ea280fc9ed1766b"},{url:"_assets/Chart.js/samples/tooltips/callbacks.html",revision:"99e4d584f1491a9fda10307595e6fbf4"},{url:"_assets/Chart.js/samples/tooltips/custom-line.html",revision:"a6d55d2f9f914ee83c55f7bacc23cbee"},{url:"_assets/Chart.js/samples/tooltips/custom-pie.html",revision:"94523902b9cf85165f9eb536db9cdbf2"},{url:"_assets/Chart.js/samples/tooltips/custom-points.html",revision:"c04ca8acaa853952cfd5f2bb9931c56a"},{url:"_assets/Chart.js/samples/tooltips/interactions.html",revision:"48e8a59b4fc522376004e37f4434e163"},{url:"_assets/Chart.js/samples/tooltips/positioning.html",revision:"9d58d087c64aea1945e81849949c502f"},{url:"_assets/Chart.js/samples/utils.js",revision:"39101ba127442f487ca204ee715b6c19"},{url:"_assets/css/global.css",revision:"aa06f204678c22c8ab0a3f04de5a84bc"},{url:"_assets/css/home.css",revision:"ec8d83908977b40948d2e482b9971ab6"},{url:"_assets/js/global.js",revision:"27b0b72b48360d39a473cc919c918b44"},{url:"_assets/js/home.js",revision:"89d6d4077e67d84853d95822e5a4cbd3"},{url:"_assets/js/jquery-3.5.1.slim.min.js",revision:"fb8409a092adc6e8be17e87d59e0595e"},{url:"_assets/js/moment-timezone-with-data-2012-2022.min.js",revision:"fdf4854a41873ce3d982b5f8daf0f01e"},{url:"_assets/js/moment.js",revision:"b9abfc33f4932497e3b5269261a25188"},{url:"_assets/js/popper.min.js",revision:"1022eaf388cc780bcfeb6456157adb7d"},{url:"employees/add/index.html",revision:"fc3dcc0e29c7d94ea5e900dc3bca8719"},{url:"employees/add/logic.js",revision:"46766fb3cf819da86d7cd564e3ab6977"},{url:"employees/index.html",revision:"99dacbfc13f8e16f40e3358c49cd7bdc"},{url:"employees/logic.js",revision:"0422a55f8687fc58e4bfd87a652364c6"},{url:"employees/profile/edit/index.html",revision:"c49f5b6fd1492b8a8ddb9aec69fa36b3"},{url:"employees/profile/edit/logic.js",revision:"dfbc8c606b6b5a70a72b1f783b700fac"},{url:"employees/profile/index.html",revision:"9a682bff0f9feff2c2d3d1e7ee3a2293"},{url:"employees/profile/logic.js",revision:"a3e3a4a04310ba8fc5da64588a38e825"},{url:"employees/time/index.html",revision:"4b66eebe9cf4bfbcb8b502f3d8fa2316"},{url:"employees/time/logic.js",revision:"816767dcccd94242b618aa644bf3cf30"},{url:"forgot-password/index.html",revision:"24ca5000bbf375853a75703d49f470ad"},{url:"forgot-password/logic.js",revision:"cbe720c56d5a771896c6f6de2b320c67"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"index.html",revision:"9499e9762f9469c16212d5ac439bb37f"},{url:"login/index.html",revision:"a7ecd2deee0a02c91c9b2802a77c0ee9"},{url:"login/logic.js",revision:"e464554933d2f8bcc2c0b277e97bcd3d"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"4edc96489daa53bb2dd42a4eeb597605"},{url:"logout/logic.js",revision:"70c480676cd00ef0950d9e84b2911fcb"},{url:"offline/index.html",revision:"4a2204dc3f3813576ea518284e34f7c5"},{url:"offline/logic.js",revision:"b67114a9f26319ccb286d0209ed1fa56"},{url:"password-must-change/index.html",revision:"236439a9f296b939b7ba5e0053856ecd"},{url:"password-must-change/logic.js",revision:"4431cc7df61013a14c2304cba9309129"},{url:"register-confirm/index.html",revision:"1e8b2c521560b7e4fb95ef4f48a8f3ba"},{url:"register-confirm/logic.js",revision:"fef1d9e3fe55a16622d07c6e3ff7417f"},{url:"register/index.html",revision:"25e08ca79ba74f1272cfb256d3d47e36"},{url:"register/logic.js",revision:"abdc881565dbc686846bedfc74b80abf"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"2403dc4c5c1d3d85ab58b54e3d354d26"},{url:"reset-password/logic.js",revision:"4d29eda9d6f9ae81d43e6bb6b57b9f3f"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
