chrome.runtime.onMessage.addListener(function (info, sender, sendResponse) {
  chrome.storage.local.get(
    ["notionToken", "databaseId"],
    async function (value) {
      // 登録しようとした動画がすでに登録済みかチェック
      const response = await checkRegistered(value, info);
      if (response.status != 200) {
        sendResponse({ message: "エラーが発生しました" });
        return;
      }
      const isRegistered = !((await response.json()).results.length === 0);
      if (isRegistered) {
        sendResponse({ message: "既に登録されています" });
        return;
      }

      // 動画をNotionに登録
      const response2 = await registerWithNotion(value, info);
      if (response2.status == 200) {
        sendResponse({ message: "登録しました" });
      } else {
        sendResponse({ message: "エラーが発生しました" });
      }
    }
  );
  return true;
});

async function registerWithNotion(value, info) {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "Notion-Version": "2022-06-28",
      Authorization: `Bearer ${value.notionToken}`,
    },
    body: JSON.stringify({
      parent: {
        type: "database_id",
        database_id: value.databaseId,
      },
      properties: {
        title: { title: [{ text: { content: info["title"] } }] },
        URL: { url: info["url"] },
        Tags: { multi_select: info["tags"] },
      },
      cover: { external: { url: info["thumbnail"] } },
    }),
  };

  return await fetch("https://api.notion.com/v1/pages", options).catch((err) =>
    console.error(err)
  );
}

async function checkRegistered(value, info) {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "Notion-Version": "2022-06-28",
      Authorization: `Bearer ${value.notionToken}`,
    },
    body: JSON.stringify({
      filter: {
        property: "URL",
        url: {
          equals: info["url"],
        },
      },
    }),
  };
  return await fetch(
    `https://api.notion.com/v1/databases/${value.databaseId}/query`,
    options
  ).catch((err) => console.error(err));
}