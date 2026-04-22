# 本地前端 + 本地后端 + 连接服务器 36000

这个项目适合 Ubuntu 本地运行。

## 你现在在干什么
你的本地项目分成两层：

1. 前端页面  
   浏览器里输入问题、看回复。

2. 本地后端  
   接收前端请求，再通过 TCP socket 连接你的服务器：
   `43.167.172.63:36000`

远程服务器负责真正运行乔峰模型。

---

## 项目结构
```text
qiaofeng_local_app_ubuntu/
├── app.py
├── requirements.txt
├── run.sh
├── README.txt
└── static/
    ├── index.html
    ├── app.js
    └── style.css
```

---

## Ubuntu 启动方法

### 1. 进入目录
```bash
cd qiaofeng_local_app_ubuntu
```

### 2. 一键启动
```bash
chmod +x run.sh
./run.sh
```

### 3. 浏览器打开
```text
http://127.0.0.1:8080
```

---

## 你的前后端关系
链路是：

```text
浏览器前端 -> 本地 Flask 后端 -> 43.167.172.63:36000 -> 远程乔峰模型
```

不是本地监听服务器端口。  
而是本地后端主动连接服务器的 `36000`。

---

## 前提条件
你服务器上必须已经启动 socket 服务，并且监听：

```text
0.0.0.0:36000
```

如果服务器没启动，这个本地项目也连不上。

---

## 如果你要改服务器 IP 或端口
改 `app.py` 里的这两行：

```python
REMOTE_HOST = "43.167.172.63"
REMOTE_PORT = 36000
```
