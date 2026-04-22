#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import socket
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

REMOTE_HOST = "43.167.172.63"
REMOTE_PORT = 9000
SOCKET_TIMEOUT = 120

app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="/static")


def send_socket_message(payload: dict) -> dict:
    sock = socket.create_connection((REMOTE_HOST, REMOTE_PORT), timeout=SOCKET_TIMEOUT)
    reader = sock.makefile("r", encoding="utf-8")
    writer = sock.makefile("w", encoding="utf-8")
    try:
        # 读取欢迎消息
        welcome = reader.readline()

        writer.write(json.dumps(payload, ensure_ascii=False) + "\n")
        writer.flush()

        line = reader.readline()
        if not line:
            raise RuntimeError("远程模型服务没有返回数据")
        return json.loads(line)
    finally:
        try:
            writer.close()
        except Exception:
            pass
        try:
            reader.close()
        except Exception:
            pass
        try:
            sock.close()
        except Exception:
            pass


@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "local_backend": "running",
        "remote_host": REMOTE_HOST,
        "remote_port": REMOTE_PORT
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    session_id = str(data.get("session_id", "web_user")).strip() or "web_user"

    if not message:
        return jsonify({"ok": False, "error": "message 不能为空"}), 400

    payload = {
        "command": "chat",
        "session_id": session_id,
        "message": message
    }

    try:
        result = send_socket_message(payload)
        return jsonify(result)
    except Exception as e:
        return jsonify({"ok": False, "error": f"连接远程模型服务失败: {e}"}), 500


@app.route("/api/clear", methods=["POST"])
def clear():
    data = request.get_json(silent=True) or {}
    session_id = str(data.get("session_id", "web_user")).strip() or "web_user"

    payload = {
        "command": "clear",
        "session_id": session_id
    }

    try:
        result = send_socket_message(payload)
        return jsonify(result)
    except Exception as e:
        return jsonify({"ok": False, "error": f"清空失败: {e}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
