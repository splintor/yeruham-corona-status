import Head from 'next/head'
import { promises as fs } from 'fs';
import path from 'path'
import React, { useEffect, useState } from 'react';
import GithubCorner from 'react-github-corner';

function fetchWithTimeout(url, timeout) { // https://stackoverflow.com/a/49857905/46635
  return Promise.race([
    fetch(url, { cache: 'no-cache' }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
  ]);
}

// noinspection JSUnusedGlobalSymbols
export async function getStaticProps() {
  const files = await fs.readdir(path.join(process.cwd(), 'public', 'images'))
  let ramzorData
  try {
    const ramzorResponse = await fetchWithTimeout('https://corona.health.gov.il/umbraco/surface/Traffic/AreaGetSuggestions/?culture=he-IL&query=%D7%99%D7%A8%D7%95%D7%97%D7%9D', 2000)
    const ramzorJson = await ramzorResponse.json()
    ramzorData = ramzorJson.suggestions[0] || {}
  } catch {
    ramzorData = {}
  }
  return { props: { files: files.sort().reverse(), ramzorData } }
}

function formatDate(d) {
  const date = new Date(d)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const pad = n => ('0' + n).substr(-2)

function formatDateAndTime(d) {
  const date = new Date(d)
  return date.getUTCHours() || date.getMinutes() ?
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}` :
    formatDate(d)
}

const DateLink = ({ date }) =>
  date ? <a href={`?date=${date}`}>{formatDate(date)}</a> : <span/>

// noinspection JSUnusedGlobalSymbols
export default function Home({ files, ramzorData }) {
  const [date, setDate] = useState();
  const [title, setTitle] = useState('סטטוס הקורונה בירוחם')
  // noinspection JSUnusedLocalSymbols
  const [showTests, setShowTests] = useState(true)

  const dates = files.map(f => f.replace(/\..+$/, ''))
  let dateIndex = date && dates.findIndex(d => d.startsWith(date));
  if (!dateIndex || dateIndex < 0) {
    dateIndex = 0
  }

  useEffect(() => {
    const dateParam = location.search.split(/[?&]/).map(p => p.split('=')).find(([key]) => key === 'date')
    if (dateParam) {
      setShowTests(dateParam[1] === dates[0])
      setDate(dateParam[1])
      setTitle(` סטטוס הקורונה בירוחם נכון לתאריך ${formatDateAndTime(dates[dateIndex])}`)
    } else {
      setDate(dates[0])
    }
  }, [])

  const prevDate = dateIndex < dates.length - 1 ? dates[dateIndex + 1] : null;
  const nextDate = dateIndex > 0 ? dates[dateIndex - 1] : null;
  const imagePath = `/images/${files[dateIndex]}`
  const ImageLink = props => <div><a href={props.src}><img alt={props.alt} {...props}/></a></div>

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} key="pageTitle"/>
        <meta property="og:url" content="https://yeruham-corona-status.now.sh" key="url"/>
        <meta property="og:image" content={`https://yeruham-corona-status.now.sh/logo.png`} key="image"/>
        <meta name="description" content="סטטוס הקורונה בירוחם - דף שמרכז את העדכונים על מספר החולים בקורונה בירוחם"
              key="description"/>
        <link rel="icon" href="/favicon.ico"/>
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-180152901-1"/>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || []
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date())
            gtag('config', 'UA-180152901-1')
          `,
          }}
        />
      </Head>

      <main>
        <GithubCorner href="https://github.com/splintor/yeruham-corona-status" size={40}
                      target="YerhuamCoronaStatusGitHubProject"/>
        <h1><a href="/">סטטוס הקורונה בירוחם</a></h1>
        {
          date ? <>
            <h3>נכון לתאריך <span
              className={'date' + (dateIndex > 0 ? ' past' : '')}>{formatDateAndTime(dates[dateIndex])}</span></h3>
            {showTests && ramzorData.data &&
            <h2>{ramzorData.value} <a href="https://corona.health.gov.il/ramzor/">{ramzorData.data.areaNameHE}</a></h2>}
            <nav>
              {prevDate && <span><DateLink date={prevDate}/>&nbsp;&#8658;</span>}
              {nextDate && <span>&#8656;&nbsp;<DateLink date={nextDate}/></span>}
            </nav>
            <div className="content">
              <ImageLink src={imagePath} alt="סטטוס הקורונה בירוחם"/>
            </div>

            <div className="description">
              הנתונים באתר מגיעים מרכזת הבריאות של המועצה ואמורים להיות מדויקים יותר מהנתונים שמתפרסמים ב<a
              href="https://datadashboard.health.gov.il/COVID-19/general">אתר משרד הבריאות</a> כיוון שבמועצה מעודכנים מי
              מהחולים באמת נמצא בירוחם ומי כבר החלים.
              <br/>
              באתר <a href="https://corona.health.gov.il/ramzor/">רמזור רשויות מקומיות</a> של משרד הבריאות אפשר לראות את
              הצבע הנוכחי של ירוחם ע"פ החלטות הקבינט המעודכנות.
              <br/>
              אפשר לראות <a href="https://lironcoil.wixsite.com/mysite-2">כאן</a> את רשימת המקומות שבהם שהו חולי קורונה
              בירוחם.
              <br/><b>
              האתר מתוחזק ע"י <a href="mailto:splintor@gmail.com">שמוליק פלינט</a> ואינו קשור ל<a
              href="https://www.facebook.com/מועצה-מקומית-ירוחם-1532181380387819">מועצה המקומית ירוחם</a>.
            </b>
            </div>
          </> : <h4>טוען...</h4>
        }
      </main>

      <style jsx>{`
        h1 {
          margin: 10px 0 0 0;
        }

        h1 a {
          text-decoration: none;
          color: black;
        }

        h2 {
          margin-block-end: 8px;
          margin-block-start: -10px;
          padding: 10px;
          background-color: ${ramzorData.data && ramzorData.data.colorHex || 'initial'}
        }

        .date {
          font-weight: bold;
        }

        .past.date {
          color: red;
        }

        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        nav {
          width: clamp(50vw, 400px, 100vw);
          display: flex;
          justify-content: space-around;
        }

        .content {
          text-align: center;
        }

        .content img {
          margin-block-start: 10px;
          margin-block-end: 5px;
          margin-inline-start: 15px;
          margin-inline-end: 15px;
          height: calc(100vh - 200px);
        }

        .description {
          width: clamp(35vw, 500px, 90vw);
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          direction: rtl;
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
          sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
