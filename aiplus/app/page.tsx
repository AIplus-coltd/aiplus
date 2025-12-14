export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>AI+</h1>

      <p style={{ opacity: 0.8 }}>
        AIが次の主役を生み出す、次世代ショート動画プラットフォーム
      </p>

      <button
        style={{
          marginTop: "2rem",
          padding: "12px 24px",
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        今すぐ始める
      </button>
    </main>
  );
};