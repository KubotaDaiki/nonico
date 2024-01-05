import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

function Form() {
  const [token, setToken] = React.useState("");
  const [databaseId, setDatabaseId] = React.useState("");

  useEffect(() => {
    chrome.storage.local.get(["notionToken", "databaseId"], function (value) {
      setToken(value.notionToken == undefined ? "" : value.notionToken);
      setDatabaseId(value.databaseId == undefined ? "" : value.databaseId);
    });
  }, []);

  return (
    <Stack width={400} spacing={2}>
      <TextField
        label="Notionトークン"
        variant="standard"
        value={token}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setToken(event.target.value);
        }}
      />
      <TextField
        label="データベースID"
        variant="standard"
        value={databaseId}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setDatabaseId(event.target.value);
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          console.log(databaseId);
          console.log(token);
        }}
      >
        保存する
      </Button>
    </Stack>
  );
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<Form />);
