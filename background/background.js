chrome.runtime.onMessage.addListener(function (info, sendResponse) {
  chrome.storage.local.get(["notionToken", "databaseId"], function (value) {
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

    fetch("https://api.notion.com/v1/pages", options)
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
  });
  return true;
});
