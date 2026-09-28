export default function Panel({ title, hint, controls, children, flush = false }) {
  return (
    <section className="panel" style={flush ? { margin: 0 } : undefined}>
      {(title || hint || controls) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          {hint && <div className="hint">{hint}</div>}
          {controls && <div className="controls">{controls}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
