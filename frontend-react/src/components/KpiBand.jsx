export default function KpiBand({ items }) {
  return (
    <section className="kpi-band" aria-label="Key performance indicators">
      {items.map((k, i) => (
        <div key={k.label} className={"kpi" + (i === 0 ? " lead" : "")}>
          <div className="label">{k.label}</div>
          <div className={"value" + (k.text ? " text" : "")}>{k.value}</div>
          <div className="meta">{k.meta || "\u00A0"}</div>
        </div>
      ))}
    </section>
  );
}
