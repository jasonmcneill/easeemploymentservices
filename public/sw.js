if(!self.define){const s=s=>{"require"!==s&&(s+=".js");let e=Promise.resolve();return a[s]||(e=new Promise(async e=>{if("document"in self){const a=document.createElement("script");a.src=s,document.head.appendChild(a),a.onload=e}else importScripts(s),e()})),e.then(()=>{if(!a[s])throw new Error(`Module ${s} didn’t register its module`);return a[s]})},e=(e,a)=>{Promise.all(e.map(s)).then(s=>a(1===s.length?s[0]:s))},a={require:Promise.resolve(e)};self.define=(e,r,i)=>{a[e]||(a[e]=Promise.resolve().then(()=>{let a={};const t={uri:location.origin+e.slice(1)};return Promise.all(r.map(e=>{switch(e){case"exports":return a;case"module":return t;default:return s(e)}})).then(s=>{const e=i(...s);return a.default||(a.default=e),a})}))}}define("./sw.js",["./workbox-24f346ed"],(function(s){"use strict";self.addEventListener("message",s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()}),s.precacheAndRoute([{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-grid.css",revision:"56190e233adeee9042990edaef6ab6dd"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-grid.min.css",revision:"669404687b63e2bb1d1830bdc0365d7e"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-reboot.css",revision:"e5e6a51b28495e17e8ae63d2719d573c"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap-reboot.min.css",revision:"78c67048b56f66e7702c7f718868f9d3"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap.css",revision:"b2c06c42fd29dbb0b1205956752272e5"},{url:"_assets/bootstrap-4.5.2-dist/css/bootstrap.min.css",revision:"816af0eddd3b4822c2756227c7e7b7ee"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.bundle.js",revision:"f6f318002edd81c17fe079429cd8d866"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.bundle.min.js",revision:"21f815ff6d1883c4e81d821d38ff4070"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.js",revision:"54bdb9610fd9a27da4fddd99c39de9e5"},{url:"_assets/bootstrap-4.5.2-dist/js/bootstrap.min.js",revision:"02d223393e00c273efdcb1ade8f4f8b1"},{url:"_assets/Chart.js/Chart.bundle.js",revision:"fa54734fcf81ccf0f5d3940e146ea02e"},{url:"_assets/Chart.js/Chart.bundle.min.js",revision:"86cc8cd0eb5d5a2b42c1fa46b922d338"},{url:"_assets/Chart.js/Chart.css",revision:"28dc89b92b7e59392029cfd2769027ab"},{url:"_assets/Chart.js/Chart.js",revision:"aa0d045c7eefcedf60a4e27a6c613d19"},{url:"_assets/Chart.js/Chart.min.css",revision:"7d8693e997109f2aeac04066301679d6"},{url:"_assets/Chart.js/Chart.min.js",revision:"b5c2301eb15826bf38c9bdcaa3bbe786"},{url:"_assets/Chart.js/samples/advanced/content-security-policy.css",revision:"83d50245700d50f59c5bb6afa2f3f2ca"},{url:"_assets/Chart.js/samples/advanced/content-security-policy.html",revision:"4c23ecb312396d6ee8191753bae12f9d"},{url:"_assets/Chart.js/samples/advanced/content-security-policy.js",revision:"7785874422bcf88cea6ca9864b2f0c7f"},{url:"_assets/Chart.js/samples/advanced/progress-bar.html",revision:"dd0af1c1a317fdefb829ead9ae669397"},{url:"_assets/Chart.js/samples/charts/area/analyser.js",revision:"6e2a01854d79b9e116102793ec450e04"},{url:"_assets/Chart.js/samples/charts/area/line-boundaries.html",revision:"af252f5fdb23e37202b4ce56e1a22785"},{url:"_assets/Chart.js/samples/charts/area/line-datasets.html",revision:"76fd06679e32cb0b75377bc9fafadee6"},{url:"_assets/Chart.js/samples/charts/area/line-stacked.html",revision:"d225a926dee652fd3bd498eaf37054ac"},{url:"_assets/Chart.js/samples/charts/area/radar.html",revision:"9e8935bc6a764083a59ad0dd6120de0f"},{url:"_assets/Chart.js/samples/charts/bar/horizontal.html",revision:"a141d5bdee612a06e6eafc329fb4e317"},{url:"_assets/Chart.js/samples/charts/bar/multi-axis.html",revision:"b29ec12869e9c2f42c841ad8a8e12122"},{url:"_assets/Chart.js/samples/charts/bar/stacked-group.html",revision:"46f912e454750c0031508aca723bf80d"},{url:"_assets/Chart.js/samples/charts/bar/stacked.html",revision:"701fb3323e59ecf79e36f9e4a7a4ae28"},{url:"_assets/Chart.js/samples/charts/bar/vertical.html",revision:"2c000a0906cf1bccaf9007f78395d2f9"},{url:"_assets/Chart.js/samples/charts/bubble.html",revision:"a274409ba13967c78948aee03d46cf37"},{url:"_assets/Chart.js/samples/charts/combo-bar-line.html",revision:"b6ec0dcf11f84f328bcb73d9deda675a"},{url:"_assets/Chart.js/samples/charts/doughnut.html",revision:"2a024bd2b13d69e0bbb3a16d8ed8aaf1"},{url:"_assets/Chart.js/samples/charts/line/basic.html",revision:"11ad0a1d4567918afd43e5810aac977c"},{url:"_assets/Chart.js/samples/charts/line/interpolation-modes.html",revision:"358b9972a0d76b0be1b83136f7522a48"},{url:"_assets/Chart.js/samples/charts/line/line-styles.html",revision:"e2c99f9dcf76952583cfb4a3387b9b50"},{url:"_assets/Chart.js/samples/charts/line/multi-axis.html",revision:"83212f4a8b1931b66926f035955c72ff"},{url:"_assets/Chart.js/samples/charts/line/point-sizes.html",revision:"55f6aec91e2915bc9ab85f93e754dbce"},{url:"_assets/Chart.js/samples/charts/line/point-styles.html",revision:"4a6773b9dc0a9f17dfb992578d254288"},{url:"_assets/Chart.js/samples/charts/line/skip-points.html",revision:"4effa40301b4680d0bd2e79664c7b7ee"},{url:"_assets/Chart.js/samples/charts/line/stepped.html",revision:"d0509e0617742b69fbadc1dec0ebd009"},{url:"_assets/Chart.js/samples/charts/pie.html",revision:"6b77a0dde88d6a9a11641057085fbec7"},{url:"_assets/Chart.js/samples/charts/polar-area.html",revision:"ca981f93c5a4a262ddd78d3203f92e7e"},{url:"_assets/Chart.js/samples/charts/radar-skip-points.html",revision:"b9f97905fe6c29e78caa63fec0c80e26"},{url:"_assets/Chart.js/samples/charts/radar.html",revision:"7a361db224e95f89c5438804a6a8a61b"},{url:"_assets/Chart.js/samples/charts/scatter/basic.html",revision:"2187872259b5782934ed3c8f9b0e7d80"},{url:"_assets/Chart.js/samples/charts/scatter/multi-axis.html",revision:"8be5e3c4b87e127b623e65fb86c115eb"},{url:"_assets/Chart.js/samples/index.html",revision:"045875e15d22885512b71d801fffe862"},{url:"_assets/Chart.js/samples/legend/callbacks.html",revision:"79b32e83f8e1f5f89b9603228b071174"},{url:"_assets/Chart.js/samples/legend/point-style.html",revision:"55958076580ab966b0a57459fb312edc"},{url:"_assets/Chart.js/samples/legend/positioning.html",revision:"f1fcf9a0c605c40b8d61e8dd0fc5c070"},{url:"_assets/Chart.js/samples/samples.js",revision:"6178380bbb5be9cfc72baf4136682e28"},{url:"_assets/Chart.js/samples/scales/filtering-labels.html",revision:"f487d6c647a6eb267c4a4f33d027ba6e"},{url:"_assets/Chart.js/samples/scales/gridlines-display.html",revision:"1f84ead96c4609372c70271f93f57aaa"},{url:"_assets/Chart.js/samples/scales/gridlines-style.html",revision:"05a0de0686a4c16995a93aed03b3afe1"},{url:"_assets/Chart.js/samples/scales/linear/min-max-suggested.html",revision:"966594c2b4a0bdb1d37594b08cbd8bd9"},{url:"_assets/Chart.js/samples/scales/linear/min-max.html",revision:"fd8b513cb8f4681291d88bf71de33d09"},{url:"_assets/Chart.js/samples/scales/linear/step-size.html",revision:"6040087ea9fe7d1758666095778f34da"},{url:"_assets/Chart.js/samples/scales/logarithmic/line.html",revision:"7c47803e4fd70833b4ace16d0fdea4ee"},{url:"_assets/Chart.js/samples/scales/logarithmic/scatter.html",revision:"c6e51621d222be29b6f8e5f0070873cd"},{url:"_assets/Chart.js/samples/scales/multiline-labels.html",revision:"fdc7bdc7d6d1e70c39c5ddd2e7232d95"},{url:"_assets/Chart.js/samples/scales/non-numeric-y.html",revision:"eef4720f93e8853a267bf5e7a91e2d98"},{url:"_assets/Chart.js/samples/scales/time/combo.html",revision:"7024111b452bf16bd15574b43c11810f"},{url:"_assets/Chart.js/samples/scales/time/financial.html",revision:"2b710d7b1f420a218a7e88963269a5e4"},{url:"_assets/Chart.js/samples/scales/time/line-point-data.html",revision:"5089790cf35f97f218288bf43bec98f3"},{url:"_assets/Chart.js/samples/scales/time/line.html",revision:"93e9f1e85b339fff723d14a233218621"},{url:"_assets/Chart.js/samples/scales/toggle-scale-type.html",revision:"47a9538ef2dfe836219f5d1aceb668bb"},{url:"_assets/Chart.js/samples/scriptable/bar.html",revision:"e419f842007b9f0f820d6850d9e4e976"},{url:"_assets/Chart.js/samples/scriptable/bubble.html",revision:"06382e22bd4b09764a515225e3224b20"},{url:"_assets/Chart.js/samples/scriptable/line.html",revision:"49eab3ca161e4205e70a71890a53cd56"},{url:"_assets/Chart.js/samples/scriptable/pie.html",revision:"718da660320545110ef4b6ee45358aba"},{url:"_assets/Chart.js/samples/scriptable/polar.html",revision:"204ef318b7d15573840987083d9e21cf"},{url:"_assets/Chart.js/samples/scriptable/radar.html",revision:"c892538fc9affdc7ba32b5f01118619b"},{url:"_assets/Chart.js/samples/style.css",revision:"c88e01bac9c42fa3afec19a2d9a4fd8a"},{url:"_assets/Chart.js/samples/tooltips/border.html",revision:"945ccb7e15fe7f862ea280fc9ed1766b"},{url:"_assets/Chart.js/samples/tooltips/callbacks.html",revision:"99e4d584f1491a9fda10307595e6fbf4"},{url:"_assets/Chart.js/samples/tooltips/custom-line.html",revision:"a6d55d2f9f914ee83c55f7bacc23cbee"},{url:"_assets/Chart.js/samples/tooltips/custom-pie.html",revision:"94523902b9cf85165f9eb536db9cdbf2"},{url:"_assets/Chart.js/samples/tooltips/custom-points.html",revision:"c04ca8acaa853952cfd5f2bb9931c56a"},{url:"_assets/Chart.js/samples/tooltips/interactions.html",revision:"48e8a59b4fc522376004e37f4434e163"},{url:"_assets/Chart.js/samples/tooltips/positioning.html",revision:"9d58d087c64aea1945e81849949c502f"},{url:"_assets/Chart.js/samples/utils.js",revision:"39101ba127442f487ca204ee715b6c19"},{url:"_assets/css/global.css",revision:"aa06f204678c22c8ab0a3f04de5a84bc"},{url:"_assets/css/home.css",revision:"ec8d83908977b40948d2e482b9971ab6"},{url:"_assets/js/global.js",revision:"89fa4d812f1016593dce8e5fa00e5613"},{url:"_assets/js/home.js",revision:"4f1604188f6f29570044bd47bb4704e6"},{url:"_assets/js/jquery-3.5.1.slim.min.js",revision:"fb8409a092adc6e8be17e87d59e0595e"},{url:"_assets/js/moment-timezone-with-data-2012-2022.min.js",revision:"fdf4854a41873ce3d982b5f8daf0f01e"},{url:"_assets/js/moment.js",revision:"b9abfc33f4932497e3b5269261a25188"},{url:"_assets/js/popper.min.js",revision:"1022eaf388cc780bcfeb6456157adb7d"},{url:"employees/add/index.html",revision:"5554a859207a56d0b7f67dba4cce1d2a"},{url:"employees/add/logic.js",revision:"46766fb3cf819da86d7cd564e3ab6977"},{url:"employees/index.html",revision:"9724461c3be494f25a24622f87d1ad45"},{url:"employees/logic.js",revision:"0422a55f8687fc58e4bfd87a652364c6"},{url:"employees/profile/edit/index.html",revision:"c6fdf227720c05c5215b9230cc9afb00"},{url:"employees/profile/edit/logic.js",revision:"dfbc8c606b6b5a70a72b1f783b700fac"},{url:"employees/profile/index.html",revision:"5ad3dfbf42a1e5b3621d8c44cb1e4994"},{url:"employees/profile/logic.js",revision:"a3e3a4a04310ba8fc5da64588a38e825"},{url:"employees/time/index.html",revision:"d19bdcd994e8ac1e49d4942d83765e39"},{url:"employees/time/logic.js",revision:"7869f66cef50a7c359181d539929ffb6"},{url:"employment/employers/add/index.html",revision:"4b79e32625d07aac88146062b8c3f777"},{url:"employment/employers/add/logic.js",revision:"0084ffb2c599321bddc51411fcef9d78"},{url:"employment/employers/index.html",revision:"5504132588b15c14deb897074fb2e80e"},{url:"employment/employers/logic.js",revision:"13efe5611f9381b447870958b774ab05"},{url:"employment/index.html",revision:"0a8ffdfb2582fa17ac713bbf9e39ee46"},{url:"employment/logic.js",revision:"3d874dd33f99ad81adcec0d5e075b1f7"},{url:"forgot-password/index.html",revision:"77860ba7833e787c9f3cc1bbbff4374e"},{url:"forgot-password/logic.js",revision:"52048fe65c84750da9b19ed6af0ba182"},{url:"forgot-password/style.css",revision:"f0e940a92732607014a98961668020c9"},{url:"index.html",revision:"0bb1ba7661b6ac1286492166b931c493"},{url:"login/index.html",revision:"0867b6bdfd8acf9455f5588f777dd314"},{url:"login/logic.js",revision:"bb3bccd000288e024c0311ff7539da88"},{url:"login/style.css",revision:"9d8b50b9644630be253353f166bd5ab7"},{url:"logout/index.html",revision:"4edc96489daa53bb2dd42a4eeb597605"},{url:"logout/logic.js",revision:"70c480676cd00ef0950d9e84b2911fcb"},{url:"offline/index.html",revision:"930d072dbace4f1b91ccaf8a0ba5c152"},{url:"offline/logic.js",revision:"b92a0c52fa2df2fadf955a2395dfc546"},{url:"participants/add/index.html",revision:"35216829ed69c61ece466871a1c5b6fb"},{url:"participants/add/logic.js",revision:"7b7d7bb6efd539f1fcf2801f0631f80a"},{url:"participants/index.html",revision:"206e0c3b15476159a729223c08d7fba0"},{url:"participants/logic.js",revision:"1864a7dfcbbbf6321d0e3813a7066d5d"},{url:"participants/profile/edit/index.html",revision:"e6c767bd2a67ece7d5af46ef069f812c"},{url:"participants/profile/edit/logic.js",revision:"8a87ee0eb0641ced47e699277dfb3b02"},{url:"participants/profile/index.html",revision:"117562f1496ff07ad101669a79b3d6ca"},{url:"participants/profile/logic.js",revision:"49aa408529d5bae7506375a78850ff3a"},{url:"password-must-change/index.html",revision:"bea7a4fdac5ffe2996fbf81d119a8603"},{url:"password-must-change/logic.js",revision:"4431cc7df61013a14c2304cba9309129"},{url:"register-confirm/index.html",revision:"d0b02c3eafc98cee8658e6586d68c7aa"},{url:"register-confirm/logic.js",revision:"acca4fdd73d6a545c7ed43d051a3fb6c"},{url:"register/index.html",revision:"5f9c6bce7d3b72a11cbaa658962f8163"},{url:"register/logic.js",revision:"abdc881565dbc686846bedfc74b80abf"},{url:"register/style.css",revision:"681fff2276e871a727c8082a6dbb8978"},{url:"reset-password/index.html",revision:"10b806d8e67b244fa40ff0fd2f7b3f0f"},{url:"reset-password/logic.js",revision:"78908cd2413823bb373469b258d27494"},{url:"reset-password/style.css",revision:"681fff2276e871a727c8082a6dbb8978"}],{})}));
//# sourceMappingURL=sw.js.map
