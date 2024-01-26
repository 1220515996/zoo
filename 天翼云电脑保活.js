const puppeteer = require("puppeteer");
const dayjs = require("dayjs");

// 刷新间隔，默认 5 分钟
const refreshTime = 5;

async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      // headless: false,
      // executablePath:
      //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    const page = await browser.newPage();
    await page.goto("https://pc.ctyun.cn/#/login");
    const imageData = await page.$eval(".self-qr", (el) => el.title);
    console.log(
      "扫码登录：",
      `https://cli.im/api/qrcode/code?text=${encodeURIComponent(imageData)}`
    );
    await page.waitForNavigation();
    await page.waitForSelector(".icon-get-into");
    const id = await page.$eval(
      ".desktop-main-name-code",
      (el) => el.textContent
    );
    console.log("登录成功：", id);
    const desktopUrl = `https://pc.ctyun.cn/#/desktop?id=${Buffer.from(
      id.slice(-8)
    ).toString("base64")}`;
    console.log("desktopUrl", desktopUrl);
    await page.$eval(".icon-get-into", (el) => el.click());
    await page.waitForSelector(".btn-show-toolbar--safe-img + span");
    await new Promise((r) => setTimeout(r, 10000));
    const delay = await page.$eval(
      ".btn-show-toolbar--safe-img + span",
      (el) => el.innerText
    );
    console.log(`云电脑窗口已启动，当前延迟：${delay}！`);
    console.log("--------------------------------------");
    const timer = setInterval(async () => {
      try {
        await page.reload();
        await page.waitForSelector(".btn-show-toolbar--safe-img + span");
        await new Promise((r) => setTimeout(r, 10000));
        const delay = await page.$eval(
          ".btn-show-toolbar--safe-img + span",
          (el) => el.innerText
        );
        console.log(
          `[${dayjs().format(
            "YYYY MM-DD HH:mm:ss"
          )}] 窗口刷新成功，当前延迟：${delay}！`
        );
      } catch (error) {
        clearInterval(timer);
        await browser.close();
        console.log(
          `[${dayjs().format("YYYY MM-DD HH:mm:ss")}] 窗口刷新失败！！！`
        );
        console.log(error);
      }
    }, refreshTime * 60 * 1000);
  } catch (error) {
    console.log("程序启动失败！！！");
    console.log(error);
  }
}

main();
