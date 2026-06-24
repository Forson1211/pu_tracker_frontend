import "./globals.css";

export const metadata = {
  title: "PU Academic Performance Tracker",
  description: "AI-powered academic risk prediction for Pentecost University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif",
                     background: "#0a0e17", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
