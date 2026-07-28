import type { Application } from '@/features/applications/model/types'

export default function TilePreview({ application }: { application: Application }) {
  return (
    <article className="application-tile application-tile--overlay">
      <h3 className="application-tile__company">{application.company}</h3>
      <p className="application-tile__role">{application.role}</p>
    </article>
  )
}
