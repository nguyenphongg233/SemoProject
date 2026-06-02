// Reusable placeholder page for admin feature sections.
import { Card } from '../../components/ui'
import { SectionHeader } from '../../components/layout'

// 1. Định nghĩa cấu trúc (Type/Interface) cho các Props nhận vào
interface FeaturePageProps {
  eyebrow?: string      // Dấu ? nghĩa là không bắt buộc (optional)
  title: string         // Bắt buộc
  description: string   // Bắt buộc
}

// 2. Gán kiểu dữ liệu FeaturePageProps cho object chứa các thuộc tính được bóc tách
export default function FeaturePage({ eyebrow, title, description }: FeaturePageProps) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <Card>
        <p className="empty-state__title">Work in progress</p>
        <p className="empty-state__text">
          This screen is wired into the navigation and ready for table-based management UI.
        </p>
      </Card>
    </div>
  )
}