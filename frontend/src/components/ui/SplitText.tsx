
export default function SplitText({
  text,
  className = '',
  delay = 50,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const words = text.split(' ')

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDuration: '600ms', animationDelay: `${i * delay}ms` }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  )
}
