// Reusable placeholder page for admin feature sections.
import { Card } from '../../components/ui'
import { SectionHeader } from '../../components/layout'

export default function FeaturePage({ eyebrow, title, description }) {
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