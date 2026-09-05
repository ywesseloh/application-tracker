import './LegalDocument.css'

type LegalDocumentProps = {
  html: string
}

export default function LegalDocument({ html }: LegalDocumentProps) {
  return (
    <main className="legal-document">
      <article className="legal-document__content">
        <div
          className="legal-document__body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  )
}
