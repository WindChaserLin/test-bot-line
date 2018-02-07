const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect("mongodb://clientuser:clientpassword@ds217898.mlab.com:17898/jasondb1", 
  async function(err, client) {
    if (err) {
      console.log("DB Error");
      return console.dir(err); 
    }
    db=client.db("jasondb1");
});

async function setUserIntent(userId, text){
    let tblQuestion = db.collection("userQuestion");
    text=text.toLowerCase();
    let intent="";
    let expectedQnA={"hi":"Hi","你好":"你好","hello":"Hello","晚餐想吃什麼":"晚餐想吃什麼",
        "你叫什麼名字":"林耀東","你的信箱":"straykid.x@gmail.com"};
    let answer=expectedQnA[text];
    if (answer==undefined){  
        if ((text.indexOf("課程") !== -1)||(text.indexOf("願望") !== -1)) {
            intent='class';
        } else { 
            intent='unknown';answer=text;
        }
    } else { 
        intent='homework';
    };
    let aryIntent = await tblQuestion.find({userId,intent}).toArray();
    let aryQuestion = await tblQuestion.find({userId,intent,"question":`${text}`}).toArray();
    let msgGroup=[];
    if (intent=='class'){
        let strWish=await listWish(userId); 
        msgGroup.push({type: "text", text: `你的願望清單內的課程有${strWish}`});
        if(aryIntent.length==1) {msgGroup.push({type: "text", text: `這個問題你已經問第${aryIntent.length+1}次了...`});}
        if(aryIntent.length==2) {msgGroup.push({type: "text", text: `老哥，你已經問第${aryIntent.length+1}次了...`});}
        if(aryIntent.length==3) {msgGroup.push({type: "text", text: `這是第${aryIntent.length+1}次了，你要問幾遍啊？...`});}
        if(aryIntent.length>=4) {msgGroup.push({type: "text", text: `第${aryIntent.length+1}次，我想起一部電影叫做 '明日世界'...你知道的...`});}
    }
    if (intent=='unknown'){
        if (text.indexOf("名字") !== -1){msgGroup.push({type: "text", text: "你是在問我的名字嗎？請打 '你叫什麼名字'。"});}
        else if (text.indexOf("信箱") !== -1){msgGroup.push({type: "text", text: "你是在問我的信箱嗎？請打 '你的信箱'。"});}
        else if (text.indexOf("晚餐") !== -1){msgGroup.push({type: "text", text: "你是要問晚餐想吃什麼嗎？請打 '晚餐想吃什麼'。"});}
        else if (text.indexOf("吃") !== -1){msgGroup.push({type: "text", text: "你是要問晚餐想吃什麼嗎？請打 '晚餐想吃什麼'。"});}
        else if (text.indexOf("好") !== -1){msgGroup.push({type: "text", text: "好啊！"});}
        else if (text.indexOf("想") !== -1){msgGroup.push({type: "text", text: "想不出來..."});}
        else { msgGroup.push({type: "text", text: "說什麼啦，聽不太懂耶..."});
            msgGroup.push({type: "text", text: "你可以問我 'Hi', '你好', 'Hello', '晚餐想吃什麼', '你叫什麼名字', '你的信箱', '課程' "});}
    }
    if (intent=='homework'){
        msgGroup.push({type: "text", text: answer});
        if(text=="你叫什麼名字") {msgGroup.push({type: "text", text: "上課都坐在左邊靠牆壁，穿黃色外套，問題很多的那個傢伙就是我啦。"});};
        if(text=="你的信箱") {msgGroup.push({type: "text", text: "拜託我的個人資訊請保密。"});};
        if((text=="晚餐想吃什麼")&&(aryQuestion.length==0)) {msgGroup.push({type: "text", text: "我也還沒決定耶..."});};
        if((text=="晚餐想吃什麼")&&(aryQuestion.length==1)) {msgGroup.push({type: "text", text: "想一起去吃嗎？"});};
        if((text=="晚餐想吃什麼")&&(aryQuestion.length==2)) {msgGroup.push({type: "text", text: "嗯，我想想..."});};
        if((text=="晚餐想吃什麼")&&(aryQuestion.length>=3)) {msgGroup.push({type: "text", text: "好冷喔！不知道要吃什麼..."});};
        if(aryIntent.length==2) {msgGroup.push({type: "text", text: "你問的好像都是老師作業中規定的問題耶。該不會...你就是老師本人吧... 😱"});}
        if(aryIntent.length==3) {msgGroup.push({type: "text", text: `越來越肯定你就是老師了,你已經問了${aryIntent.length+1}次作業規定的問題了... 🤔`});}
        if(aryIntent.length==4) {msgGroup.push({type: "text", text: `這是第${aryIntent.length+1}次了，你應該就是老師...吧...`});}
        if(aryIntent.length>=5) {msgGroup.push({type: "text", text: `😊 老師您好。第${aryIntent.length+1}次了，記得我的作業要給滿分喔！... 💯`});}
    }
    tblQuestion.insert({ userId, intent ,"question": text });
    return msgGroup;
}

async function setUserProfile(userId, strProfile) {
    let tblProfile = db.collection("userProfile");
    let aryUserId = await tblProfile.find({userId}).toArray();
    tblProfile.insert({ userId, strProfile });
    return aryUserId.length;
}

async function listWish(userId) {
    let wishlist = db.collection("wishlist");
    let results = await wishlist.find({userId}).toArray() ; 
    return results.map(result => result.item);
}
module.exports = {
    setUserProfile,
    listWish,
    setUserIntent
};
