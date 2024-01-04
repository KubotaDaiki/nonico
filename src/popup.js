const notionToken = document.getElementById("notion-token");
const databaseId = document.getElementById("database-id");
const button = document.getElementById("form-btn");

chrome.storage.local.get(["notionToken", "databaseId"], function (value) {
  notionToken.value = value.notionToken == undefined ? "" : value.notionToken;
  databaseId.value = value.databaseId == undefined ? "" : value.databaseId;
});

button.addEventListener("click", () => {
  chrome.storage.local.set({ notionToken: notionToken.value });
  chrome.storage.local.set({ databaseId: databaseId.value });
  button.textContent = "保存しました";
});
