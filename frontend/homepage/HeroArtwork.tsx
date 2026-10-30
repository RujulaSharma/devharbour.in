export default function HeroArtwork(){return <svg className="harbour-scene" viewBox="0 0 660 600" role="img" aria-label="A sculptural lavender harbour, with an open arch and connected learning and building platforms">
 <defs>
  <linearGradient id="arch-front" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e7d7fa"/><stop offset=".45" stopColor="#b99bd9"/><stop offset="1" stopColor="#7953a2"/></linearGradient>
  <linearGradient id="arch-side" x2="1" y2="1"><stop stopColor="#9672bb"/><stop offset="1" stopColor="#45296a"/></linearGradient>
  <linearGradient id="floor" x2="1" y2="1"><stop stopColor="#f2ebfa"/><stop offset="1" stopColor="#c8b3dd"/></linearGradient>
  <linearGradient id="portal" x2="0" y2="1"><stop stopColor="#4a2c69"/><stop offset="1" stopColor="#1f1729"/></linearGradient>
  <radialGradient id="art-shadow"><stop stopColor="#6b467e" stopOpacity=".25"/><stop offset="1" stopColor="#6b467e" stopOpacity="0"/></radialGradient>
 </defs>
 <ellipse cx="340" cy="505" rx="295" ry="78" fill="url(#art-shadow)"/>
 <g className="scene-grid" fill="none" stroke="#9d83b4" strokeWidth=".7" opacity=".25"><path d="M20 385 340 565 640 390M60 360 380 540M110 335 430 515M160 310 480 490M210 285 530 465M260 260 580 440M60 410 360 235M110 435 410 260M160 460 460 285M210 485 510 310M260 510 560 335M310 535 610 360"/></g>
 <g className="orbit-back" fill="none" stroke="#9875b4" strokeWidth="1"><ellipse cx="338" cy="300" rx="260" ry="140" transform="rotate(-24 338 300)"/><ellipse cx="338" cy="300" rx="220" ry="190" transform="rotate(-24 338 300)" strokeDasharray="2 9" opacity=".5"/></g>
 <g className="main-sculpture">
  <path d="m195 425 147-86 157 90-149 88Z" fill="url(#floor)" stroke="#e7d8f4"/><path d="m195 425 155 91v24l-155-90Z" fill="#b69bce"/><path d="m350 516 149-87v25l-149 86Z" fill="#9373ad"/>
  <path d="M263 415V244c0-106 139-169 207-111l-36 24c-59-47-136 8-136 84v152Z" fill="url(#arch-side)"/>
  <path d="M235 400V232c0-104 145-169 207-106v207l-54 32V219c0-54-94-21-94 43v172Z" fill="url(#arch-front)"/>
  <path d="M294 434V262c0-64 94-97 94-43v146Z" fill="url(#portal)"/>
  <path d="M247 397V234c0-87 121-145 182-100" stroke="#f2e6fc" strokeWidth="2" opacity=".8" fill="none"/>
  <path d="m294 434 94-69 28 15-95 70Z" fill="#cab5df"/>
  <path d="m312 415 23-14m-11 26 23-14m-10 27 23-14" stroke="#f2e4fc" strokeWidth="2"/>
  <g className="portal-symbol" stroke="#e4caff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m326 264-16 21 16 8m35-49 16 9-16 26m-17-34-4 49"/></g>
 </g>
 <g className="island island-learn"><path d="m55 338 72-42 79 45-73 43Z" fill="#e8dcf4"/><path d="m55 338 78 46v14l-78-45Z" fill="#bba2d0"/><path d="m133 384 73-43v14l-73 43Z" fill="#9476b0"/><path d="m107 314 22 12v34l-22-12Zm22 12 22-13v34l-22 13" fill="#58337e" stroke="#d2b9e4" strokeWidth="1.5"/><text x="67" y="419">01 / LEARN</text></g>
 <g className="island island-build"><path d="m475 305 68-39 75 43-68 40Z" fill="#ddcbea"/><path d="m475 305 75 44v15l-75-43Z" fill="#ac8ec6"/><path d="m550 349 68-40v15l-68 40Z" fill="#775497"/><path d="m523 280 24-14 24 14-24 15Zm0 0v27l24 14v-26m24-15v27l-24 14" fill="#68418d" stroke="#ebdcf8" strokeWidth="1.4"/><text x="495" y="386">02 / BUILD</text></g>
 <g className="island island-ship"><path d="m385 480 62-37 69 40-63 37Z" fill="#e7d9f3"/><path d="m385 480 68 40v12l-68-39Z" fill="#b293ca"/><path d="m453 520 63-37v12l-63 37Z" fill="#87629f"/><path d="m433 467 26-17-8 30-6-10-12-3Z" fill="#58317d" stroke="#f2e6fc"/><text x="420" y="555">03 / SHARE</text></g>
 <g fill="none" stroke="#8760a5" strokeWidth="1.5" strokeDasharray="5 7" className="connection-path"><path d="M155 375Q175 421 239 432M443 420Q502 422 540 351M348 513Q370 543 410 519"/></g>
 <g className="orbit-spark"><circle cx="142" cy="168" r="12" fill="#67408c"/><circle cx="142" cy="168" r="4" fill="#e9d8fa"/></g>
 <g className="orbit-plus" stroke="#785093" strokeWidth="2"><path d="M535 152v18m-9-9h18M85 456v12m-6-6h12"/></g>
 <path d="m173 100 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#a586c0"/>
</svg>}
