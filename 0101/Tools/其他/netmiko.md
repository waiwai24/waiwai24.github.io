# netmiko

简化了通过 SSH 连接不同厂商（Cisco, Huawei, Juniper, Arista 等）网络设备的过程，自动处理了诸如“等待提示符”、“处理翻页”等繁琐的细节

要使用 Netmiko，我们需要引入核心类 ConnectHandler。然后，我们需要创建一个字典 (Dictionary) 来存储设备的信息



基本的设备连接：

```python
from netmiko import ConnectHandler

cisco_router = {
    'device_type': 'cisco_ios',
    'host': '192.168.1.1',
    'username': 'admin',
    'password': 'secret_password',
}

net_connect = ConnectHandler(**cisco_router)
```

设备交互：

```python
只读查询：传入一个字符串
output = net_connect.send_command('show version')

配置修改：传入一个命令列表 (List)，自动处理 conf t 和 end
net_connect.send_config_set(['int f0/0', 'shutdown'])
```

解析：send_command 使用参数 use_textfsm = True，将原本的字符串返回结果修改成列表放回结果