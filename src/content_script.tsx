import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

// ページ情報を取得
const pageInfo = {
  title: document.querySelector<HTMLElement>("title")?.textContent,
  url: excludeQueryParameter(location.href),
  thumbnail: getThumbnail(),
  tags: getTags(),
};

window.addEventListener("load", () => {
  // 邪魔なtwitterアイコンを除去
  const twitterButton = document.querySelector<HTMLElement>(
    ".TwitterShareButton"
  );
  if (twitterButton) {
    twitterButton.style.display = "none";
  }

  const button = document.createElement("div");
  button.style.display = "inline-block";
  document.querySelector(".VideoMenuContainer-areaRight")?.prepend(button);

  const root = createRoot(button);
  root.render(<NotionButton />);
});

function NotionButton() {
  const [open, setOpen] = useState(false);
  const [toolTipText, setToolTipText] = useState("");
  const svgPath = chrome.runtime.getURL("notion.svg");

  const onBeforeunloadHandler = function (e: any) {
    e.returnValue = "行った変更が保存されない可能性があります。";
  };

  function sendPageInfoToBackground() {
    window.addEventListener("beforeunload", onBeforeunloadHandler);
    chrome.runtime.sendMessage(
      { type: "register", data: pageInfo },
      function (response) {
        window.removeEventListener("beforeunload", onBeforeunloadHandler);
        setToolTipText(response.message);
        setOpen(true);
        setTimeout(() => {
          setOpen(false);
        }, 2000);
      }
    );
  }

  return (
    <div>
      <Tooltip
        placement="top"
        open={open}
        disableHoverListener
        title={<Typography sx={{ fontWeight: 600 }}>{toolTipText}</Typography>}
        arrow
      >
        <Button
          variant="text"
          sx={{
            backgroundColor: "transparent",
            borderColor: "transparent",
            minWidth: "40px",
            minHeight: "40px",
            "&:hover": {
              background: "#eee",
              borderRadius: "2px",
            },
          }}
          disableRipple={true}
          onClick={sendPageInfoToBackground}
        >
          <img src={svgPath} style={{ width: "25px", height: "25px" }}></img>
        </Button>
      </Tooltip>
    </div>
  );
}

function getTags() {
  let tagElements = document.querySelectorAll(".TagItem-name");
  let tags = [];
  for (const tagElement of tagElements) {
    tags.push({ name: tagElement.textContent });
  }
  return tags;
}

function getThumbnail() {
  return document
    .querySelector<HTMLElement>(".VideoContainer-prePlayThumbnail")
    ?.style.backgroundImage.replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "");
}

/**
 * クエリパラメータを除外する（マイリスト情報などを除外する）
 * @param {string} url 除外前のURL
 * @returns 除外後のURL
 */
function excludeQueryParameter(url: any) {
  return url.replace(/\?.*$/, "");
}
