export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)" }}>
      <div style={{ maxWidth: 430, margin: "0 auto", paddingBottom: 86 }}>
        {children}
      </div>
    </div>
  );
}
