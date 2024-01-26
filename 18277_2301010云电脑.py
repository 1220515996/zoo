import requests
import hashlib
import time

tel = "*******"         # 手机号
pwd = "*******"           # password值
deviceCode = "*******"    # deviceCode值
objId = "*******"	# 云电脑页面ID值后八位


login_url = 'https://desk.ctyun.cn:8810/api/auth/client/login'
login_data = {
    'userAccount': tel,
    'password': pwd,
    'sha256Password': pwd,
    'deviceCode': deviceCode,
    'deviceName': 'Edge浏览器',
    'hostName': 'Edge浏览器',
    'deviceType': '60',
    'deviceModel': 'Windows NT 10.0; Win64; x64',
    'appVersion': '1.36.1',
    'sysVersion': 'Windows NT 10.0; Win64; x64',
    'clientVersion': '201360101',
    'objId': objId,
    'objType': '0',
    'osType': '15',
    'deviceId': '60',
    'hardwareFeatureCode': deviceCode,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
}

session = requests.Session()
login_response = session.post(login_url, data=login_data)
cookies = login_response.cookies

if login_response.status_code == 200:
    print('登录成功！返回的信息如下： ')
    print(login_response.json())
    data = login_response.json()['data']
    if 'userId' in data and 'secretKey' in data:
        userId = data['userId']
        secretKey = data['secretKey']
        print("userId:", userId)
        print("secretKey:", secretKey)
        appModelValue = "2"
        deviceCodeValue = deviceCode
        deviceTypeValue = "60"
        requestIdValue = "1704522993726"
        tenantIdValue = "250432"
        timestampValue = str(int(time.time() * 1000))
        versionValue = "201360101"

        signatureStr = deviceTypeValue + requestIdValue + tenantIdValue + timestampValue + str(userId) + versionValue + secretKey

        hash_object = hashlib.md5(signatureStr.encode())
        md5_hash = hash_object.hexdigest().upper()

        headers = {
            'ctg-appmodel': appModelValue,
            'ctg-devicecode': deviceCodeValue,
            'ctg-devicetype': deviceTypeValue,
            'ctg-requestid': requestIdValue,
            'ctg-signaturestr': md5_hash,
            'ctg-tenantid': tenantIdValue,
            'ctg-timestamp': timestampValue,
            'ctg-userid': str(userId),
            'ctg-version': versionValue,
        }
        
        redirect_url = 'https://desk.ctyun.cn:8810/api/desktop/client/connect'
        redirect_response = session.post(redirect_url, data=login_data, headers=headers)

        if redirect_response.status_code == 200:
            print('云电脑登录信息： ')
            print(redirect_response.json())
        else:
            print('登录失败！')
            print(redirect_response.json())
    else:
        print('未能提取userId和secretKey')
else:
    print('登录失败！')