/*
特物Z|万物皆可国创@wenmoux
没加判断 凑合用吧 或者等大佬发脚本
不知道谁的口令
2.0复制整段话 https://JoQYw1jIiA8FsS国创IP好礼随心抽#29vBY8N3ja@qu达開↖綡東↗
抄自 @yangtingxiao 抽奖机脚本
活动入口：
更新地址：https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_superBrand.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#特物Z|万物皆可国创
30 11 * * * https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_superBrand.js, tag=特物Z|万物皆可国创, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
================Loon==============
[Script]
cron "30 11 * * *" script-path=https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_superBrand.js tag=特物Z|万物皆可国创
===============Surge=================
特物Z|万物皆可国创 = type=cron,cronexp="30 11 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_superBrand.js
============小火箭=========
特物Z|万物皆可国创 = type=cron,script-path=https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_superBrand.js, cronexpr="30 11 * * *", timeout=3600, enable=true
 */
const $ = new Env('特物Z|万物皆可国创');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

const randomCount = $.isNode() ? 20 : 5;
const notify = $.isNode() ? require('./sendNotify') : '';
let merge = {}
let codeList = []
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = `https://api.m.jd.com/client.action`;

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            "open-url": "https://bean.m.jd.com/"
        });
        return;
    }

    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            $.beans = 0
            message = ''
            $.cando = true
            //   await shareCodesFormat();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                    "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                });

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
        let actdata=   await getid("superBrandSecondFloorMainPage","secondfloor")       
        if($.cando){
        $.actid = actdata.actid
        $.enpid = actdata.enpid
      //{actid,actname,enpid}
         //     await doTask("44spR7W6XFhQXzMvPva99WYLTscr", "1000000157", "3") //关注
         //   await superBrandTaskLottery()
            await getCode()
            
            await doTask("secondfloor",$.enpid,$.taskList[0].encryptAssignmentId,$.taskList[0].ext.followShop[0].itemId,$.taskList[0].assignmentType)            
            await doTask("secondfloor",$.enpid,$.taskList[2].encryptAssignmentId,$.taskList[2].ext.brandMemberList[0].itemId,$.taskList[2].assignmentType)            
            let signdata=   await getid("showSecondFloorSignInfo","sign")
            await doTask("sign",signdata.enpid,signdata.eid,1,5)
            console.log("开始抽奖")
                await superBrandTaskLottery()
                await superBrandTaskLottery()
                await superBrandTaskLottery()   
}
        }
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
           $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
        //    $.beans = 0
     //       message = ''

            //   await shareCodesFormat();
            console.log(`\n******开始【京东账号${$.index}】\n`);
     
       for (l = 0; l < codeList.length; l++) {
       console.log(`为 ${codeList[l]}助力中`)
                await doTask("secondfloor",$.enpid,$.inviteenaid, codeList[l], 2)
            }
        }
    }
for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
           $.UserName = decodeURIComponent(cookie.match(/pt
