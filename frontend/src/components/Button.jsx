export default function Button({
                                   children,
                                   variant = 'primary',
                                   size = 'md',
                                   block = false,
                                   loading = false,
                                   icon: Icon,
                                   className = '',
                                   ...props
                               }) {
    return (
        <button
            className={[
                'btn',
                `btn--${variant}`,
                size === 'sm' ? 'btn--sm' : '',
                block ? 'btn--block' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? 'Đang xử lý...' : (
                <>
                    {Icon ? <Icon size={18} /> : null}
                    <span>{children}</span>
                </>
            )}
        </button>
    )
}
