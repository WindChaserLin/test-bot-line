let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
const Client = require('@line/bot-sdk').Client;
const { setUserProfile, listWish, setUserIntent } = require('./clientDb');
const CHANNEL_ACCESS_TOKEN = 'qWn+hotfBQeC+f43LYTe+HoqauVu3ZeTPrHfwLNGlefcL8SEtUfYEKfCyIgXMdwfdUKpMI8oCv2SPtR6M2FUhjmZpqEp6SpuExE2QYSgcbXAbeMVXxOJu5nRe9mlCC2j/0lLvtcG6E7oqjlFzsf4OQdB04t89/1O/w1cDnyilFU='
const PORT = process.env.PORT || 3000
const app = express()
const client = new Client({ channelAccessToken: CHANNEL_ACCESS_TOKEN, channelSecret: '8b818f0a7161da47fb3ad948730ed070' });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
});
// handler receiving messages
app.post("/", function (req, res) {
  console.log(JSON.stringify(req.body, null, 2));
  let events = req.body.events || [];
  events.forEach(async event => {
    let { replyToken, type, message, source: { userId } } = event;
    if (type === "message" && message.type === "text") {
      let text = message.text;
      let msgGroup = await setUserIntent(userId, text);
      client.replyMessage(replyToken, msgGroup);
    }
    if (message != undefined) {
      if (type === "message" && (message.type === "sticker") || (message.type === "image")) {
        let msgStickerImage = { sticker: "貼圖", image: "圖片" }
        let msgGroup = [];
        msgGroup.push({ type: "text", text: `真抱歉，我還看不懂${msgStickerImage[message.type]}。` });
        msgGroup.push({ type: "text", text: "老師沒有教...我只好以後自行摸索了QQ..." });
        client.replyMessage(replyToken, msgGroup);
      }
    }
    if (type === "follow") {
      let strProfile = await client.getProfile(userId);
      let strName = strProfile.displayName;
      let countFollow = await setUserProfile(userId, strProfile);
      let dataFollow = [];
      dataFollow.push({ text: { type: "text", text: `${strName} 你好，歡迎第${countFollow + 1}次加入的新朋友，很高興來跟我聊天...` }, sticker: { type: "sticker", packageId: "1", stickerId: "2" } });
      dataFollow.push({ text: { type: "text", text: `${strName}，加朋友後就不要離開了喔！ 歡迎第${countFollow + 1}次加入...` }, sticker: { type: "sticker", packageId: "1", stickerId: "119" } });
      dataFollow.push({ text: { type: "text", text: `你不會是按錯了吧，${strName}，不要離開了喔！ 歡迎第${countFollow + 1}次加入...` }, sticker: { type: "sticker", packageId: "4", stickerId: "263" } });
      dataFollow.push({ text: { type: "text", text: `拜託拜託，${strName}，你是第${countFollow + 1}次加入了。你不會是想封鎖我吧QQ...` }, sticker: { type: "sticker", packageId: "2", stickerId: "525" } });
      dataFollow.push({ text: { type: "text", text: `不會吧 ${strName}，你是第${countFollow + 1}次加入了。你這樣我打擊很大耶QQ...` }, sticker: { type: "sticker", packageId: "2", stickerId: "168" } });
      dataFollow.push({ text: { type: "text", text: `${strName}，你已經是第${countFollow + 1}次加入了。我相信的的大腦真的異於常人啊！` }, sticker: { type: "sticker", packageId: "1", stickerId: "135" } });
      dataFollow.push({ text: { type: "text", text: `${strName} 第${countFollow + 1}次加入了。耳邊又傳來陣陣封鎖的聲音，我只聽到自己無言的嘆息！` }, sticker: { type: "sticker", packageId: "3", stickerId: "201" } });
      if ((countFollow + 1) > dataFollow.length) { countFollow = dataFollow.length - 1; }
      let msgGroup = [];
      msgGroup.push(dataFollow[countFollow].text);
      msgGroup.push(dataFollow[countFollow].sticker);
      client.replyMessage(replyToken, msgGroup);
    }
  });
  res.send();
});
