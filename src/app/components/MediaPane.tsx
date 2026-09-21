import { rgba } from "../lib/color";

/**
 * MediaPane - an embedded page or PDF beside (desktop) or below (phone) the
 * text of a project. Always carries an "open" link because third-party embeds
 * (SharePoint, Google Slides, Earth Engine) sometimes refuse to render inside
 * an iframe, and PDF previews are unavailable on most phones.
 */
export function MediaPane({ kind, url, label, ink, narrow }: {
  kind: "iframe" | "pdf"; url: string; label: string; ink: string; narrow: boolean;
}) {
  return (
    <div style={{
      flex: narrow ? "none" : 1, minWidth: 0,
      height: narrow ? "min(65vh, 520px)" : "auto",
      borderRadius: "10px", overflow: "hidden",
      background: rgba(ink, 0.05), border: `1px solid ${rgba(ink, 0.12)}`,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: "0.4rem 0.7rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "0.5rem", borderBottom: `1px solid ${rgba(ink, 0.1)}`, flexShrink: 0,
      }}>
        <span style={{
          fontSize: "0.68rem", color: ink, opacity: 0.7, fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {label}
        </span>
        <a href={url} target="_blank" rel="noreferrer" style={{
          fontSize: "0.68rem", color: ink, textDecoration: "none", whiteSpace: "nowrap",
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600,
        }}>
          open in new tab ↗
        </a>
      </div>
      {kind === "iframe" ? (
        <iframe
          src={url}
          loading="lazy"
          style={{ flex: 1, width: "100%", border: "none", display: "block", background: "#fff" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"
          title={label}
        />
      ) : (
        <object data={url} type="application/pdf" style={{ flex: 1, width: "100%", border: "none", display: "block" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
            padding: "1rem", textAlign: "center", opacity: 0.7, fontSize: "0.85rem", color: ink,
          }}>
            <a href={url} target="_blank" rel="noreferrer" style={{ color: ink }}>
              open the PDF ↗
            </a>
          </div>
        </object>
      )}
    </div>
  );
}
