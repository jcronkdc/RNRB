import Link from "next/link";

// eslint-disable-next-line import/no-default-export
export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>CronkWaters</h1>
      <p style={{ fontSize: "24px", marginBottom: "40px" }}>
        Collaborative Music Creation Platform
      </p>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link
          href="/auth"
          style={{
            padding: "12px 24px",
            backgroundColor: "#8b5cf6",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Sign In
        </Link>
        <Link
          href="/projects"
          style={{
            padding: "12px 24px",
            border: "2px solid #8b5cf6",
            color: "#8b5cf6",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          View Projects
        </Link>
      </div>
      <hr style={{ margin: "40px 0", width: "100%", maxWidth: "400px" }} />
      <p>Debug Info:</p>
      <ul style={{ textAlign: "left" }}>
        <li>Environment: {process.env.NODE_ENV || "not set"}</li>
        <li>Deployment: {process.env.VERCEL ? "Vercel" : "Local"}</li>
        <li>Time: {new Date().toISOString()}</li>
      </ul>
    </div>
  );
}

export const dynamic = "force-dynamic";
