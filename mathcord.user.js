// ==UserScript==
// @name         Mathcord
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Typeset equations in Discord messages.
// @author       Till Hoffmann
// @match        https://discordapp.com/*
// @resource     katexCSS https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css
// @require      https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js
// @require      https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';
    // Declare rendering options (see https://katex.org/docs/autorender.html#api for details)
    const options = {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true},
            {left: "$", right: "$", display: false},
        ],
    };

    // We need to download the CSS, modify any relative urls to be absolute, and inject the CSS
    var katexCSS = GM_getResourceText("katexCSS");
    var pattern = /url\((.*?)\)/gi;
    katexCSS = katexCSS.replace(pattern, 'url(https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/$1)');
    GM_addStyle(katexCSS);

    // Monitor the document for changes and render math as necessary
    var config = { childList: true, subtree: true };
    var observer = new MutationObserver(function(mutations, observer) {
        for (let mutation of mutations) {
            // Check whether we are dealing with an element in the scroller
            var target = mutation.target;
            var classes = (target.getAttribute("class") || "").split();
            if (target.tagName != "DIV" || !classes.some(x => x.startsWith("scroller"))) {
                continue;
            }

            // Iterate over all elements and render them if they are messages
            for (let added of mutation.addedNodes) {
                classes = (added.getAttribute("class") || "").split();
                if (added.tagName == "DIV" && classes.some(x => x.startsWith("message"))) {
                    renderMathInElement(added, options);
                }
            }
        }
    });
    observer.observe(document.body, config);
})();
