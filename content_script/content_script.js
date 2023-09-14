window.onload = function () {
  let parentnode = document.querySelectorAll(".VideoMenuContainer-areaRight");

  // ボタン用CSSの挿入
  let stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = chrome.runtime.getURL("content_script/style.css");
  stylesheet.type = "text/css";
  document.head.appendChild(stylesheet);

  // 邪魔なtwitterアイコンを除去
  twitter = document.querySelectorAll(".TwitterShareButton")[0];
  twitter.style.display = "none";

  // notion登録用のボタンを作成
  let button = document.createElement("button");
  button.classList.add("send-button");
  button.onclick = sendPageInformationToBackground; // ボタンを押した時にbackgroundへ情報を送る
  parentnode[0].prepend(button);

  // svg要素を作成
  let svgElement = createSvgElement();
  button.appendChild(svgElement);

  // ボタンをクリックした際の吹き出しを作成
  let toolTip = document.createElement("p");
  toolTip.classList.add("toolTip");
  toolTip.style.opacity = 0;
  toolTip.textContent = "登録しました";
  parentnode[0].prepend(toolTip);
};

// svg要素を作成する関数
function createSvgElement() {
  let svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("width", "100");
  svgElement.setAttribute("height", "100");
  svgElement.setAttribute("viewBox", "0 0 100 100");
  svgElement.setAttribute("fill", "none");
  svgElement.classList.add("notion-img");

  let path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute(
    "d",
    "M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8"
  );
  path1.setAttribute("fill", "#fff");

  let path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("fill-rule", "evenodd");
  path2.setAttribute("clip-rule", "evenodd");
  path2.setAttribute(
    "d",
    "M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78"
  );
  path2.setAttribute("fill", "#000");
  path2.classList.add("path2");

  svgElement.appendChild(path1);
  svgElement.appendChild(path2);
  return svgElement;
}

// ページ情報を取得する関数
function PageInfo() {
  let info = {};
  info["title"] = document.querySelector("title").textContent;
  info["url"] = location.href;
  info["thumbnail"] = document
    .querySelectorAll(".VideoContainer-prePlayThumbnail")[0]
    .style.backgroundImage.replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "");
  let tagElements = document.querySelectorAll(".TagItem-name");
  let tags = [];
  for (const tagElement of tagElements) {
    tags.push({ name: tagElement.textContent });
  }
  info["tags"] = tags;
  return info;
}

// ページ情報をbackgroundへ送る関数
function sendPageInformationToBackground() {
  let toolTip = document.querySelectorAll(".toolTip")[0];
  chrome.runtime.sendMessage(PageInfo(), function (response) {
    toolTip.textContent = response.message;
    toolTip.style.opacity = 1;
  });
  setTimeout(function () {
    toolTip.style.opacity = 0;
  }, 2000);
}
