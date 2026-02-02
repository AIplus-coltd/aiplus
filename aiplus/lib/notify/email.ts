type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  // 開発環境では常にスキップ
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV] sendEmail", { to, subject });
    return;
  }

  if (!apiKey || !from) {
    throw new Error("メール送信設定が不足しています");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`メール送信に失敗しました: ${detail}`);
  }
}
