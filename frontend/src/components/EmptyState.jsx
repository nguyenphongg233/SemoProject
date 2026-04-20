export default function EmptyState({ icon, title, description, action }) {
    const Icon = icon

    return (
        <div className="empty-state">
            <div className="empty-state__icon">{Icon ? <Icon size={26} /> : null}</div>
            <div>
                <strong>{title}</strong>
                <p>{description}</p>
            </div>
            {action}
        </div>
    )
}
