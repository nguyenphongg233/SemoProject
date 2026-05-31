// Simple profile page placeholder for authenticated users.
import { Card } from '../../components/ui'
import { SectionHeader } from '../../components/layout'

export default function ProfilePage() {
  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Account"
        title="Profile"
        description="Your personal details and preferences will live here."
      />

      <Card>
        <p className="empty-state__title">Profile editor coming next.</p>
        <p className="empty-state__text">
          This page is ready for user details, password change, and wallet info.
        </p>
      </Card>
    </div>
  )
}