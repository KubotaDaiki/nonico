// 動的に生成されるHTML要素に関係する処理
window.onload = function () {
  // 邪魔なtwitterアイコンを除去
  document.querySelector(".TwitterShareButton").style.display = "none";

  // ボタンを設置するためのHTML要素を取得
  let parentnode = document.querySelector(".VideoMenuContainer-areaRight");

  // Notion登録用のボタンを作成
  let button = document.createElement("button");
  button.classList.add("send-button");
  button.onclick = sendPageInfoToBackground; // ボタンを押した時にbackgroundへ情報を送る
  parentnode.prepend(button);

  // svg要素を作成
  let svgPath = chrome.runtime.getURL("content_script/notion.svg");
  let svgElement = `<img src="${svgPath}" class="notion-img">`;
  button.insertAdjacentHTML("beforeend", svgElement);

  // ボタンをクリックした際の吹き出しを作成
  let toolTip = '<p class="toolTip" style="opacity: 0;">登録しました</p>';
  parentnode.insertAdjacentHTML("afterbegin", toolTip);
};

// ボタン用CSSの挿入
let stylesheetPath = chrome.runtime.getURL("content_script/style.css");
let stylesheetElement = `<link rel="stylesheet" href="${stylesheetPath}" type="text/css">`;
document.head.insertAdjacentHTML("beforeend", stylesheetElement);

// タグの取得
let tagElements = document.querySelectorAll(".TagItem-name");
let tags = [];
for (const tagElement of tagElements) {
  tags.push({ name: tagElement.textContent });
}

// サムネイルの取得
let thumbnail = document
  .querySelector(".VideoContainer-prePlayThumbnail")
  .style.backgroundImage.replace(/^url\(["']?/, "")
  .replace(/["']?\)$/, "");

// ページ情報を辞書に集約
const pageInfo = {
  title: document.querySelector("title").textContent,
  url: location.href,
  thumbnail: thumbnail,
  tags: tags,
};

// ページ情報をbackgroundへ送る関数
function sendPageInfoToBackground() {
  let toolTip = document.querySelector(".toolTip");
  chrome.runtime.sendMessage(pageInfo, function (response) {
    // レスポンス内容を表示する吹き出しを表示（フェードイン・フェードアウト）
    toolTip.textContent = response.message;
    toolTip.style.opacity = 1;
    setTimeout(function () {
      toolTip.style.opacity = 0;
    }, 2000);
  });
}
