# !/usr/bin/python3
# -- coding: utf-8 --
# -------------------------------
# @Author : cherwin
'''
顺丰速运 v1
包含积分任务和采蜜游戏
采蜜游戏入口: 我的-积分抽奖-拉到最下面收件兑奖
积分可以换快递优惠券,爱奇艺周卡,肯德基代金券和各种实物
采蜜的蜂蜜可以换快递券和实物
抓包方式：
打开小程序或APP-我的-积分, 捉以下几种url之一,把整个url放到变量 SFURL 里,多账号#分割
https://mcs-mimp-web.sf-express.com/mcs-mimp/share/weChat/shareGiftReceiveRedirect
https://mcs-mimp-web.sf-express.com/mcs-mimp/share/app/shareRedirect
每天跑至少两次就行
'''
# cron "5 5,17 * * *" script-path=xxx.py,tag=匹配cron用
# const $ = new Env('顺丰速运')

import json
import os
import time
from os import environ, path
from sys import exit
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
# 禁用安全请求警告
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

def load_send():
    global send, mg
    cur_path = path.abspath(path.dirname(__file__))
    if path.exists(cur_path + "/notify.py"):
        try:
            from notify import send
            print("加载通知服务成功！")
        except:
            send = False
            print("加载通知服务失败~")
    else:
        send = False
        print("加载通知服务失败~")

load_send()
send_msg = ''
inviteId='8C3950A023D942FD93BE9218F5BFB34B'
def Log(cont):
    global send_msg
    print(cont)
    send_msg += f'{cont}\n'

class SFSY:
    def __init__(self):
        self.headers = {
            'Host': 'mcs-mimp-web.sf-express.com',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63090551) XWEB/6945 Flue',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'none',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            'accept-language': 'zh-CN,zh',
            'platform': 'MINI_PROGRAM',

        }
    def login(self,sfurl):
        ress = s.get(sfurl, headers=self.headers)
        # print(ress.text)
        self.user_id = s.cookies.get_dict().get('_login_user_id_', '')
        self.phone = s.cookies.get_dict().get('_login_mobile_', '')
        mobile = self.phone[:3] + "*" * 4 + self.phone[7:]
        if self.phone != '':
            Log(f'用户:【{mobile}】登陆成功')
            return True
        else:
            Log(f'获取用户信息失败')
            return False

    def do_request(self, url, data = {}, req_type = 'post'):
        try:
            if req_type.lower() == 'get':
                response = s.get(url, headers=self.headers)
            elif req_type.lower() == 'post':
                response = s.post(url, headers=self.headers, json=data)
            else:
                raise ValueError('Invalid req_type: %s' % req_type)
            res = response.json()
            return res
        except requests.exceptions.RequestException as e:
            print('Request failed:', e)
            return None
        except json.JSONDecodeError as e:
            print('JSON decoding failed:', e)
            return None

    def sign(self):
        Log(f'>>>>>>开始执行签到')
        json_data = {"comeFrom":"vioin","channelFrom":"WEIXIN"}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskSignPlusService~automaticSignFetchPackage'
        response = self.do_request(url, data=json_data)
        print(response)
        if response.get('success') == True:
            count_day = response["obj"]["countDay"]
            if response.get('obj').get('integralTaskSignPackageVOList','') != '':
                packet_name = response["obj"]["integralTaskSignPackageVOList"][0]["packetName"]
                Log(f'>>>签到成功，获得【{packet_name}】，本周累计签到【{count_day}】天')
            else:
                Log(f'今日已签到，累计签到【{count_day}】天')
        else:
            print(f'签到失败！原因：{response.get("errorMessage")}')

    def get_SignTaskList(self):
        Log(f'>>>开始获取签到任务列表')
        json_data = {
            'channelType': '3',
            'deviceId': 'd54b5fdc-46c1-b352',
        }
        url='https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~queryPointTaskAndSignFromES'
        response = self.do_request(url,data=json_data)
        # print(response)
        if response.get('success') == True and response.get('obj') !=[]:
            totalPoint = response["obj"]["totalPoint"]
            Log(f'执行前积分：【{totalPoint}】')
            for task in response["obj"]["taskTitleLevels"]:
                self.taskId = task["taskId"]
                self.taskCode = task["taskCode"]
                self.strategyId = task["strategyId"]
                self.title = task["title"]
                status = task["status"]
                if status == 3:
                    Log(f'>{self.title}-已完成')
                    continue
                if '参与积分活动' in self.title:
                    Log(f'>{self.title}-跳过')
                    continue
                if '去新增一个收件偏好' in self.title:
                    self.addDeliverPrefer()
                else:
                    # print("taskId:", taskId)
                    # print("taskCode:", taskCode)
                    # print("----------------------")
                    self.doTask()
                    time.sleep(3)
                self.receiveTask()

    def get_SignTaskListEnd(self):
        json_data = {
            'channelType': '3',
            'deviceId': 'd54b5fdc-46c1-b352',
        }
        url='https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~queryPointTaskAndSignFromES'
        response = self.do_request(url,data=json_data)
        # print(response)
        if response.get('success') == True and response.get('obj') !=[]:
            totalPoint = response["obj"]["totalPoint"]
            Log(f'当前积分：【{totalPoint}】')

    def doTask(self):
        Log(f'>>>开始去完成【{self.title}】任务')
        json_data = {
            'taskCode': self.taskCode,
        }
        url='https://mcs-mimp-web.sf-express.com/mcs-mimp/commonRoutePost/memberEs/taskRecord/finishTask'
        response = self.do_request(url,data=json_data)
        if response.get('success') == True:
            Log(f'>【{self.title}】任务-已完成')
        else:
            print(f'>【{self.title}】任务-{response.get("errorMessage")}')

    def receiveTask(self):
        Log(f'>>>开始领取【{self.title}】任务奖励')
        json_data = {
            "strategyId": self.strategyId,
            "taskId": self.taskId,
            "taskCode": self.taskCode,
            "deviceId": "d54b5fdc-46c1-b352"
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~fetchIntegral'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            Log(f'>【{self.title}】任务奖励领取成功！')
        else:
            print(f'>【{self.title}】任务-{response.get("errorMessage")}')

    def do_honeyTask(self):
        # 做任务
        json_data = {"taskCode": self.taskCode}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberEs~taskRecord~finishTask'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            Log(f'>【{self.taskType}】任务-已完成')
        else:
            print(f'>【{self.taskType}】任务-{response.get("errorMessage")}')

    def receive_honeyTask(self):
        Log('>>>执行收取丰蜜任务')
        # 收取
        self.headers['syscode']='MCS-MIMP-CORE'
        self.headers['channel']='duobaobannerhoney'
        self.headers['accept']='application/json, text/plain, */*'
        self.headers['timestamp']= str(int(time.time()))
        self.headers['platform']='MINI_PROGRAM'
        json_data = {"taskType": self.taskType}
        # print(json_data)
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~receiveExchangeApiService~receiveHoney'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            Log(f'收取任务【{self.taskType}】成功！')
        else:
            print(f'收取任务【{self.taskType}】失败！原因：{response.get("errorMessage")}')

    def get_coupom(self):
        Log('>>>执行领取生活权益领券任务')
        # 领取生活权益领券
        # https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberGoods~pointMallService~createOrder

        json_data = {
            "from": "Point_Mall",
            "orderSource": "POINT_MALL_EXCHANGE",
            "goodsNo": self.goodsNo,
            "quantity": 1,
            "taskCode": self.taskCode
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberGoods~pointMallService~createOrder'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            Log(f'>领券成功！')
        else:
            print(f'>领券失败！原因：{response.get("errorMessage")}')

    def get_coupom_list(self):
        Log('>>>获取生活权益券列表')
        # 领取生活权益领券
        # https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberGoods~pointMallService~createOrder

        json_data = {
            "memGrade": 1,
            "categoryCode": "SHTQ",
            "showCode": "SHTQWNTJ"
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberGoods~mallGoodsLifeService~list'
        response = self.do_request(url, data=json_data)
        # print(response)
        if response.get('success') == True:
            goodsList = response["obj"][0]["goodsList"]
            for goods in goodsList:
                exchangeTimesLimit = goods['exchangeTimesLimit']
                if exchangeTimesLimit >= 7:
                    self.goodsNo = goods['goodsNo']
                    Log(f'当前选择券号：{self.goodsNo}')
                    self.get_coupom()
                    break
        else:
            print(f'>领券失败！原因：{response.get("errorMessage")}')

    def get_honeyTaskListStart(self):
        Log('>>>开始获取采蜜换大礼任务列表')
        # 任务列表
        json_data = {}
        self.headers['channel']='duobaobannerhoney'
        url ='https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~receiveExchangeApiService~taskDetail'

        response = self.do_request(url, data=json_data)
        # print(response)
        if response.get('success') == True:
            for item in response["obj"]["list"]:
                self.taskType = item["taskType"]
                status = item["status"]
                if status == 3:
                    Log(f'>【{self.taskType}】-已完成')
                    continue
                if "taskCode" in item:
                    self.taskCode = item["taskCode"]
                    if self.taskType == 'DAILY_VIP_TASK_TYPE':
                        self.get_coupom_list()
                    else:
                        self.do_honeyTask()
                if self.taskType == 'BEES_GAME_TASK_TYPE':
                    self.honey_damaoxian()
                time.sleep(2)

    def honey_damaoxian(self):
        Log('>>>执行大冒险任务')
        # 大冒险
        for i in range(5):
            Log(f'>>开始第{i+1}次大冒险')
            json_data = {
                'gatherHoney': 20,
            }
            url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~receiveExchangeApiService~game~report'
            response = self.do_request(url, data=json_data)
            # print(response)
            stu = response.get('success')
            if stu == True:
                gameNum = response.get('obj')['gameNum']
                Log(f'>大冒险成功！剩余次数【{gameNum+1}】')
                time.sleep(2)
            else:
                print(f'>大冒险失败！【{response.get("errorMessage")}】')
                break

    def honey_indexData(self):
        Log('\n>>>>>>>开始执行采蜜换大礼任务')
        # 邀请
        json_data = {"inviteUserId": inviteId}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~receiveExchangeApiService~indexData'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            usableHoney = response.get('obj').get('usableHoney')
            Log(f'执行前丰蜜：【{usableHoney}】')
            taskDetail = response.get('obj').get('taskDetail')
            if taskDetail != []:
                for task in taskDetail:
                    self.taskType = task['type']
                    self.receive_honeyTask()
                    time.sleep(2)

    def honey_indexDataEnd(self):
        # 邀请
        json_data = {"inviteUserId": inviteId}
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~receiveExchangeApiService~indexData'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            usableHoney = response.get('obj').get('usableHoney')
            Log(f'当前丰蜜：【{usableHoney}】')


    def EAR_END_2023_TaskList(self):
        Log('\n>>>>>>开始年终集卡任务')
        # 任务列表
        json_data = {
            "activityCode": "YEAR_END_2023",
            "channelType": "MINI_PROGRAM"
        }
        self.headers['channel']='xcx23nz'
        self.headers['platform']='MINI_PROGRAM'
        self.headers['syscode']='MCS-MIMP-CORE'

        url ='https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~activityTaskService~taskList'

        response = self.do_request(url, data=json_data)
        # print(response)
        if response.get('success') == True:
            for item in response["obj"]:
                self.title = item["taskName"]
                self.taskType = item["taskType"]
                status = item["status"]
                if status == 3:
                    print(f'>【{self.taskType}】-已完成')
                    continue
                if self.taskType == 'INTEGRAL_EXCHANGE':
                    self.EAR_END_2023_ExchangeCard()
                elif self.taskType == 'CLICK_MY_SETTING':
                    self.taskCode = item["taskCode"]
                    self.addDeliverPrefer()
                if "taskCode" in item:
                    self.taskCode = item["taskCode"]
                    self.doTask()
                    time.sleep(3)
                    self.EAR_END_2023_receiveTask()
                else:
                    Log(f'暂时不支持【{self.title}】任务')
                # if self.taskType == 'BEES_GAME_TASK_TYPE':
                #     self.honey_damaoxian()
        self.EAR_END_2023_getAward()
        self.EAR_END_2023_GuessIdiom()

    def addDeliverPrefer(self):
        Log(f'>>>开始【{self.title}】任务')
        json_data = {
            "country": "中国",
            "countryCode": "A000086000",
            "province": "北京市",
            "provinceCode": "A110000000",
            "city": "北京市",
            "cityCode": "A111000000",
            "county": "东城区",
            "countyCode": "A110101000",
            "address": "1号楼1单元101",
            "latitude": "",
            "longitude": "",
            "memberId": "",
            "locationCode": "010",
            "zoneCode": "CN",
            "postCode": "",
            "takeWay": "7",
            "callBeforeDelivery": 'false',
            "deliverTag": "2,3,4,1",
            "deliverTagContent": "",
            "startDeliverTime": "",
            "selectCollection": 'false',
            "serviceName": "",
            "serviceCode": "",
            "serviceType": "",
            "serviceAddress": "",
            "serviceDistance": "",
            "serviceTime": "",
            "serviceTelephone": "",
            "channelCode": "RW11111",
            "taskId": "5645921EFDAD48DE94950DD5DA6C6231",
            "extJson": "{\"noDeliverDetail\":[]}"
        }
        url = 'https://ucmp.sf-express.com/cx-wechat-member/member/deliveryPreference/addDeliverPrefer'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            Log('新增一个收件偏好，成功')
        else:
            print(f'>【{self.title}】任务-{response.get("errorMessage")}')

    def EAR_END_2023_ExchangeCard(self):
        Log(f'>>>开始积分兑换年卡')
        json_data = {
            "exchangeNum": 2,
            "activityCode": "YEAR_END_2023",
            "channelType": "MINI_PROGRAM"
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonNoLoginPost/~memberNonactivity~yearEnd2023TaskService~integralExchange'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            receivedAccountList = response['obj']['receivedAccountList']
            for card in receivedAccountList:
                Log(f'>获得：【{card["urrency"]}】卡【{card["amount"]}】张！')
        else:
            print(f'>【{self.title}】任务-{response.get("errorMessage")}')

    def EAR_END_2023_getAward(self):
        print(f'>>>开始抽卡')
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~yearEnd2023GardenPartyService~getAward'
        for l in range(10):
            for i in range(0,3):
                json_data = {
                    "cardType": i
                }
                response = self.do_request(url, data=json_data)
                # print(response)
                if response.get('success') == True:
                    receivedAccountList = response['obj']['receivedAccountList']
                    for card in receivedAccountList:
                        print(f'>获得：【{card["currency"]}】卡【{card["amount"]}】张！')
                elif response.get('errorMessage') == '达到限流阈值，请稍后重试':
                    break
                elif response.get('errorMessage') == '用户信息失效，请退出重新进入':
                    break
                else:
                    print(f'>抽卡失败：{response.get("errorMessage")}')
                time.sleep(3)


    def EAR_END_2023_GuessIdiom(self):
        print(f'>>>开始猜成语')
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~yearEnd2023GuessIdiomService~win'
        for i in range(1,11):
            json_data = {
                "index": i
            }
            response = self.do_request(url, data=json_data)
            if response.get('success') == True:
                print(f'第{i}关成功！')
                # receivedAccountList = response['obj']['receivedAccountList']
                # for card in receivedAccountList:
                #     print(f'>获得：【{card["urrency"]}】卡【{card["amount"]}】张！')
            else:
                print(f'第{i}关失败！')

    def EAR_END_2023_receiveTask(self):
        Log(f'>>>开始领取【{self.title}】任务奖励')
        json_data = {
            "taskType": self.taskType,
            "activityCode": "YEAR_END_2023",
            "channelType": "MINI_PROGRAM"
        }
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonNoLoginPost/~memberNonactivity~yearEnd2023TaskService~fetchMixTaskReward'
        response = self.do_request(url, data=json_data)
        if response.get('success') == True:
            Log(f'>【{self.title}】任务奖励领取成功！')
        else:
            print(f'>【{self.title}】任务-{response.get("errorMessage")}')

    def main(self, sfurl,indx):
        Log(f"\n------开始执行第{indx + 1}个账号------")
        login_res = self.login(sfurl)
        if login_res != True:
            return False
        # 执行签到任务
        self.sign()
        self.get_SignTaskList()
        self.get_SignTaskListEnd()
        #执行丰蜜任务
        self.honey_indexData()
        #获取任务列表并执行任务
        self.get_honeyTaskListStart()
        self.honey_indexDataEnd()
        # 获取当前季度结束日期
        activity_end_date = get_quarter_end_date()
        if is_activity_end_date(activity_end_date):
            Log("今天采蜜活动截止兑换，请及时进行兑换")
            send('顺丰速运挂机通知', "今天采蜜活动截止兑换，请及时进行兑换")
        target_time = datetime(2024, 2, 2, 19, 0)
        if datetime.now() < target_time:
            self.EAR_END_2023_TaskList()
        else:
            Log('集卡活动已结束')

from datetime import datetime, timedelta

def get_quarter_end_date():
    current_date = datetime.now()
    current_month = current_date.month
    current_year = current_date.year

    # 计算下个季度的第一天
    next_quarter_first_day = datetime(current_year, ((current_month - 1) // 3 + 1) * 3 + 1, 1)

    # 计算当前季度的最后一天
    quarter_end_date = next_quarter_first_day - timedelta(days=1)

    return quarter_end_date.strftime("%Y-%m-%d")

def is_activity_end_date(end_date):
    current_date = datetime.now().date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

    return current_date == end_date

def getTips(server_base_url):
    url = f'{server_base_url}tips.txt'
    try:
        response = requests.get(url, verify=False)
        # 检查响应的编码
        encoding = response.encoding
        # print(f"编码: {encoding}")
        # 设置正确的编码（根据实际情况可能需要调整）
        response.encoding = 'utf-8'
        # 读取内容
        content = response.text
        if 'code' in content:
            content =''
    except:
        content = ''
        print('获取通知内容失败')
    print('***********通知内容************')
    print(content)
    print('***********通知内容************\n')

def compare_versions(local_version, server_version):
    local_parts = local_version.split('.')  # 将本地版本号拆分成数字部分
    server_parts = server_version.split('.')  # 将服务器版本号拆分成数字部分

    for l, s in zip(local_parts, server_parts):
        if int(l) < int(s):
            return True  # 当前版本低于服务器版本
        elif int(l) > int(s):
            return False  # 当前版本高于服务器版本

    # 如果上述循环没有返回结果，则表示当前版本与服务器版本的数字部分完全相同
    if len(local_parts) < len(server_parts):
        return True  # 当前版本位数较短，即版本号形如 x.y 比 x.y.z 低
    else:
        return False  # 当前版本与服务器版本相同或更高

def check_update(local_version, server_version_url, server_script_url, script_filename):
    """
    检查版本并更新

    Args:
        local_version (str): 本地版本号
        server_version_url (str): 服务器版本文件地址
        server_script_url (str): 服务器脚本地址
        script_filename (str): 要保存的脚本文件名

    Returns:
        bool: 是否进行了更新操作
    """
    try:
        # 获取服务器版本号
        response = requests.get(server_version_url, verify=False)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        server_version = response.text.strip()  # 去除首尾空格
        print(f'当前版本：【{local_version}】')
        print(f'服务器版本：【{server_version}】')

        if compare_versions(local_version, server_version):
            # 需要更新，下载服务器脚本
            AUTO_UPDATE = os.getenv("SCRIPT_UPDATE", "True").lower() != "false"
            # print(AUTO_UPDATE)
            if AUTO_UPDATE:
                print(">>>>>>>发现新版本的脚本，默认自动更新，准备更新...")
                print(">>>>>>>禁用更新请定义变量export SCRIPT_UPDATE = 'False'")
                response_script = requests.get(server_script_url, verify=False, timeout=10)
                response_script.raise_for_status()

                with open(script_filename, 'wb') as f:
                    f.write(response_script.content)
                print(f'{script_filename} 下载完成！')
                print(f'尝试运行新脚本')
                import subprocess,sys
                # 使用 sys.executable 获取 Python 可执行文件的完整路径
                python_executable = sys.executable
                subprocess.Popen([python_executable, script_filename])

            else:
                print(">>>>>>>发现新版本的脚本，您禁用了自动更新，如需启用请删除变量SCRIPT_UPDATE")
        else:
            print(f'当前版本高于或等于服务器版本')

    except requests.exceptions.RequestException as e:
        print(f'发生网络错误：{e}')

    except Exception as e:
        print(f'发生未知错误：{e}')

    return False  # 返回 False 表示没有进行更新操作

if __name__ == '__main__':
    print('''
✨✨✨ 顺丰速运脚本✨✨✨
✨ 功能：
      积分签到
      签到任务
      采蜜任务
      年终集卡
✨ 抓包步骤：
      打开顺丰速运APP或小程序
      点击我的
      打开抓包工具
      点击“积分”，以下几种url之一：
        https://mcs-mimp-web.sf-express.com/mcs-mimp/share/weChat/shareGiftReceiveRedirect
        https://mcs-mimp-web.sf-express.com/mcs-mimp/share/app/shareRedirect
    多账号#分割 
✨ 设置青龙变量：
export SFSY='url'多账号#分割
export SCRIPT_UPDATE = 'False' 关闭脚本自动更新，默认开启
✨✨✨ @Author CHERWIN✨✨✨
    ''')
    APP_NAME = '顺丰速运'
    local_script_name = os.path.basename(__file__)
    # print(local_script_name)
    # 检查更新
    local_version = '2024.01.30.2'  # 本地版本
    server_base_url = f"https://pan.ziyuand.cn/d/软件资源类/脚本/{APP_NAME}/"
    server_script_url = f"{server_base_url}{local_script_name}"
    server_version_url = f'{server_base_url}version.txt'  # 服务器版本文件地址
    getTips(server_base_url)
    check_update(local_version, server_version_url, server_script_url, f'{local_script_name}')

    print("顺丰速运小程序\n签到，签到任务、采蜜，采蜜任务，集卡")
    info = ''
    token = environ.get("SFSY") if environ.get("SFSY") else info
    # print(token)
    if not token:
        print(
            "未填写SFURL变量\n青龙可在环境变量设置 SFSY 或者在本脚本文件上方将 抓包获得的url 填入info\n打开小程序或APP-我的-积分, 捉以下几种url之一,把整个url放到变量 SFSY 里,\nhttps://mcs-mimp-web.sf-express.com/mcs-mimp/share/weChat/shareGiftReceiveRedirect\nhttps://mcs-mimp-web.sf-express.com/mcs-mimp/share/app/shareRedirect,多账号#分割")
        exit()
    # 根据分隔符拆分URL
    splitted_urls = token.split('#')
    if len(splitted_urls) > 0:
        print(f"\n>>>>>>>>>>共获取到{len(splitted_urls)}个账号<<<<<<<<<<")
        for indx, url in enumerate(splitted_urls):
            s = requests.session()
            s.verify = False
            # print(info)
            run = SFSY().main(url,indx)
            if run != True:continue
            time.sleep(1)
        send('顺丰速运挂机通知', send_msg)

