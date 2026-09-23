import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Legal.module.css'

export default function Impressum() {
  return (
    <>
      <Head>
        <title>Impressum — DEASY</title>
      </Head>
      <main className={styles.container}>
        <Link href="/" className={styles.back}>← Zurück zur Startseite</Link>
        <h1>Impressum</h1>

        <div className={styles.warning}>
          <strong>⚠️ Platzhalter — vor dem echten Launch ausfüllen.</strong>
          <p>Ein Impressum ist in Deutschland für jede geschäftsmäßige Website gesetzlich vorgeschrieben (§ 5 Telemediengesetz / TMG). Bitte ersetze die Felder unten mit den echten Angaben, bevor die Seite öffentlich online geht.</p>
        </div>

        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          [Vor- und Nachname bzw. Firmenname]<br />
          [Straße und Hausnummer]<br />
          [PLZ und Ort]<br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: [Telefonnummer]<br />
          E-Mail: [E-Mail-Adresse]
        </p>

        <h2>Umsatzsteuer-ID</h2>
        <p>[Falls vorhanden: Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz]</p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>[Name und Anschrift der verantwortlichen Person]</p>

        <h2>Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener"> https://ec.europa.eu/consumers/odr/</a>.
          Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen. [Bitte rechtlich prüfen und ggf. anpassen.]
        </p>
      </main>
    </>
  )
}
