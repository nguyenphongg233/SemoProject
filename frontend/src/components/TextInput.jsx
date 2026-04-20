export default function TextInput({ label, error, hint, rightSlot, className = '', ...props }) {
    const hasSlot = Boolean(rightSlot)

    return (
        <label className={`field ${className}`.trim()}>
            {label ? (
                <span className="field__label">
          <span>{label}</span>
                    {hint ? <span className="field__hint">{hint}</span> : null}
        </span>
            ) : null}
            <span className="field__control">
        <input
            className={`field__input ${hasSlot ? 'field__input--with-slot' : ''}`.trim()}
            {...props}
        />
                {hasSlot ? <span className="field__slot">{rightSlot}</span> : null}
      </span>
            {error ? <span className="field__error">{error}</span> : null}
        </label>
    )
}
