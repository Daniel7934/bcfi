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
  await Plugins.usePluginsStore().reloadPlugin(Plugin.id);
  return 0
}
