import { SearchX } from 'lucide-react'
import EmptyState from './EmptyState'
import ScooterCard from './ScooterCard'

export default function ScooterList({ scooters, selectedScooterId, onSelect }) {
    if (!scooters.length) {
        return (
            <EmptyState
                icon={SearchX}
                title="Không có xe phù hợp"
                description="Hãy nới bộ lọc hoặc đổi từ khóa tìm kiếm để thấy thêm xe gần bạn."
            />
        )
    }

    return (
        <div className="scooter-list">
            {scooters.map((scooter) => (
                <ScooterCard
                    key={scooter.id}
                    scooter={scooter}
                    selected={selectedScooterId === scooter.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}
