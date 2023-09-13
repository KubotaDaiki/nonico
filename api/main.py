import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Video(BaseModel):
    url: str
    NOTION_TOKEN: str
    database_id: str


@app.post("/")
def post(video: Video):
    res = requests.get(video.url)
    soup = BeautifulSoup(res.text, "html.parser")
    title = soup.find("title").text
    thumbnail = soup.find("meta", attrs={"name": "thumbnail"})["content"]
    tag_elements = soup.find_all("meta", attrs={"property": "og:video:tag"})
    tags = [{"name": tag_element["content"]} for tag_element in tag_elements]

    url = "https://api.notion.com/v1/pages"

    headers = {
        "accept": "application/json",
        "Notion-Version": "2022-06-28",
        "Authorization": f"Bearer {video.NOTION_TOKEN}",
    }

    json_data = {
        "parent": {
            "type": "database_id",
            "database_id": video.database_id,
        },
        "properties": {
            "title": {"title": [{"text": {"content": title}}]},
            "URL": {"url": video.url},
            "Tags": {"multi_select": tags},
        },
        "cover": {"external": {"url": thumbnail}},
    }

    response = requests.post(url, json=json_data, headers=headers)
    return response.text
