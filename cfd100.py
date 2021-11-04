# Author: Orochi-Adde
# Github: https://github.com/Orochi-Adde
# 定时 "59 59 * * * *" 不知道什么时候补货，自己设置
import requests
import time
import datetime
import json
import os
import threading

try:
    from ping3 import ping
except ImportError:
    print("正在导入ping3模块")
    os.system("pip install ping3")
    os.system("pip3 install ping3")
	    
		
# 请定时为59秒，程序会自动计算延迟时间
# 这里填cookie
cookie = "pt_pin=18740209378_p; pt_key=AAJhe6fsADAcU6BV5MMo_HY6DLhqyV04yqsZL-iXGneiLJxTPyXct_kqButvdjYwvwykMpmXj7M;"
# 这里输入发送时间间隔 单位：s(秒)
nterval_time = 0.7
# 服务器性能延迟设置（根据服务器性能，执行程序需要一点时间）,单位 s (秒)
time2 = 0.001
# 这里是发送次数
num = 3
# 线程数，默认1线程
thread_num = 1


headers = {"Sec-Fetch-Mode": "no-cors",
           "User-Agent": "jdpingou;android;5.8.0;11;dkieknv290ke;network/wifi;model/Mi KW Pro Zoom Edition;appBuild/19002;partner/xiaomi;;session/49;Mozilla/5.0 (Linux; Android 11; Mi Kw; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.166 Mobile Safari/537.36",
           "Accept": "*/*", "X-Requested-With": "com.jd.pingou", "Sec-Fetch-Site": "same-site",
           "Referer": "https://st.jingxi.com/fortune_island/index2.html?ptag=7155.9.47&sceneval=2",
           "Accept-Encoding": "gzip, deflate", "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
           "Connection": "close",
           "Cookie": cookie}


def ping_time():
    ip_address = "m.jingxi.com"
    ping_time = ping(ip_address)
    print("当前与京东服务器延时：%.4f秒" % ping_time)
    time1 = 1 - ping_time
    print("发送时间为：%.4f秒" % (59 + time1))
    time2 = time1 - ping_time
    return time2


def get_url():
    url = "https://m.jingxi.com/jxbfd/user/ExchangePrize?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t" \
          "={}8&ptag=7155.9.47&dwType=3&dwLvl=2&ddwPaperMoney=111000&strPoolName=jxcfd2_exchange_hb_202111" \
          "&strPgtimestamp={}&strPhoneID=237a61a8fba636db&strPgUUNum=5fbb12db2e9cb4ecdd83b8ee0ea85e1b&_stk" \
          "=_cfd_t%2CbizCode%2CddwPaperMoney%2CdwEnv%2CdwLvl%2CdwType%2Cptag%2Csource%2CstrPgUUNum%2CstrPgtimestamp" \
          "%2CstrPhoneID%2CstrPoolName%2CstrZone&_ste=1&h5st=20211104100009798%3B8890088326893162%3B10032" \
          "%3Btk01w8dd91b8d30n8fQQV1cejXxP%2FVUMeQChC%2FYXDUESSza51j7w1cLxzBSWgtgKCJsfJEAdu%2F3iyA5fPzdVIRHX91lT" \
          "%3B25910d6b0612a826ad2eb4f88b56266906551f8d99d2aa24d2afcd54fa29f2a7&_=1635991209799&sceneval=2" \
          "&g_login_type=1&callback=jsonpCBKUUU&g_ty=ls".format(int(time.time() * 1000) - 2, int(time.time() * 1000))
    return url


def get_msg(response):
    response_str = response.content.decode()
    str = response_str.replace("jsonpCBKUUU(", "").replace(")", "")
    msg = json.loads(str)['sErrMsg']
    print(datetime.datetime.now(), msg)


def run(num=num):
    while num:
        response = requests.get(get_url(), headers=headers)
        try:
            get_msg(response)
        except:
            print("未知错误")
        num -= 1
        time.sleep(nterval_time)


time.sleep(ping_time()-time2)

thread_list = []
for i in range(thread_num):
    thread_cfd = threading.Thread(target=run)
    thread_list.append(thread_cfd)
for t in thread_list:
    t.setDaemon(True)  # 把子线程设置为守护线程，该线程不重要，主线程结束，子线程结束
    t.start()
for thread in thread_list:
    thread.join()
