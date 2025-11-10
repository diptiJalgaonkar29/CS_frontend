// const CONFIG = JSON.parse(localStorage.getItem("config"));
// console.log("IUBENDA_COOKIE_POLICY_ID******", CONFIG?.IUBENDA_COOKIE_POLICY_ID);
// console.log("IUBENDA_SITE_ID******", CONFIG?.IUBENDA_SITE_ID);

// // P&C solution:

// {
//   var _iub = _iub || [];
//   _iub.csConfiguration = {
//     askConsentAtCookiePolicyUpdate: true,
//     countryDetection: true,
//     enableLgpd: true,
//     enableUspr: true,
//     floatingPreferencesButtonDisplay: "bottom-right",
//     lang: "en",
//     lgpdAppliesGlobally: false,
//     perPurposeConsent: true,
//     siteId: CONFIG?.IUBENDA_SITE_ID,
//     cookiePolicyId: CONFIG?.IUBENDA_COOKIE_POLICY_ID,
//     whitelabel: false,
//     banner: {
//       acceptButtonDisplay: true,
//       closeButtonDisplay: false,
//       customizeButtonDisplay: true,
//       explicitWithdrawal: true,
//       listPurposes: true,
//       position: "float-bottom-right",
//       rejectButtonDisplay: true,
//       showPurposesToggles: true,
//     },
//   };
// }

// (function (stubScriptSrc) {
//   var script5 = document.createElement("script");
//   script5.type = "text/javascript";
//   script5.src = stubScriptSrc;
//   // document.body.appendChild(script5);
//   tag = document.getElementsByTagName("script")[0];
//   tag.parentNode.insertBefore(script5, tag);
// })("//cdn.iubenda.com/cs/gpp/stub.js");

// {
//   /* <script type="text/javascript" src="//cdn.iubenda.com/cs/gpp/stub.js"></script>
//    */
// }

// (function (iubendaScriptSrc) {
//   var script4 = document.createElement("script");
//   script4.type = "text/javascript";
//   script4.src = iubendaScriptSrc;
//   script4.charset = "UTF-8";
//   script4.async = "true";
//   // document.body.appendChild(script4);
//   tag = document.getElementsByTagName("script")[0];
//   tag.parentNode.insertBefore(script4, tag);
// })("//cdn.iubenda.com/cs/iubenda_cs.js");

// {
//   /*
//     <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script> */
// }

// // T&C,Privacy,Cookie
// (function (w, d) {
//   var loader = function () {
//     var s = d.createElement("script");
//     tag = d.getElementsByTagName("script")[0];
//     s.src = "https://cdn.iubenda.com/iubenda.js";
//     tag.parentNode.insertBefore(s, tag);
//   };
//   if (w.addEventListener) {
//     w.addEventListener("load", loader, false);
//   } else if (w.attachEvent) {
//     w.attachEvent("onload", loader);
//   } else {
//     w.onload = loader;
//   }
// })(window, document);

// // Consent:

// {
//   var _iub = _iub || {};
//   _iub.cons_instructions = _iub.cons_instructions || [];
//   _iub.cons_instructions.push([
//     "init",
//     { api_key: "4QckXpLzGBy8bkx8N48ZX4G82OQeoZQX" },
//   ]);
// }

// (function (consentSrc) {
//   var script6 = document.createElement("script");
//   script6.type = "text/javascript";
//   script6.src = consentSrc;
//   script6.async = "true";
//   // document.body.appendChild(script6);
//   tag = document.getElementsByTagName("script")[0];
//   tag.parentNode.insertBefore(script6, tag);
// })("https://cdn.iubenda.com/cons/iubenda_cons.js");
// {
//   /* <script type="text/javascript" src="https://cdn.iubenda.com/cons/iubenda_cons.js" async></script> */
// }

// function addGa4Tag() {
//   //  Google Tag Manager library
//   var scriptGA1 = document.createElement("script");
//   scriptGA1.async = true;
//   scriptGA1.src = "https://www.googletagmanager.com/gtag/js?id=G-T46H0SCFNP";
//   document.head.appendChild(scriptGA1);

//   // Google Tag Manager configuration
//   var scriptGA2 = document.createElement("script");
//   scriptGA2.type = "text/javascript";
//   scriptGA2.innerHTML = `
//     window.dataLayer = window.dataLayer || [];
//     function gtag(){dataLayer.push(arguments);}
//     gtag('js', new Date());
//     gtag('config', 'G-T46H0SCFNP');
//   `;
//   document.head.appendChild(scriptGA2);
// }

// addGa4Tag();
