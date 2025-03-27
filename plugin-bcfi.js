/**
 * gui.for.singbox <配置插件>参数设置
 * Input 带宽->设置期望带宽(默认最小10,单位 Mbps)->BANDWIDTH->10
 * Radio v4v6->选择ipv4还是ipv6的优选->IPV->ipv4/ipv6
 * Switch tls->是否开启tls，优选https ip，默认关闭->TLS
 * Switch RTT并发开关->是否RTT延迟并发测试，默认开启->RTT_PROMISE
 * Input 测速并发数，这个和RTT并发开关无关->对获取的优选ip一次并发测速的数量，默认为10，最好调小不调大，如调大请不要设置太大，会导致出错，调小也可以获取更大的带宽，那就必须要修改speedtesthttp方法里的down_bytes参数（下载的字节数）/--connect-timeout参数（连接超时时间）和--max-time（最大访问时间），假设你要选择100mbps带宽，最好设置并发数为1，down_bytes将后面的*10改为*100/--max-time设为15->CONCURRENCY_NUM
 * Input 节点数->设置获取的vless节点数，默认为10->VLESS_NUM->10
 * KeyValueEditor vless参数->vless配置相关项->VLESS_OBJ->UUID和DOMAIN
 * InputList 订阅文件名集合 -> 使用本插件优选ip后，需要把得到的singbox节点通过更新订阅的方式来获取，把订阅文件名添加进来 -> SUB_FNAMES
 * 
 * */

// 初始化配置
const Config = async () => {
  const plugin_config = {
    "id": Plugin.id ?? "plugin-cloudflareip-filter",
    "name": "bettercloudflareip",
    "version": "v1.0.0",
    "description": "获取最适合的cf优选ip",
    "type": "Http",
    "url": "https://raw.githubusercontent.com/Daniel7934/bcfi/refs/heads/main/plugin-bcfi.js",
    "path": Plugin.path ?? "data/plugins/plugin-cloudflareip-filter.js",
    "triggers": [
      "on::manual",
      "on::subscribe"
    ],
    "menus": {},
    "context": {
      "profiles": {},
      "subscriptions": {},
      "rulesets": {},
      "plugins": {},
      "scheduledtasks": {}
    },
    "status": 0,
    "configuration": [
      {
        "id": Plugins.sampleID(),
        "title": "带宽",
        "description": "设置期望带宽(默认最小10,单位 Mbps)",
        "key": "BANDWIDTH",
        "component": "Input",
        "value": "10",
        "options": []
      },
      {
        "id": Plugins.sampleID(),
        "title": "v4v6",
        "description": "选择ipv4还是ipv6的优选",
        "key": "IPV",
        "component": "Radio",
        "value": "",
        "options": [
          "ipv4",
          "ipv6"
        ]
      },
      {
        "id": Plugins.sampleID(),
        "title": "tls",
        "description": "是否开启tls，优选https ip，默认关闭",
        "key": "TLS",
        "component": "Switch",
        "value": false,
        "options": []
      },
      {
        "id": Plugins.sampleID(),
        "title": "RTT并发开关",
        "description": "是否RTT延迟并发测试，默认开启",
        "key": "RTT_PROMISE",
        "component": "Switch",
        "value": true,
        "options": []
      },
      {
        "id": Plugins.sampleID(),
        "title": "测速并发数，这个和RTT并发开关无关",
        "description": "对获取的优选ip一次并发测速的数量，默认为10，最好调小不调大，如调大请不要设置太大，会导致出错，调小也可以获取更大的带宽，那就必须要修改speedtesthttp方法里的down_bytes参数（下载的字节数）/--connect-timeout参数（连接超时时间）和--max-time（最大访问时间），假设你要选择100mbps带宽，最好设置并发数为1，down_bytes将后面的*10改为*100/--max-time设为15",
        "key": "CONCURRENCY_NUM",
        "component": "Input",
        "value": "10",
        "options": []
      },
      {
        "id": Plugins.sampleID(),
        "title": "节点数",
        "description": "设置获取的vless节点数，默认为10",
        "key": "VLESS_NUM",
        "component": "Input",
        "value": "10",
        "options": []
      },
      {
        "id": Plugins.sampleID(),
        "title": "vless参数",
        "description": "vless配置相关项",
        "key": "VLESS_OBJ",
        "component": "KeyValueEditor",
        "value": {
          "UUID": "",
          "DOMAIN": ""
        },
        "options": []
      },
      {
        "id": Plugins.sampleID(),
        "title": "订阅文件名集合",
        "description": "使用本插件优选ip后，需要把得到的singbox节点通过更新订阅的方式来获取，把订阅文件名添加进来",
        "key": "SUB_FNAMES",
        "component": "InputList",
        "value": [],
        "options": []
      }
    ],
    "disabled": false,
    "install": true,
    "installed": false,
  }
  //注入配置文件
  await Plugins.usePluginsStore().editPlugin(Plugin.id, plugin_config);
  return 0
}
//下载所需资源
const installBcfi = async () => {
  const coloUrl = 'https://www.baipiao.eu.org/cloudflare/colo';
  const urlUrl = 'https://www.baipiao.eu.org/cloudflare/url';
  const v4Url = 'https://www.baipiao.eu.org/cloudflare/ips-v4';
  const v6Url = 'https://www.baipiao.eu.org/cloudflare/ips-v6';
  
  const headers = {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'zh-CN,zh;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'Content-Type': 'text/plain;charset=UTF-8',
    }
  
  await Plugins.Makedir(BCFI_PATH)
  const { id } = Plugins.message.info('正在执行安装...', 999999)
  try {
    Plugins.message.update(id, '正在下载所需资源')
    await Plugins.Download(coloUrl, COLO_FILE, headers, (c, t) => Plugins.message.update(id, '正在下载colo.txt...'+ ((c / t) * 100).toFixed(2) + '%'), {Proxy: null})
    await Plugins.sleep(1000);
    await Plugins.Download(urlUrl, URL_FILE, headers, (c, t) => Plugins.message.update(id, '正在下载url.txt...'+ ((c / t) * 100).toFixed(2) + '%'), {Proxy: null})
    await Plugins.sleep(1000);
    await Plugins.Download(v4Url, V4_FILE, headers, (c, t) => Plugins.message.update(id, '正在下载ips-v4.txt...'+ ((c / t) * 100).toFixed(2) + '%'), {Proxy: null})
    await Plugins.sleep(1000);
    await Plugins.Download(v6Url, V6_FILE, headers, (c, t) => Plugins.message.update(id, '正在下载ips-v6.txt...'+ ((c / t) * 100).toFixed(2) + '%'), {Proxy: null})
    Plugins.message.update(id, '配置文件安装完成', 'success')
  } finally {
    await Plugins.sleep(1000)
    Plugins.message.destroy(id)
  }
}
const bcfi = async () => {
  const startTime = new Date();
  const ipArrInfo = await cftest();
  const singbox_nodes = getSSNodes(ipArrInfo);
  //清除控制台
  console.clear();
  console.log(singbox_nodes);
  const endTime = new Date();
  const runTime = Math.round((endTime - startTime)/1000);
  console.log(`完成! 总计用时${runTime} 秒`);
  return { singbox_nodes, runTime };
}

const cftest = async () => {
  let ipSpeedData = [];
  while (true) {
    let rttMap = null;
    while(true) {
      const ipnum = 100;
      let ipArr = [];
      if (Plugin.IPV == 'ipv4') {
        ipArr = await getRandIpSet(ipnum, V4_FILE, Plugin.IPV);
      }
      else if (Plugin.IPV == 'ipv6') {
        ipArr = await getRandIpSet(ipnum, V6_FILE, Plugin.IPV);
      }
      if (!Plugin.TLS) {
        if (Plugin.RTT_PROMISE) rttMap = await rtthttpPro(ipArr);
        else rttMap = await rtthttp(ipArr);
      }
      else {
        if (Plugin.RTT_PROMISE) rttMap = await rtthttpsPro(ipArr)
        else rttMap = await rtthttps(ipArr)
      }
      if (rttMap.size<=0) {
        await Plugins.confirm("当前所有IP都存在RTT丢包，是否继续新的RTT测试，如果多次测试全丢包，请检查你的网络环境，不要执着新的测试")
      }
      else break;
    }
    const ipRttArr = [...rttMap.entries()];
    const allIp = ipRttArr.map(i=>i[0]);
    const speedRes = !Plugin.TLS
        ? await limitConcurrency(allIp, Plugin.CONCURRENCY_NUM, speedtesthttp)
        : await limitConcurrency(allIp, Plugin.CONCURRENCY_NUM, speedtesthttps);
    
    const tempIps = speedRes.map(result => {
      return {
        ip: result.value.ip,
        speed: result.value.speed,
        rtt: rttMap.get(result.value.ip).rtt,
        publicIp: rttMap.get(result.value.ip).publicIp,
        colo: rttMap.get(result.value.ip).colo
      };
    })
    ipSpeedData = ipSpeedData.concat(tempIps);
    // console.log(ipSpeedData);
    let last_num = Plugin.VLESS_NUM - ipSpeedData.length;
    last_num = last_num<0? 0 : last_num;
    console.log(`还剩${last_num}个ip数未达到设置的量`);
    if (ipSpeedData.length >= Plugin.VLESS_NUM) break;
    if (ipSpeedData.length==0) await Plugins.confirm("当前所有IP都存在测速失败，是否继续新的测速，如果多次测速全失败，请检查你的网络环境，不要执着新的测速");
    
  }

  
  return ipSpeedData
}

//1.读取ip文件随机抽取
const getRandIpSet = async (ipnum, filename, ipv) => {
  const ipSet = new Set(); // Set 存储只会存储唯一值
  while (true) {
    let ipStr = await Plugins.Readfile(filename)
      .then((lines) => {
      return lines.split("\n");
    }).then((obj) => {
      
      let temp = {};
      for (const ipList of obj) {
        // 给每个ip前面添加一个随机数字
        temp[Math.random()] = ipList;
      }
      // console.log(temp)
      return temp;
    }).then((entries) => {
      //将对象转换为键值对数组
      const kv = Object.entries(entries);
      //生成 从小到大 排序后的新数组
      kv.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
      // console.log(kv)
      // 提取排序后的前ipnum值
      let value = kv.map(([k, v]) => v)
        .slice(0, (ipnum - ipSet.size))
        .map(ip => {
          if (ipv=="ipv4") {
            const p = ip.split('.');
            if(p.length>=3) {
              const aIp = p.slice(0, 3).join('.');
              const bIp = Math.floor(Math.random() * 256);
              return `${aIp}.${bIp}`;
            }
          } else if(ipv=="ipv6"){
            const p = ip.split(':');
            if(p.length>=3) {
              const aIp = p.slice(0, 3).join(':');
              return `${aIp}:${randIpv6Hex()}:${randIpv6Hex()}:${randIpv6Hex()}:${randIpv6Hex()}:${randIpv6Hex()}`;
            }
          }

        }).filter(ip => ip !== undefined); 
      return value
    });
    // console.log(ipStr);
    for (const ip of ipStr) {
      if (ip) ipSet.add(ip);
    }
    if(ipSet.size>=ipnum) break;
    
    // break;
  }
  const ipArr = [...ipSet];
  return ipArr;
}
//2.往返延迟
const rtthttp = async (ipArr) => {
  let rttMap = new Map();
  for (let ip of ipArr) {
    const rttResult = await rtthttpIp(ip);
    // 处理 rtthttpIp 函数返回的结果
    if (rttResult && rttResult.rtt !== null) {
      rttMap.set(rttResult.ip, {
        rtt: rttResult.rtt,
        publicIp: rttResult.publicIp,
        colo: rttResult.colo
      });
    }
  }
  console.log("rtthttp 不并发")
  console.log(rttMap)
  return rttMap;
}
//rtt并发测试
const rtthttpPro = async (ipArr) => {
  let rttMap = new Map();
  // 创建一个 Promise 数组，每个 Promise 处理一个 IP 地址的 HTTP RTT 测试
  const promises = ipArr.map(async (ip) => {
    return await rtthttpIp(ip)
  });
  // 使用 Promise.all() 并发执行所有 Promise
  const results = await Promise.all(promises);
  // 处理所有 IP 地址的测试结果
  results.forEach(result => {
    if (result.rtt !== null) {
      rttMap.set(result.ip, {
        rtt: result.rtt,
        publicIp: result.publicIp,
        colo: result.colo
      });
    }
  });
  console.log("rtthttp 并发");
  console.log(rttMap);
  return rttMap; 
}

const rtthttps = async (ipArr) => {
  let rttMap = new Map();
  for (let ip of ipArr) {
    const rttResult =  await rtthttpsIp(ip);
    if (rttResult && rttResult.rtt !== null) {
      rttMap.set(rttResult.ip, {
        rtt: rttResult.rtt,
        publicIp: rttResult.publicIp,
        colo: rttResult.colo
      });
    }
  }
  console.log("rtthttps 不并发")
  console.log(rttMap)
  return rttMap; 
}
const rtthttpsPro = async (ipArr) => {
    const rttMap = new Map();
    const promises = ipArr.map(async (ip) => { // 并发处理每个 IP 地址
      return await rtthttpsIp(ip);
    });
    const results = await Promise.all(promises); // 并发等待所有 curl 命令完成
    results.forEach(result => {
        if (result.rtt !== null) {
            rttMap.set(result.ip, {
              rtt: result.rtt,
              publicIp: result.publicIp,
              colo: result.colo
            });
        }
    });
    console.log("rtthttps 并发");
    console.log(rttMap);
    return rttMap;
};

//3. 限制并发的测速
const limitConcurrency = async (allIp, concurrencyNum, func) => {
  const results = [];
  while (allIp.length > 0) {
    // 取出一批ip
    const batch = allIp.splice(0, concurrencyNum);
    // 使用 Promise.allSettled 执行一批请求
    const batchResults = await Promise.allSettled(
        batch.map(async ip => {
          const speed = await func(ip);
          // console.log(speed)
          return { ip, speed };
        })
    );
    batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.speed > bw$) {
            results.push(result);
        }
    });
    // results.push(...batchResults);
    if(results.length>=Plugin.VLESS_NUM) break;
  }
  return results;
}

//3.1 优选ip http测速
const speedtesthttp = async (ip) => {
  const down_bytes = 1048576*10;
  // 构造 curl 命令参数
  const curlArgs = [
    "-x", `${ip}:80`,
    `http://${domain$}/${file$}`,
    "-o", curl_away$,      // 丢弃响应内容
    "-s",                   // 静默模式
    "--range", `0-${down_bytes}`,//2进制里down_bytes mb的大小，下载测试速度
    "--connect-timeout", "2",
    "--max-time", "10",
    "-w", "%{speed_download}"
  ];
  try {
    const speed = await Plugins.Exec("curl", curlArgs, {
      Convert: true, // 如果输出需要编码转换则启用
      Env: {}        // 可传递环境变量
    });
    // console.log(speed*8/1000000)
    return Math.round(speed*8/1e6);
  } catch (error) {
    console.error("请求失败:", error);
    return 0;
  }
}
//3.2 优选ip https测速
const speedtesthttps = async (ip) => {
  const down_bytes = 1048576*10;
  // 构造 curl 命令参数
  const curlArgs = [
    "--noproxy", `${domain$},${ip}`,
    "--resolve", `${domain$}:443:${ip}`,
    `https://${domain$}/${file$}`,
    "-o", curl_away$,      // 丢弃响应内容
    "-s",                   // 静默模式
    "--range", `0-${down_bytes}`,//2进制里down_bytes mb的大小，下载用于测试速度
    "--connect-timeout", "2",
    "--max-time", "15",
    "-w", "%{speed_download}"
  ];
  try {
    const speed = await Plugins.Exec("curl", curlArgs, {
      Convert: true, // 如果输出需要编码转换则启用
      Env: {}        // 可传递环境变量
    });
    // console.log(speed)
    return Math.round(speed*8/1e6);
  } catch (error) {
    console.error("tls请求失败:", error);
    return 0;
  }
}
//4. 将得到的数据转换成singbox vless节点
const getSSNodes = (ipArrInfos) => {
  let singbox_nodes = [];
  for (let i of ipArrInfos) {
    singbox_nodes.push({
      "type": "vless",
      "tag": `${i.speed}M/${Plugin.IPV}_${ipLocation$.split("\n").find(l => l.includes(i.colo)).split('-')[0]}_${randStr(3)}`,
      "server": i.ip.includes("[") ? i.ip.slice(1, i.ip.length - 1) : i.ip,
      "server_port": 80,
      "uuid": Plugin.VLESS_OBJ.UUID,
      "transport": {
        "path": "/?ed=2560",
        "type": "ws",
        "headers": {
          "Host": Plugin.VLESS_OBJ.DOMAIN
        }
      },
      "tcp_fast_open": false
    });
  }
  // console.log(singbox_nodes);
  return singbox_nodes;
}

//工具方法 关闭tls测试rtthttp
const rtthttpIp = async (ip) => {
  if (ip.includes(":")) ip = `[${ip}]`;
  let errorIp = false;
  let rtt = 0;
  let publicIp = "";
  let colo = "";
  for (let i = 0; i < 3; i++) {
    const curlArgs = [
      "--proxy", `${ip}:80`,
      `http://${domain$}/cdn-cgi/trace`,
      // "-o", curl_away$,      // 丢弃响应内容
      "-s",                   // 静默模式
      "--connect-timeout", "1",
      "--max-time", "3",
      "-w", "%{http_code}_%{time_connect}"
    ];
    try {
      const resp = await Plugins.Exec("curl", curlArgs, {
        Convert: true, // 如果输出需要编码转换则启用
        Env: {}        // 可传递环境变量
      });
      if (resp.includes("200")) {
        if (i==2) {
          publicIp = resp.split('\n').map(l => l.trim()).find(l => l.startsWith('ip=')).substring(3);
          colo = resp.split('\n').map(l => l.trim()).find(l => l.startsWith('colo=')).substring(5);
        }
        rtt += resp.substring(resp.lastIndexOf('\n') + 1).split('_')[1]*1000000;
      }
    } catch (error) {
      console.log(error)
      errorIp = true;
      break;
    }
  }
  if (!errorIp) {
    rtt = `${Math.round(rtt / 3000)}`;
    return { ip: ip, rtt: rtt, publicIp: publicIp, colo: colo };
  } else {
    return { ip: ip, rtt: null, publicIp: null, colo: null };
  }
}

//工具方法 开启tls测试rtthttps
const rtthttpsIp = async (ip) => {
  let errorIp = false;
  let rtt = 0;
  let publicIp = "";
  let colo = "";
  for (let i = 0; i < 3; i++) {
    // 构造 curl 命令参数
    const curlArgs = [
      "--noproxy", `${domain$},${ip}`,
      "--resolve", `${domain$}:443:${ip}`,
      `https://${domain$}/cdn-cgi/trace`,
      // "-o", curl_away$,      // 丢弃响应内容
      "-s",                   // 静默模式
      "--connect-timeout", "1",
      "--max-time", "3",
      "-w", "%{http_code}_%{time_connect}"
    ];
    try {
      const resp = await Plugins.Exec("curl", curlArgs, {
        Convert: true, // 如果输出需要编码转换则启用
        Env: {}        // 可传递环境变量
      });
      if (resp.includes("200")) {
        if (i==2) {
          publicIp = resp.split('\n').map(l => l.trim()).find(l => l.startsWith('ip=')).substring(3);
          colo = resp.split('\n').map(l => l.trim()).find(l => l.startsWith('colo=')).substring(5);
        }
        rtt += resp.substring(resp.lastIndexOf('\n') + 1).split('_')[1]*1000000;
      }
    } catch (error) {
      console.log(error)
      errorIp = true;
      break;
    }
  }  
  if (!errorIp) {
    rtt = `${Math.round(rtt / 3000)}`;
    return { ip: ip, rtt: rtt, publicIp: publicIp, colo: colo };
  } else {
    return { ip: ip, rtt: null, publicIp: null, colo: null };
  }
}
//工具方法 检查配置插件
const checkConf = async () => {
  if(!Plugin.IPV || !Plugin.VLESS_OBJ.UUID || !Plugin.VLESS_OBJ.DOMAIN){
    await Plugins.alert(Plugin.name, '请右键在配置插件中设置默认选项')
    return false
  }
  return true
};
//工具方法 生成随机字符串
function randStr(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  let randomString = ''; 
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // 生成一个随机索引
    randomString += characters.charAt(randomIndex); // 使用随机索引从字符集中获取字符并添加到随机字符串
  }
  return randomString;
}

//工具方法 生成ipv6的16进制范围值
const randIpv6Hex = () => {return Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');}


//全局变量
const BCFI_PATH = 'data/third/bettercloudflareip';
const COLO_FILE = `${BCFI_PATH}/colo.txt`;
const URL_FILE = `${BCFI_PATH}/url.txt`;
const V4_FILE = `${BCFI_PATH}/ips-v4.txt`;
const V6_FILE = `${BCFI_PATH}/ips-v6.txt`;
//带宽
const bw$ = Plugin.BANDWIDTH < 0 ? 10 : Plugin.BANDWIDTH;
const ipLocation$ = await Plugins.ignoredError(Plugins.Readfile, COLO_FILE);
let url$ = await Plugins.ignoredError(Plugins.Readfile, URL_FILE) ?? "/";
const domain$ = url$.split("/")[0]
const file$ = url$.substring(url$.indexOf("/")+1)
let env$ = await Plugins.GetEnv();
let curl_away$ = "";
if (env$.os == "windows") curl_away$ = "NUL";
else curl_away$ = "/dev/null";
//全局变量over

// 安装所需配置文件
const onInstall = async () => {
  await installBcfi();
  return 0
}
// 卸载配置文件
const onUninstall = async () => {
  await Plugins.confirm('确定要删除bettercloudflareip吗？', '配置文件将不会保留！')
  await Plugins.Removefile(BCFI_PATH)
  return 0
}
const onRun = async () => {
  if (!(await checkConf())) return;
  const { singbox_nodes, runTime } = await bcfi();
  await Plugins.confirm('singbox节点', singbox_nodes);
  //复制文本
  await Plugins.ClipboardSetText(JSON.stringify(singbox_nodes, null, 2));
  await Plugins.message.success('已复制');
}

// const onRun = async () => {
//   Plugins.alert('本插件的配置如下：', Plugin)

// }

//工具方法 使用更新订阅时检查是否存在指定文件名
const checkFileName = async () => {
  if(Plugin.SUB_FNAMES.length === 0){
    await Plugins.alert(Plugin.name, '对本插件右键在配置插件中填入订阅文件名（不用填.json），填入后此订阅可以自动更新，若暂时不想添加则先取消<订阅更新时>')
    return false
  }
  return true
};
//检查subscription.path里有没有填入的订阅文件名
function checkSubFileInPath(a, b) {
  if (a.length === 0) {
    return false; 
  }
  return a.some(element => b.includes(element));
}
//指定文件更新订阅
const onSubscribe = async (proxies, subscription) => {
  if (!(await checkFileName())) return
  if ((await checkSubFileInPath(Plugin.SUB_FNAMES, subscription.path))) {
    console.log("bettercloudflareip 更新订阅");
    const { singbox_nodes, runTime } = await bcfi();
    console.log("恭喜！订阅成功！");
    Plugins.alert(Plugin.name, `恭喜！订阅${Plugin.IPV} ${Plugin.VLESS_NUM}个节点成功！\n完成! 总计用时${runTime} 秒`);
    return singbox_nodes;
  }else return proxies;

};
