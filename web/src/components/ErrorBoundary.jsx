import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SIRAJ ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem("siraj_active_role");
      localStorage.removeItem("siraj_auth_user");
      localStorage.removeItem("siraj_audit_logs");
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "radial-gradient(ellipse at 50% 0%, #0A3D2E 0%, #05231A 50%, #02110C 100%)",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "rgba(6, 39, 30, 0.9)",
              border: "1px solid rgba(232, 182, 90, 0.4)",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🕌</div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#FFE49A", marginBottom: "8px" }}>
              SIRAJ System Recovery
            </h2>
            <p style={{ fontSize: "13px", color: "#A7F3D0", marginBottom: "16px", lineHeight: 1.5 }}>
              Terdeteksi penyesuaian sesi aplikasi. Klik tombol di bawah untuk memuat ulang sistem dengan aman.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#FCA5A5",
                  padding: "10px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "20px",
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                background: "linear-gradient(135deg, #065F46 0%, #10B981 100%)",
                border: "1px solid #FFE49A",
                color: "#FFFFFF",
                padding: "10px 24px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
              }}
            >
              🔄 Muat Ulang & Pulihkan Sesi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
