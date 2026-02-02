"use client";
import React, { useState } from "react";

const mockMails = [
  { id: 1, from: "info@example.com", subject: "ようこそ！", body: "AI+へようこそ。ご利用ありがとうございます。", date: "2026/01/31" },
  { id: 2, from: "support@example.com", subject: "サポートからのお知らせ", body: "ご質問があればお気軽にご連絡ください。", date: "2026/01/30" },
];

export default function MailPage() {
  const [selected, setSelected] = useState<number|null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8f8f8" }}>
      {/* メールリスト */}
      <div style={{ width: 280, borderRight: "1px solid #ddd", background: "#fff", overflowY: "auto", position: "relative" }}>
        <h2 style={{ margin: 0, padding: 16, fontSize: 18, borderBottom: "1px solid #eee", color: "#222" }}>受信トレイ</h2>
        <button
          onClick={() => { setShowCompose(true); setSent(false); setTo(""); setSubject(""); setBody(""); }}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 2px 8px #2563eb22"
          }}
        >新規作成</button>
        <div style={{ marginTop: 48 }}>
        {mockMails.map(mail => (
          <div key={mail.id} onClick={() => setSelected(mail.id)}
            style={{
              padding: 16,
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              background: selected === mail.id ? "#dbeafe" : undefined,
              color: selected === mail.id ? "#1e293b" : "#222"
            }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{mail.subject}</div>
            <div style={{ fontSize: 13, color: selected === mail.id ? "#2563eb" : "#555" }}>{mail.from}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{mail.date}</div>
          </div>
        ))}
        </div>
      </div>
      {/* メール本文 */}
      <div style={{ flex: 1, padding: 32, background: "#f8f8f8" }}>
        {selected ? (
          <>
            <h3 style={{ color: "#1e293b", fontSize: 20 }}>{mockMails.find(m => m.id === selected)?.subject}</h3>
            <div style={{ color: "#2563eb", marginBottom: 8, fontWeight: 500 }}>
              from: {mockMails.find(m => m.id === selected)?.from}
            </div>
            <div style={{ color: "#666", marginBottom: 16, fontSize: 13 }}>
              {mockMails.find(m => m.id === selected)?.date}
            </div>
            <div style={{ fontSize: 16, color: "#222", lineHeight: 1.7 }}>
              {mockMails.find(m => m.id === selected)?.body}
            </div>
          </>
        ) : (
          <div style={{ color: "#888" }}>メールを選択してください</div>
        )}
      </div>
      {/* 新規メール作成ダイアログ */}
      {showCompose && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#0008", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 32, minWidth: 320, boxShadow: "0 4px 32px #0003" }}>
            <h2 style={{ marginTop: 0, color: "#2563eb" }}>新規メール作成</h2>
            {sent ? (
              <div style={{ color: "#2563eb", fontWeight: 600, fontSize: 18, textAlign: "center", margin: 24 }}>送信しました！</div>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>宛先 <span style={{ color: '#888', fontSize: 12 }}>(メールを送りたい相手のメールアドレス)</span></div>
                  <input value={to} onChange={e => setTo(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} placeholder="example@email.com" />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>件名 <span style={{ color: '#888', fontSize: 12 }}>(メールのタイトル)</span></div>
                  <input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} placeholder="件名" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>本文 <span style={{ color: '#888', fontSize: 12 }}>(メールの内容)</span></div>
                  <textarea value={body} onChange={e => setBody(e.target.value)} style={{ width: "100%", minHeight: 80, padding: 8, borderRadius: 4, border: "1px solid #ccc" }} placeholder="本文" />
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowCompose(false)} style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#eee", color: "#333", fontWeight: 600, cursor: "pointer" }}>キャンセル</button>
                  <button onClick={() => setSent(true)} style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}>送信</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
