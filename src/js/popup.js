import SEOAssistant from "./seo-assistant/seo-assistant";
import defaultElements from "./default-elements";
import "../img/icon-34.png";
import "../img/icon-128.png";
import StringToDOM from "./string-to-dom";
import PageHeader from "./templates/page-model";

let main;

chrome.runtime.onMessage.addListener(function(request) {
   if(request.action === "getPageSource"){
        let assistant = new SEOAssistant(StringToDOM(request.source.dom), defaultElements);
        let pageHeader = new PageHeader(request.source, assistant, main);
        main.appendChild(pageHeader.header);
        pageHeader.body.setAttribute("data-selector", "body");
        main.appendChild(pageHeader.body);
        pageHeader.updateTab("overview");
   }
});

function onLoadWindow(){
    main = document.querySelector("[data-selector='main']");

    chrome.tabs.executeScript(null, {
        file: "./get-page-source.bundle.js"
    }, function(){
        if (chrome.runtime.lastError) {
            // title.innerText = "Ocorreu um erro ao injetar script";
            // subtitle.innerText = chrome.runtime.lastError.message;
            main.innerHTML = "";
        }
    });
}

window.onload = onLoadWindow;