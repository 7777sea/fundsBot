const nodemailer = require("nodemailer");
const { default: Axios } = require("axios");
const schedule = require("node-schedule");
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const template = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'email.ejs'), 'utf8'));

const baseFundsCodes = []  //这里填的是你所关注的基金的code

function getHoneyedWords() {
  const url = "https://chp.shadiao.app/api.php";
  return Axios.get(url);
}

function getFundsInfo () {
    const url = "https://api.doctorxiong.club/v1/fund";
    const _url = `${url}?code=${baseFundsCodes.join(',')}`
    return Axios.get(_url);
}

// 发送邮件函数
async function sendMail(text, list) {
  var user = "";//自己的邮箱
  var pass = ""; //qq邮箱授权码
  var to = "";//对方的邮箱
  let transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 587,
    secure: false,
    auth: {
      user: user, // 用户账号
      pass: pass, //授权码,通过QQ获取
    },
  });
  const html = template({
    tip: text,
    list: list
  })
  await transporter.sendMail({
    from: `<${user}>`, // sender address
    to: `<${to}>`, // list of receivers
    subject: "fundsBot", // Subject line
    html
  });
  console.log("=================== 发送成功 ======================");
}

//测试一下
schedule.scheduleJob({ hour: 10, minute: 23 }, function () {
    console.log("启动任务:" + new Date());
    Promise.all([getHoneyedWords(), getFundsInfo()]).then((res) => {
      const [ honeyedWords, fundsInfo ] = res;
      sendMail(honeyedWords.data, fundsInfo.data.data)
    })
});

