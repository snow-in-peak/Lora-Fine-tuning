const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const clearBtn = document.getElementById("clearBtn");
const sessionIdInput = document.getElementById("sessionId");
const statusBox = document.getElementById("status");

function addMessage(role, text) {
  const item = document.createElement("div");
  item.className = `msg ${role}`;

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = role === "user" ? "你" : "乔峰";

  const content = document.createElement("div");
  content.className = "content";
  content.textContent = text;

  item.appendChild(name);
  item.appendChild(content);
  chatBox.appendChild(item);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function checkHealth() {
  try {
    const resp = await fetch("/api/health");
    const data = await resp.json();
    if (data.ok) {
      statusBox.textContent = `本地后端正常，远程目标：${data.remote_host}:${data.remote_port}`;
      statusBox.className = "status ok";
    } else {
      statusBox.textContent = "状态异常";
      statusBox.className = "status err";
    }
  } catch (e) {
    statusBox.textContent = "本地后端未启动";
    statusBox.className = "status err";
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  const session_id = sessionIdInput.value.trim() || "web_user";

  if (!message) return;

  addMessage("user", message);
  messageInput.value = "";
  statusBox.textContent = "正在请求远程模型服务...";
  statusBox.className = "status";

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ session_id, message })
    });

    const data = await resp.json();
    if (data.ok) {
      addMessage("assistant", data.reply || "无返回内容");
      statusBox.textContent = "回复成功";
      statusBox.className = "status ok";
    } else {
      addMessage("assistant", `请求失败：${data.error || "未知错误"}`);
      statusBox.textContent = "请求失败";
      statusBox.className = "status err";
    }
  } catch (e) {
    addMessage("assistant", `连接失败：${e.message}`);
    statusBox.textContent = "连接失败";
    statusBox.className = "status err";
  }
});

clearBtn.addEventListener("click", async () => {
  const session_id = sessionIdInput.value.trim() || "web_user";

  try {
    const resp = await fetch("/api/clear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ session_id })
    });
    const data = await resp.json();

    if (data.ok) {
      chatBox.innerHTML = "";
      statusBox.textContent = "历史已清空";
      statusBox.className = "status ok";
    } else {
      statusBox.textContent = `清空失败：${data.error || "未知错误"}`;
      statusBox.className = "status err";
    }
  } catch (e) {
    statusBox.textContent = `清空失败：${e.message}`;
    statusBox.className = "status err";
  }
});

checkHealth();
