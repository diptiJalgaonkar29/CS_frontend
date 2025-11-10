// const CONFIG = JSON.parse(localStorage.getItem("config"));
// console.log("IUBENDA_COOKIE_POLICY_ID******", CONFIG?.IUBENDA_COOKIE_POLICY_ID);
// console.log("IUBENDA_SITE_ID******", CONFIG?.IUBENDA_SITE_ID);

// // P&C solution:
// {
//   var _iub = _iub || [];
//   _iub.csConfiguration = {
//     lang: "en",
//     siteId: CONFIG?.IUBENDA_SITE_ID,
//     cookiePolicyId: CONFIG?.IUBENDA_COOKIE_POLICY_ID,
//     whitelabel: false,
//     banner: {
//       acceptButtonDisplay: true,
//       customizeButtonDisplay: true,
//       position: "float-top-center",
//       acceptButtonColor: "#0073CE",
//       acceptButtonCaptionColor: "var(--color-white)",
//       customizeButtonColor: "#DADADA",
//       customizeButtonCaptionColor: "#4D4D4D",
//       textColor: "black",
//       backgroundColor: "var(--color-white)",
//     },
//   };
// }

// (function (iubendaScriptSrc) {
//   var script4 = document.createElement("script");
//   script4.type = "text/javascript";
//   script4.src = iubendaScriptSrc;
//   script4.charset = "UTF-8";
//   script4.async = "true";
//   document.body.appendChild(script4);
// })("//cdn.iubenda.com/cs/iubenda_cs.js");

// {
//   /* <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script> */
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
//     { api_key: "Pzxr4Frxyl9HZ1jgmtLqjJAsUPryaLeN" },
//   ]);
// }
// (function (consentSrc) {
//   var script6 = document.createElement("script");
//   script6.type = "text/javascript";
//   script6.src = consentSrc;
//   script6.async = "true";
//   document.body.appendChild(script6);
// })("https://cdn.iubenda.com/cons/iubenda_cons.js");
// {
//   /* <script type="text/javascript" src="https://cdn.iubenda.com/cons/iubenda_cons.js" async></script> */
// }

// function addGa4Tag() {
//   //  Google Tag Manager library
//   var scriptGA1 = document.createElement("script");
//   scriptGA1.async = true;
//   scriptGA1.src = "https://www.googletagmanager.com/gtag/js?id=G-5D6CLV7S5D";
//   document.head.appendChild(scriptGA1);

//   // Google Tag Manager configuration
//   var scriptGA2 = document.createElement("script");
//   scriptGA2.type = "text/javascript";
//   scriptGA2.innerHTML = `
//       window.dataLayer = window.dataLayer || [];
//       function gtag(){dataLayer.push(arguments);}
//       gtag('js', new Date());
//       gtag('config', 'G-5D6CLV7S5D');
//     `;
//   document.head.appendChild(scriptGA2);
// }

// addGa4Tag();

// function addGa4TagTest() {
//   //  Google Tag Manager library
//   var scriptGA3 = document.createElement("script");
//   scriptGA3.async = true;
//   scriptGA3.src = "https://www.googletagmanager.com/gtag/js?id=G-D8V213LC4D";
//   document.head.appendChild(scriptGA3);

//   // Google Tag Manager configuration
//   var scriptGA4 = document.createElement("script");
//   scriptGA4.type = "text/javascript";
//   scriptGA4.innerHTML = `
//       window.dataLayer = window.dataLayer || [];
//       function gtag(){dataLayer.push(arguments);}
//       gtag('js', new Date());
//       gtag('config', 'G-D8V213LC4D');
//     `;
//   document.head.appendChild(scriptGA4);
// }

// addGa4TagTest();
