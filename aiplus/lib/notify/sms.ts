type SendSmsParams = {
  to: string;
  body: string;
};

export async function sendSms({ to, body }: SendSmsParams) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  // 開発環境では常にスキップ
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV] sendSms", { to, body });
    return;
  }

  if (!accountSid || !authToken || !from) {
    throw new Error("SMS送信設定が不足しています");
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const payload = new URLSearchParams({ From: from, To: to, Body: body });
  const basic = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`SMS送信に失敗しました: ${detail}`);
  }
}
