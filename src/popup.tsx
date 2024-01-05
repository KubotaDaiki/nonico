import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Buffer } from "buffer";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

function Popup() {
  const [workspace_name, setWorkspace_name] = React.useState("");

  useEffect(() => {
    chrome.storage.local.get(["workspace_name"], function (value) {
      setWorkspace_name(
        value.workspace_name == undefined ? "ありません" : value.workspace_name
      );
    });
  }, []);

  return (
    <Stack width={400} spacing={2}>
      <Typography sx={{ fontWeight: 600 }}>設定</Typography>
      <Typography>連携中のユーザ：{workspace_name}</Typography>
      <DatabaseSelect></DatabaseSelect>
      <Button variant="contained" onClick={createAuthPopup} sx={{ width: 200 }}>
        Notionと連携する
      </Button>
    </Stack>
  );
}

function DatabaseSelect() {
  const [databaseList, setDatabaseList] = useState<any>([]);
  const [targetDatabase, setTargetDatabase] = useState("");

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "search", data: "" },
      function (response) {
        setDatabaseList(response.databaseList);

        chrome.storage.local.get(["database_id"], function (value) {
          setTargetDatabase(
            value.database_id == undefined ? "" : value.database_id
          );
        });
      }
    );
  }, []);

  return (
    <FormControl fullWidth>
      <InputLabel id="demo-select-small-label">保存するデータベース</InputLabel>
      <Select
        value={targetDatabase}
        onChange={(event: SelectChangeEvent) => {
          setTargetDatabase(event.target.value);
          chrome.storage.local.set({ database_id: event.target.value });
        }}
        label="保存するデータベース"
        size="small"
        id="demo-select-small"
        labelId="demo-select-small-label"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {databaseList.map((value: any) => {
          return (
            <MenuItem key={value.id} value={value.id}>
              {value.title[0].text.content}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

function createAuthPopup() {
  const authPopupParams: AuthPopupParams = {
    type: "popup",
    url: "https://api.notion.com/v1/oauth/authorize?client_id=a95384cd-fa84-4298-a4b3-84142d645e4f&response_type=code&owner=user&redirect_uri=https%3A%2F%2Foauth.pstmn.io%2Fv1%2Fbrowser-callback",
  };
  interface AuthPopupParams {
    type: chrome.windows.createTypeEnum;
    url: string;
  }

  chrome.windows.create(authPopupParams, executeAuthFlow);
}
console.log(process.env.REACT_APP_clientId)
function executeAuthFlow(window: any) {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const isTransition =
      window.tabs[0].id == tabId &&
      "url" in changeInfo &&
      changeInfo.url?.indexOf(process.env.redirectUri!) ===
        0;
    if (isTransition) {
      const params = new URL(changeInfo.url!).searchParams;
      const code = params.get("code");
      if (code !== null) {
        const userData = await getUserData(code);
        chrome.storage.local.set({ workspace_name: userData.workspace_name });
        chrome.storage.local.set({ access_token: userData.access_token });
      }
    }
  });
}

async function getUserData(code: any) {
  const encoded = Buffer.from(`${process.env.clientId}:${process.env.clientSecret}`).toString("base64");

  const response = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${encoded}`,
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.redirectUri,
    }),
  });
  const data = await response.json();
  return data;
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<Popup />);
