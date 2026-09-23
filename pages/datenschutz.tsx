import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Legal.module.css'

export default function Datenschutz() {
  return (
    <>
      <Head>
        <title>Datenschutzerklärung — DEASY</title>
      </Head>
      <main className={styles.container}>
        <Link href="/" className={styles.back}>← Zurück zur Startseite</Link>
        <h1>Datenschutzerklärung</h1>

        <div className={styles.warning}>
          <strong>⚠️ Platzhalter — vor dem echten Launch von einem Anwalt/einer Anwältin prüfen lassen.</strong>
          <p>Dieser Text ist ein Ausgangspunkt, kein rechtsgültiges Dokument. Da DEASY Dokumente mit potenziell sensiblen personenbezogenen Daten verarbeitet, ist eine echte DSGVO-Prüfung vor dem öffentlichen Launch besonders wichtig.</p>
        </div>

        <h2>1. Verantwortlicher</h2>
        <p>[Name, Anschrift und Kontaktdaten des Verantwortlichen einfügen]</p>

        <h2>2. Verarbeitung hochgeladener Dokumente</h2>
        <p>
          Wenn du ein Dokument zur Analyse hochlädst, wird der Inhalt einmalig an unseren
          KI-Anbieter <strong>Anthropic</strong> (Anthropic PBC bzw. Anthropic Ireland, je nach
          Vertragskonstellation) zur Auswertung übermittelt. Das Dokument wird nicht dauerhaft in
          unserer eigenen Datenbank gespeichert. [Bitte prüfen: tatsächliche Speicherdauer bei
          Anthropic, Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO abschließen, ggf.
          Standardvertragsklauseln bei Datenübermittlung in Drittländer.]
        </p>

        <h2>3. Rechtsgrundlage</h2>
        <p>
          Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
          bzw. zur Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).
        </p>

        <h2>4. Speicherdauer</h2>
        <p>[Konkrete Fristen einfügen, sobald Account-/Case-Speicherung implementiert ist.]</p>

        <h2>5. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit und Widerspruch gemäß Art. 15–21 DSGVO. Wende dich dazu an
          [Kontakt-E-Mail].
        </p>

        <h2>6. Cookies &amp; Analyse-Tools</h2>
        <p>[Hier auflisten, sobald Analytics wie PostHog/Plausible eingebunden werden, inkl. Cookie-Banner falls nötig.]</p>

        <h2>7. Beschwerderecht</h2>
        <p>
          Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren, z. B. bei der
          für dich zuständigen Landesdatenschutzbehörde.
        </p>
      </main>
    </>
  )
}
