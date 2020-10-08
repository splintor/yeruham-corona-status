import Head from 'next/head'
import getConfig from 'next/config'
import fs from 'fs'
import path from 'path'
import React from 'react';

export const getServerSideProps = async ({ query }) => {
  const files = fs.readdirSync(path.join(process.cwd(), 'images'))
  return {
    props: {
      dates: files.map(f => f.replace('.jpeg', '')).sort().reverse(),
      date: query && query.date || null,
    },
  }
}

const DateLink = ({date}) =>
  date ? <a href={`?date=${date}`}>{new Date(date).toLocaleDateString()}</a> : <span/>

export default function Home({ date: dateParam, dates }) {
  const date = dateParam || dates[0];
  const dateIndex = dates.indexOf(date)
  let title = 'סטטוס הקורונה בירוחם'
  if (dateParam) {
    title += ` נכון לתאריך ${new Date(date).toLocaleDateString()}`
  }

  const prevDate = dateIndex !== -1 && dateIndex < dates.length - 1 ? dates[dateIndex + 1] : null;
  const nextDate = dateIndex > 0 ? dates[dateIndex - 1] : null;

  const imagePath = `/images/${date}.jpeg`

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1><a href="/">סטטוס הקורונה בירוחם</a></h1>
        <h3>נכון לתאריך <span className={'date' + (dateIndex > 0 ? ' past' : '')}>{new Date(date).toLocaleString()}</span></h3>
        <nav>
          {prevDate && <span><DateLink date={prevDate}/>&nbsp;&#8658;</span>}
          {nextDate && <span>&#8656;&nbsp;<DateLink date={nextDate}/></span>}
        </nav>
        <div className="content">
          <img src={imagePath} />
        </div>

        <div className="description">
          הנתונים באתר מגיעים מרכזת הבריאות של המועצה ואמורים להיות מדויקים יותר מהנתונים שמתפרסמים ב<a href="https://datadashboard.health.gov.il/COVID-19/general">אתר משרד הבריאות</a> כיוון שבמועצה מעודכנים מי מהחולים באמת נמצא בירוחם ומי כבר החלים.
          <br/>
          אפשר לראות <a href="https://lironcoil.wixsite.com/mysite-2">כאן</a> את רשימת המקומות שבהם שהו חולי קורונה בירוחם.
        </div>
      </main>

      <style jsx>{`
        h1 { margin: 10px 0 0 0; }}
        h1 a {
          text-decoration: none;
          color: black;
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
          justify-content: center;
          align-items: center;
        }
        
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        nav {
          width: clamp(50vw, 400px, 100vw);
          display: flex;
          justify-content: space-around;
        }
        
        .description {
          width: clamp(35vw, 500px, 90vw);
        }
        
        main img {
          margin-block-start: 5px;
          height: calc(100vh - 240px);
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