chrome.runtime.onMessage.addListener(function (info, sender, sendResponse) {
  chrome.storage.local.get(
    ["notionToken", "databaseId"],
    async function (value) {
      const isNotRegistered = await checkRegistered(value, info);

      if (isNotRegistered) {
        registerWithNotion(value, info);
      }
      sendResponse({
        message: isNotRegistered ? "登録しました" : "既に登録されています",
      });
    }
  );
  return true;
});

function registerWithNotion(value, info) {
  const options2 = {
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

  fetch("https://api.notion.com/v1/pages", options2)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
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
  const isNotRegistered = await fetch(
    `https://api.notion.com/v1/databases/${value.databaseId}/query`,
    options
  )
    .then((response) => response.json())
    .then((response) => response.results.length === 0)
    .catch((err) => console.error(err));
  return isNotRegistered;
}
