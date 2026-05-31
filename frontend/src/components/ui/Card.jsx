// Elevated surface container used for forms and content panels.
export default function Card({ children, className = '' }) {
  return <section className={`ui-card ${className}`.trim()}>{children}</section>
}