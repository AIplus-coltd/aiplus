"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  from_user: string;
  to_user: string;
  text: string;
  created_at: string;
  read: boolean;
};

export default function InboxPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [ready, setReady] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const placeholderColor = backgroundColor === "light" ? "#777" : `${themeColor}cc`;

  useEffect(() => {
    const loadSettings = () => {
      // テーマ設定を取得
      const savedSettings = localStorage.getItem("appSettings");
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      const color = settings.themeColor || "pink";
      const bgColor = settings.backgroundColor || "dark";
      
      const themeMap: Record<string, string> = {
        pink: "#ff1493",
        blue: "#64b5f6",
        green: "#81c784",
        purple: "#9d4edd",
      };
      
      setThemeColor(themeMap[color] || "#ff1493");
      setBackgroundColor(bgColor);
    };

    const loadMessages = () => {
      // ローカルストレージからメッセージを取得
      const savedMessages = localStorage.getItem("messages");
      const msgs = savedMessages ? JSON.parse(savedMessages) : [];
      setMessages(msgs);
      setReady(true);
    };

    loadSettings();
    loadMessages();

    // カスタムイベント "themeChanged" をリッスンして設定変更を監視
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const color = customEvent.detail.themeColor || "pink";
        const bgColor = customEvent.detail.backgroundColor || "dark";
        
        const themeMap: Record<string, string> = {
          pink: "#ff1493",
          blue: "#64b5f6",
          green: "#81c784",
          purple: "#9d4edd",
        };
        
        setThemeColor(themeMap[color] || "#ff1493");
        setBackgroundColor(bgColor);
      }
    };
    
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const conversationUsers = Array.from(
    new Set(messages.map((m) => (m.from_user === "me" ? m.to_user : m.from_user)))
  );

  const selectedMessages = selectedUser
    ? messages
        .filter(
          (m) =>
            (m.from_user === "me" && m.to_user === selectedUser) ||
            (m.from_user === selectedUser && m.to_user === "me")
        )
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
    : [];

  const sendMessage = () => {
    if (!selectedUser || !messageText.trim()) return;

    const newMessage: Message = {
      id: "msg-" + Date.now() + Math.random().toString(36),
      from_user: "me",
      to_user: selectedUser,
      text: messageText,
      created_at: new Date().toISOString(),
      read: true,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    setMessageText("");
  };

  const sendNewMessage = () => {
    if (!newRecipient.trim() || !newMessageText.trim()) return;

    const newMessage: Message = {
      id: "msg-" + Date.now() + Math.random().toString(36),
      from_user: "me",
      to_user: newRecipient,
      text: newMessageText,
      created_at: new Date().toISOString(),
      read: true,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    setNewRecipient("");
    setNewMessageText("");
    setShowNewMessage(false);
    setSelectedUser(newRecipient);
  };

  const markAsRead = () => {
    const updatedMessages = messages.map((m) => {
      if (
        m.from_user === selectedUser &&
        m.to_user === "me" &&
        !m.read
      ) {
        return { ...m, read: true };
      }
      return m;
    });
    setMessages(updatedMessages);
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
  };

  useEffect(() => {
    if (selectedUser) {
      markAsRead();
    }
  }, [selectedUser]);

  const unreadCount = messages.filter((m) => !m.read && m.to_user === "me")
    .length;

  if (!ready) {
    return <div style={{ padding: 20, color: backgroundColor === "light" ? "#333" : "white" }}>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "radial-gradient(ellipse at 60% 10%, #10162a 0%, #050814 100%)",
        color: "#fff",
        overflow: "hidden",
        fontFamily: "var(--font-geist-sans, sans-serif)",
      }}
    >
      {/* 左側：会話リスト＋検索バー */}
      <div
        style={{
          width: 340,
          minWidth: 220,
          maxWidth: 400,
          borderRight: "1.5px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(17,24,39,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* 検索バー */}
        <div style={{ padding: "18px 18px 8px 18px", background: "none" }}>
          <input
            type="text"
            placeholder="ユーザー検索"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid #38BDF8",
              background: "#0B1020",
              color: "#fff",
              fontSize: 15,
              outline: "none",
              marginBottom: 2,
              boxShadow: "0 2px 8px #38BDF822",
            }}
            // 検索ロジックは省略（ダミー）
          />
        </div>
        {/* 会話リスト */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 8px 0" }}>
          {conversationUsers.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", opacity: 0.7 }}>メッセージはまだありません</div>
          ) : (
            conversationUsers.map((user) => {
              const lastMsg = messages
                .filter(
                  (m) =>
                    (m.from_user === user && m.to_user === "me") ||
                    (m.from_user === "me" && m.to_user === user)
                )
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              const unread = messages.some((m) => m.from_user === user && m.to_user === "me" && !m.read);
              return (
                <div
                  key={user}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    padding: "14px 18px 12px 18px",
                    borderBottom: "1.5px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    background: selectedUser === user ? "linear-gradient(90deg, #38BDF822, #A855F722)" : "none",
                    transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  {/* アバター */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #7C3AED, #38BDF8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      border: unread ? "2.5px solid #38BDF8" : "2px solid #23263a",
                      flexShrink: 0,
                      color: "#fff",
                      boxShadow: unread ? "0 0 12px #38BDF8cc" : "none",
                    }}
                  >
                    👤
                  </div>
                  {/* メッセージ情報 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: unread ? "#38BDF8" : "#fff" }}>{user}</div>
                      {lastMsg && (
                        <div style={{ fontSize: 11, opacity: 0.6 }}>
                          {new Date(lastMsg.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        opacity: unread ? 0.9 : 0.6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: unread ? "#b8a3d9" : "#9d8ab8",
                      }}
                    >
                      {lastMsg?.from_user === "me" ? "You: " : ""}
                      {lastMsg?.text}
                    </div>
                  </div>

                  {/* 未読バッジ */}
                  {unread && (
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #9d4edd, #7b2cbf)",
                        boxShadow: "0 0 12px rgba(157,78,221,.8)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* チャットエリア（右側） */}
      {selectedUser ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              padding: "12px 16px",
              background: `linear-gradient(180deg, rgba(26,10,40,.98) 0%, ${themeColor}12)`,
              backdropFilter: "blur(20px) saturate(180%)",
              borderBottom: `1px solid ${themeColor}26`,
              boxShadow: `0 2px 16px ${themeColor}33`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#9d4edd",
                cursor: "pointer",
                fontSize: 20,
                padding: 4,
              }}
            >
              ←
            </button>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #9d4edd, #7b2cbf)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                border: "2px solid rgba(157,78,221,.3)",
              }}
            >
              👤
            </div>
            <div style={{ fontSize: 16, fontWeight: "600", color: "#c77dff" }}>
              {selectedUser}
            </div>
          </div>

          {/* メッセージリスト */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {selectedMessages.length === 0 ? (
              <div style={{ opacity: 0.6, textAlign: "center", marginTop: 20, color: "#9d8ab8" }}>
                Start a conversation...
              </div>
            ) : (
              selectedMessages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: m.from_user === "me" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "10px 14px",
                      borderRadius: 16,
                      background:
                        m.from_user === "me"
                          ? "linear-gradient(135deg, rgba(157,78,221,.8), rgba(199,125,255,.7))"
                          : "linear-gradient(135deg, rgba(26,10,40,.9), rgba(20,5,35,.85))",
                      border: m.from_user === "me" ? "1px solid rgba(199,125,255,.4)" : "1px solid rgba(157,78,221,.25)",
                      boxShadow: m.from_user === "me" ? "0 0 16px rgba(157,78,221,.3)" : "0 2px 8px rgba(0,0,0,.3)",
                      wordWrap: "break-word",
                      fontSize: 14,
                      lineHeight: "1.5",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 入力エリア */}
          <div
            style={{
              padding: 12,
              borderTop: backgroundColor === "light" ? "1px solid rgba(0,0,0,.08)" : `1px solid ${themeColor}26`,
              background: backgroundColor === "light" ? "#ffffff" : "rgba(26,10,40,.7)",
              boxShadow: backgroundColor === "light" ? "0 -4px 14px rgba(0,0,0,.06)" : `0 -4px 14px ${themeColor}1f`,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Send here..."
                className="inbox-input"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 24,
                  border: backgroundColor === "light" ? `1px solid ${themeColor}55` : `1px solid ${themeColor}80`,
                  background: backgroundColor === "light"
                    ? `linear-gradient(135deg, #ffffff, ${themeColor}10)`
                    : `linear-gradient(135deg, ${themeColor}33, ${themeColor}1a)`,
                  backdropFilter: "blur(12px)",
                  color: backgroundColor === "light" ? "#333" : "#e0cffc",
                  caretColor: themeColor,
                  outline: "none",
                  fontSize: 14,
                  boxShadow: backgroundColor === "light"
                    ? "inset 0 2px 6px rgba(0,0,0,.05)"
                    : "inset 0 2px 6px rgba(0,0,0,.3)",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "10px 20px",
                  borderRadius: 24,
                  border: "none",
                  background: `linear-gradient(135deg, ${themeColor}b3, ${themeColor}80)`,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: `0 0 16px ${themeColor}44`,
                  transition: "all 0.3s ease",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
          }}
        >
          メッセージを選択してください
        </div>
      )}

      {/* 新規メッセージモーダル */}
      {showNewMessage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 400,
          }}
          onClick={() => setShowNewMessage(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: 500,
              padding: 24,
              borderRadius: 20,
              background: backgroundColor === "light"
                ? `linear-gradient(135deg, #ffffff, ${themeColor}0f)`
                : `linear-gradient(135deg, ${themeColor}26, ${themeColor}14)`,
              backdropFilter: "blur(24px) saturate(180%)",
              border: backgroundColor === "light" ? `1px solid ${themeColor}33` : `1px solid ${themeColor}55`,
              boxShadow: backgroundColor === "light"
                ? "0 12px 48px rgba(0,0,0,.12), 0 0 40px rgba(0,0,0,.08)"
                : `0 8px 40px rgba(0,0,0,.6), 0 0 60px ${themeColor}33`,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 20,
                color: themeColor,
                letterSpacing: "0.02em",
              }}
            >
              New Message
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "#9d8ab8", fontWeight: "600" }}>
                To
              </label>
              <input
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="username"
                className="inbox-input"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: backgroundColor === "light" ? `1px solid ${themeColor}55` : `1px solid ${themeColor}80`,
                  background: backgroundColor === "light"
                    ? `linear-gradient(135deg, #ffffff, ${themeColor}10)`
                    : `linear-gradient(135deg, ${themeColor}33, ${themeColor}1a)`,
                  backdropFilter: "blur(8px)",
                  color: backgroundColor === "light" ? "#333" : "#e0cffc",
                  caretColor: themeColor,
                  outline: "none",
                  fontSize: 14,
                  boxShadow: backgroundColor === "light"
                    ? "inset 0 2px 6px rgba(0,0,0,.05)"
                    : "inset 0 2px 6px rgba(0,0,0,.3)",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "#9d8ab8", fontWeight: "600" }}>
                Message
              </label>
              <textarea
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your message..."
                className="inbox-textarea"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: backgroundColor === "light" ? `1px solid ${themeColor}55` : `1px solid ${themeColor}80`,
                  background: backgroundColor === "light"
                    ? `linear-gradient(135deg, #ffffff, ${themeColor}10)`
                    : `linear-gradient(135deg, ${themeColor}33, ${themeColor}1a)`,
                  backdropFilter: "blur(8px)",
                  color: backgroundColor === "light" ? "#333" : "#e0cffc",
                  caretColor: themeColor,
                  outline: "none",
                  fontSize: 14,
                  minHeight: 100,
                  resize: "vertical",
                  boxShadow: backgroundColor === "light"
                    ? "inset 0 2px 6px rgba(0,0,0,.05)"
                    : "inset 0 2px 6px rgba(0,0,0,.3)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowNewMessage(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: backgroundColor === "light" ? `1px solid ${themeColor}33` : `1px solid ${themeColor}2b`,
                  background: backgroundColor === "light" ? "#f7f7f7" : `linear-gradient(135deg, ${themeColor}10, ${themeColor}05)`,
                  color: backgroundColor === "light" ? "#555" : `${themeColor}cc`,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "600",
                  boxShadow: backgroundColor === "light" ? "0 4px 12px rgba(0,0,0,.05)" : `0 4px 12px ${themeColor}1f`,
                  transition: "all 0.3s ease",
                }}
              >
                Cancel
              </button>
              <button
                onClick={sendNewMessage}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg, ${themeColor}b3, ${themeColor}80)`
                  ,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: `0 0 20px ${themeColor}44`,
                  transition: "all 0.3s ease",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .inbox-input::placeholder,
        .inbox-textarea::placeholder {
          color: ${placeholderColor};
        }
      `}</style>
    </div>
  );
}
