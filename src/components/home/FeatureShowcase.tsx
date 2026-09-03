"use client";

import { useEffect, useRef } from "react";

/**
 * Featured project showcase: "Agentic presentation system".
 * The markup (header, tabbed frame, graph SVG, method illustrations, models,
 * stack) is static and ported verbatim from the design source, injected once;
 * a scoped controller in the effect drives the three tabs, the sliding pill
 * indicator, the crossfading stages, and the per-tab dots/caption/arrows.
 * Styles live under `.feature-showcase` in globals.css; dark mode is driven by
 * the blog's `.dark` class on <html>.
 */
const SHOWCASE_HTML = String.raw`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="mar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="il-mar" d="M0,1 L9,5 L0,9 Z"/></marker></defs></svg>

  <header class="head">
    <div class="eyebrow">Agentic system<span class="mono">presentation-agent</span></div>
    <h2 class="fs-title">Agentic presentation system</h2>
    <p class="thesis">It builds real, editable B2B decks by refusing to let the model touch a coordinate. <b>The model expresses structure; a coded engine draws every pixel.</b></p>
  </header>
  <section class="showcase" aria-label="Showcase">
    <div class="pills" role="tablist">
      <span class="pillbg" aria-hidden="true"></span>
      <button class="pill on" type="button" data-p="0" role="tab">Screens</button>
      <button class="pill" type="button" data-p="1" role="tab">Orchestration</button>
      <button class="pill" type="button" data-p="2" role="tab">The method</button>
    </div>
    <div class="frame">
      <div class="stage on" data-p="0"><div class="track" id="fs-track0"><div class="slide"><div class="ph"><span class="n">Overview</span><span class="f">hero.png</span></div><img class="smedia" src="/projects/hero.png" alt="Product overview" onerror="this.remove()"></div><div class="slide"><div class="ph"><span class="n">The brief</span><span class="f">01-brief.png</span></div><img class="smedia" src="/projects/01-brief.png" alt="The brief you write" onerror="this.remove()"></div><div class="slide"><div class="ph"><span class="n">A generated slide</span><span class="f">04-slide.png</span></div><img class="smedia" src="/projects/04-slide.png" alt="A generated slide" onerror="this.remove()"></div><div class="slide"><div class="ph"><span class="n">A run</span><span class="f">run.mp4</span></div><video class="smedia" src="/projects/run.mp4" muted loop playsinline autoplay onerror="this.remove()"></video></div></div></div>
      <div class="stage gstage" data-p="1"><svg class="cidiag" viewBox="0 60 1440 588" role="img" aria-label="Architecture. The user brief is parsed to structure and sent to a lead orchestrator (Vercel AI SDK, Claude) that runs an outline agent (structured zod outline) and, on demand, an SEO specialist (Tavily, DataForSEO) and a data analyst (E2B python). After a human approval gate, a build-and-render row runs: the slide agent, a design pipeline (invent, match, lint), a deterministic render engine (SVG, PNG, PPTX) and the finished deck, persisted to a Postgres/PGlite/R2 store and returned to you as editable PPTX plus PNG."><defs>
    <marker id="cah" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M2.5,2.5 L9,6 L2.5,9.5" fill="none" stroke="var(--ci-line)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></marker>
    <g id="l-ds"><path d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45"/></g><g id="l-cl"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></g><g id="l-gpt"><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"/></g><g id="l-gem"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/></g>
    <g id="l-e2b" transform="scale(0.75)"><path d="M24.1602 8.73682V12.5107H12.2729C11.9092 12.5108 11.6137 12.8062 11.6137 13.1699V13.4537C11.6137 13.8174 11.9092 14.1127 12.2729 14.1129H24.1602V17.8867H12.2729C11.9092 17.8869 11.6137 18.1822 11.6137 18.5459V18.8297C11.6138 19.1933 11.9093 19.4878 12.2729 19.4879H24.1602V23.2628H10.3631C8.96963 23.2624 7.83986 22.1321 7.83984 20.7386V11.26C7.84007 9.86668 8.96975 8.73717 10.3631 8.73682H24.1602Z"/></g><g id="l-tav"><path d="M8.033 14.273a1.612 1.612 0 011.139.47l.04.042.044.043a1.61 1.61 0 010 2.277l-3.073 3.073.816.816c.6.6.303 1.627-.525 1.814l-5.159 1.165a1.07 1.07 0 01-.897-.2l-.102-.09a1.07 1.07 0 01-.289-1l1.164-5.158A1.079 1.079 0 013.006 17l.816.817 3.074-3.074a1.612 1.612 0 011.137-.47zM17.042 13.246c0-.85.935-1.366 1.653-.912l4.47 2.824c.336.212.503.562.503.911 0 .35-.167.7-.501.913l-4.472 2.824a1.079 1.079 0 01-1.654-.912v-1.155h-7.027c.37-.4.605-.902.677-1.438l.022-.232a2.65 2.65 0 00-.492-1.669h6.821v-1.154zM8.188 0c.35 0 .7.168.913.503l2.823 4.47a1.079 1.079 0 01-.911 1.655H9.857v6.692h-1.67a2.633 2.633 0 00-1.668.48V6.629H5.365c-.849 0-1.366-.936-.912-1.654L7.276.503A1.072 1.072 0 018.188 0z"/></g><g id="l-d4s" transform="scale(0.8) translate(-166,0)"><path d="M175.423 15.027c0-3.218 2.513-5.827 5.612-5.827 3.1 0 5.612 2.609 5.612 5.827 0 3.219-2.512 5.828-5.612 5.828-3.099 0-5.612-2.61-5.612-5.828zm16.224 9.394l-3.485-3.8a9.42 9.42 0 001.761-5.514c0-5.097-3.979-9.228-8.888-9.228-4.908 0-8.887 4.131-8.887 9.228 0 5.096 3.979 9.228 8.887 9.228a8.58 8.58 0 003.946-.96l3.542 3.862a13.524 13.524 0 01-7.488 2.263c-7.712 0-13.965-6.492-13.965-14.5S173.323.5 181.035.5C188.748.5 195 6.992 195 15c0 3.597-1.264 6.886-3.353 9.42z"/></g></defs><rect class="ci-panel" x="24" y="56" width="298" height="568" rx="18"/><text class="ci-ptitle" x="48" y="92">User</text><rect class="ci-panel" x="354" y="56" width="1062" height="568" rx="18"/><text class="ci-ptitle" x="378" y="92">Presentation agent system</text><circle class="ci-avatar" cx="64" cy="150" r="15"/><g class="ci-avic" transform="translate(54.5,140.5) scale(0.78)"><path d="M12 5.4a2.9 2.9 0 1 0 0.01 0M6.6 18.6a5.4 5.4 0 0 1 10.8 0"/></g><text class="ci-lead" x="88" y="156">The brief</text><text class="ci-brief" x="48" y="194">&#8220;Create a board-ready pitch</text><text class="ci-brief" x="48" y="216">deck for our Series B raise</text><text class="ci-brief" x="48" y="238">from the attached data files.&#8221;</text><rect class="ci-file" x="48" y="266" width="132" height="26" rx="7"/><g class="ci-fic" transform="translate(58,272) scale(0.6)"><path d="M6.5 3.5h7l4 4v13h-11z M13.5 3.5v4h4"/></g><text class="ci-fname" x="76" y="280" dominant-baseline="middle">metrics_q3.csv</text><rect class="ci-file" x="48" y="298" width="145" height="26" rx="7"/><g class="ci-fic" transform="translate(58,304) scale(0.6)"><path d="M6.5 3.5h7l4 4v13h-11z M13.5 3.5v4h4"/></g><text class="ci-fname" x="76" y="312" dominant-baseline="middle">arr_cohorts.xlsx</text><line class="ci-hr" x1="48" y1="342" x2="298" y2="342"/><text class="ci-json k" x="48" y="370">parsed &#8594;</text><text class="ci-json" x="48" y="396">{ intent: "pitch deck",</text><text class="ci-json" x="48" y="418">  audience: "board",</text><text class="ci-json" x="48" y="440">  attached: 2 files,</text><text class="ci-json" x="48" y="462">  slides: 12 }</text><text class="ci-tagm" x="48" y="600">one message in</text><rect class="ci-zone" x="370" y="92" width="1032" height="206" rx="12"/><text class="ci-zone-t" x="386" y="112">PLANNING</text><g class="ci-node hub"><rect class="ci-box" x="386" y="122" width="234" height="100" rx="13"/><rect class="ci-tile2" x="402" y="138" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(407,143) scale(0.83)"><path d="M12 9.9a2.1 2.1 0 1 0 0.01 0 M12 4.3v3.5 M12 16.2v3.5 M4.3 12h3.5 M16.2 12h3.5"/></g><text class="ci-bt2" x="442" y="152" dominant-baseline="middle">Orchestrator</text><text class="ci-bs2" x="442" y="169" dominant-baseline="middle">lead agent &#183; Vercel AI SDK</text><text class="ci-tool2" x="442" y="186" dominant-baseline="middle">run_subagent &#183; render</text><circle class="ci-chip" cx="451" cy="206" r="9"/><use class="ci-clogo" href="#l-cl" transform="translate(444.4,199.4) scale(0.55)"/></g><g class="ci-node agent"><rect class="ci-box" x="720" y="142" width="210" height="92" rx="13"/><rect class="ci-tile2" x="736" y="158" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(741,163) scale(0.83)"><path d="M6.8 4.6h7.4l3.4 3.4v11.4h-10.8z M9.2 10.6h5.6 M9.2 13.8h5.6 M9.2 17h3.6"/></g><text class="ci-bt2" x="776" y="172" dominant-baseline="middle">Outline agent</text><text class="ci-bs2" x="776" y="189" dominant-baseline="middle">structured outline &#183; zod</text><circle class="ci-chip" cx="785" cy="218" r="9"/><use class="ci-clogo" href="#l-gpt" transform="translate(778.4,211.4) scale(0.55)"/><circle class="ci-chip" cx="807" cy="218" r="9"/><use class="ci-clogo" href="#l-tav" transform="translate(800.4,211.4) scale(0.55)"/><circle class="ci-chip" cx="829" cy="218" r="9"/><use class="ci-clogo" href="#l-d4s" transform="translate(822.4,211.4) scale(0.55)"/></g><g class="ci-node dash"><rect class="ci-box" x="1000" y="120" width="214" height="84" rx="13"/><rect class="ci-tile2" x="1016" y="136" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(1021,141) scale(0.83)"><path d="M10.6 4.2a6.4 6.4 0 1 0 0.01 0 M15.1 15.1 19.8 19.8"/></g><text class="ci-bt2" x="1056" y="150" dominant-baseline="middle">SEO specialist</text><text class="ci-bs2" x="1056" y="167" dominant-baseline="middle">keyword & SERP</text><circle class="ci-chip" cx="1065" cy="188" r="9"/><use class="ci-clogo" href="#l-gem" transform="translate(1058.4,181.4) scale(0.55)"/><circle class="ci-chip" cx="1087" cy="188" r="9"/><use class="ci-clogo" href="#l-d4s" transform="translate(1080.4,181.4) scale(0.55)"/><circle class="ci-chip" cx="1109" cy="188" r="9"/><use class="ci-clogo" href="#l-tav" transform="translate(1102.4,181.4) scale(0.55)"/></g><g class="ci-node dash"><rect class="ci-box" x="1000" y="214" width="214" height="84" rx="13"/><rect class="ci-tile2" x="1016" y="230" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(1021,235) scale(0.83)"><path d="M5.2 18.8h13.6 M8.4 18.8v-5.6 M12 18.8V6.4 M15.6 18.8v-8.4"/></g><text class="ci-bt2" x="1056" y="244" dominant-baseline="middle">Data analyst</text><text class="ci-bs2" x="1056" y="261" dominant-baseline="middle">Python in E2B</text><circle class="ci-chip" cx="1065" cy="282" r="9"/><use class="ci-clogo" href="#l-ds" transform="translate(1058.4,275.4) scale(0.55)"/><circle class="ci-chip" cx="1087" cy="282" r="9"/><use class="ci-clogo" href="#l-e2b" transform="translate(1080.4,275.4) scale(0.55)"/></g><path class="ci-edge" d="M322,172 H386" marker-end="url(#cah)"/><g class="ci-flab"><rect x="331.5" y="150" width="45" height="18" rx="6"/><text class="ci-lab sm" x="354" y="160" text-anchor="middle" dominant-baseline="middle">brief</text></g><path class="ci-edge" d="M620,176 H720" marker-end="url(#cah)"/><g class="ci-flab"><rect x="624.4" y="154" width="91.19999999999999" height="18" rx="6"/><text class="ci-lab sm" x="670" y="164" text-anchor="middle" dominant-baseline="middle">run_subagent</text></g><path class="ci-edge" d="M720,196 H620" marker-end="url(#cah)"/><path class="ci-edge dash" d="M930,168 H1000" marker-end="url(#cah)"/><path class="ci-edge dash" d="M930,208 V256 H1000" marker-end="url(#cah)"/><text class="ci-lab sm" x="965" y="110" text-anchor="middle">on demand</text><path class="ci-edge" d="M503,222 V300" marker-end="url(#cah)"/><rect class="ci-gate" x="415" y="302" width="176" height="32" rx="16"/><text class="ci-gate-t" x="503" y="319" text-anchor="middle" dominant-baseline="middle">approve() &#183; human gate</text><rect class="ci-zone" x="370" y="360" width="1032" height="214" rx="12"/><text class="ci-zone-t" x="386" y="380">BUILD & RENDER</text><g class="ci-node agent"><rect class="ci-box" x="386" y="406" width="204" height="92" rx="13"/><rect class="ci-tile2" x="402" y="422" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(407,427) scale(0.83)"><path d="M4.8 5.5h14.4v13h-14.4z M4.8 9.7h14.4 M9.2 9.7v8.8"/></g><text class="ci-bt2" x="442" y="436" dominant-baseline="middle">Slide agent</text><text class="ci-bs2" x="442" y="453" dominant-baseline="middle">per-card pipeline</text><circle class="ci-chip" cx="451" cy="482" r="9"/><use class="ci-clogo" href="#l-cl" transform="translate(444.4,475.4) scale(0.55)"/></g><g class="ci-node agent"><rect class="ci-box" x="632" y="406" width="214" height="92" rx="13"/><rect class="ci-tile2" x="648" y="422" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(653,427) scale(0.83)"><path d="M9 8 4.5 12 9 16 M15 8 19.5 12 15 16 M13.2 7 10.8 17"/></g><text class="ci-bt2" x="688" y="436" dominant-baseline="middle">Design pipeline</text><text class="ci-bs2" x="688" y="453" dominant-baseline="middle">invent &#183; match &#183; lint</text><circle class="ci-chip" cx="697" cy="482" r="9"/><use class="ci-clogo" href="#l-gpt" transform="translate(690.4,475.4) scale(0.55)"/></g><g class="ci-node plain"><rect class="ci-box" x="888" y="406" width="214" height="92" rx="13"/><rect class="ci-tile2" x="904" y="422" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(909,427) scale(0.83)"><path d="M4.5 5.2h15v13.6h-15z M4.5 15l4-4 3 2.6 4-4 3.5 3.4 M8.3 9.6a1.1 1.1 0 1 0 0.01 0"/></g><text class="ci-bt2" x="944" y="436" dominant-baseline="middle">Render engine</text><text class="ci-bs2" x="944" y="453" dominant-baseline="middle">SVG &#183; PNG &#183; PPTX</text></g><g class="ci-node plain"><rect class="ci-box" x="1144" y="406" width="196" height="92" rx="13"/><rect class="ci-tile2" x="1160" y="422" width="30" height="30" rx="8"/><g class="ci-ic2" transform="translate(1165,427) scale(0.83)"><path d="M4.5 5h15v9.5h-15z M12 14.5v3 M9 20h6"/></g><text class="ci-bt2" x="1200" y="436" dominant-baseline="middle">Finished deck</text><text class="ci-bs2" x="1200" y="453" dominant-baseline="middle">editable PPTX / PNG</text></g><path class="ci-edge" d="M503,334 V350 H360 V452 H386" marker-end="url(#cah)"/><g class="ci-flab"><rect x="377.2" y="340" width="117.6" height="18" rx="6"/><text class="ci-lab sm" x="436" y="350" text-anchor="middle" dominant-baseline="middle">approved outline</text></g><path class="ci-edge" d="M590,452 H632" marker-end="url(#cah)"/><path class="ci-edge" d="M846,452 H888" marker-end="url(#cah)"/><path class="ci-edge" d="M1102,452 H1144" marker-end="url(#cah)"/><path class="ci-edge" d="M714,406 V392 H772 V406" marker-end="url(#cah)"/><text class="ci-lab sm" x="743" y="384" text-anchor="middle">lint retry</text><text class="ci-note" x="995" y="536" text-anchor="middle">structure in &#183; deterministic pixels out</text><text class="ci-note" x="488" y="536" text-anchor="middle">state &#8594; Postgres &#183; PGlite &#183; R2</text><path class="ci-edge" d="M1242,498 V602 H322" marker-end="url(#cah)"/><g class="ci-flab"><rect x="741" y="584" width="78" height="18" rx="6"/><text class="ci-lab sm" x="780" y="594" text-anchor="middle" dominant-baseline="middle">PPTX + PNG</text></g></svg></div>
      <div class="stage" data-p="2"><div class="track" id="fs-track2"><div class="slide mslide"><div class="m-art"><svg class="il" viewBox="0 0 300 200" aria-hidden="true">
  <path class="il-l" d="M150 70 C150 104 44 104 44 130"/><path class="il-l" d="M150 70 C150 104 114 104 114 130"/>
  <path class="il-l" d="M150 70 C150 104 186 104 186 130"/><path class="il-l" d="M150 70 C150 104 256 104 256 130"/>
  <rect class="il-a" x="112" y="26" width="76" height="42" rx="12"/><g class="il-aw" transform="translate(138,35)"><path d="M12 9.9a2.1 2.1 0 1 0 0.01 0 M12 4.3v3.5 M12 16.2v3.5 M4.3 12h3.5 M16.2 12h3.5"/></g>
  <rect class="il-c" x="16" y="130" width="56" height="46" rx="9"/><g class="il-mi" transform="translate(32,142)"><path d="M6.8 4.6h7.4l3.4 3.4v11.4h-10.8z M9.2 10.6h5.6 M9.2 13.8h5.6 M9.2 17h3.6"/></g>
  <rect class="il-c" x="86" y="130" width="56" height="46" rx="9"/><g class="il-mi" transform="translate(102,142)"><path d="M5.2 18.8h13.6 M8.4 18.8v-5.6 M12 18.8V6.4 M15.6 18.8v-8.4"/></g>
  <rect class="il-c" x="158" y="130" width="56" height="46" rx="9"/><g class="il-mi" transform="translate(174,142)"><path d="M10.6 4.2a6.4 6.4 0 1 0 0.01 0 M15.1 15.1 19.8 19.8"/></g>
  <rect class="il-c" x="228" y="130" width="56" height="46" rx="9"/><g class="il-mi" transform="translate(244,142)"><path d="M4.8 5.5h14.4v13h-14.4z M4.8 9.7h14.4 M9.2 9.7v8.8"/></g>
</svg></div><div class="m-txt"><div class="m-h">One orchestrator, many hands</div><div class="m-b">A single orchestrator holds the conversation and delegates every task to a specialist. It never writes a slide or the outline itself.</div></div></div><div class="slide mslide"><div class="m-art"><svg class="il" viewBox="0 0 300 200" aria-hidden="true">
  <rect class="il-c" x="18" y="24" width="150" height="152" rx="11"/>
  <rect class="il-f2" x="18" y="24" width="150" height="30" rx="11"/><rect class="il-a" x="34" y="35" width="46" height="8" rx="4"/>
  <rect class="il-f" x="34" y="72" width="118" height="8" rx="4"/><rect class="il-f" x="34" y="94" width="118" height="8" rx="4"/>
  <rect class="il-f" x="34" y="116" width="90" height="8" rx="4"/><rect class="il-f" x="34" y="138" width="118" height="8" rx="4"/>
  <circle class="il-a" cx="168" cy="40" r="16"/><g class="il-aw" transform="translate(157,29) scale(0.9)"><path d="M5.2 12.4 9.8 17 18.8 6.6"/></g>
  <path class="il-al" d="M176 118 H206" marker-end="url(#mar)"/>
  <rect class="il-c" x="214" y="86" width="72" height="64" rx="7"/><rect class="il-a" x="225" y="97" width="33" height="7" rx="3.5"/><rect class="il-f" x="225" y="112" width="50" height="6" rx="3"/><rect class="il-f" x="225" y="124" width="32" height="6" rx="3"/>
</svg></div><div class="m-txt"><div class="m-h">Plan before pixels</div><div class="m-b">An outline agent settles the argument and the slide list. You approve it before a single pixel is drawn, so the deck is right before it is built.</div></div></div><div class="slide mslide"><div class="m-art"><svg class="il" viewBox="0 0 300 200" aria-hidden="true">
  <rect class="il-c" x="18" y="42" width="104" height="116" rx="10"/>
  <circle class="il-dot" cx="70" cy="66" r="4"/><circle class="il-dot" cx="42" cy="120" r="4"/><circle class="il-dot" cx="70" cy="120" r="4"/><circle class="il-dot" cx="98" cy="120" r="4"/>
  <path class="il-l" d="M70 70 V96 M70 96 H42 V116 M70 96 H98 V116 M70 96 V116"/>
  <rect class="il-f" x="34" y="128" width="30" height="6" rx="3"/><rect class="il-f" x="76" y="128" width="30" height="6" rx="3"/>
  <path class="il-al" d="M130 100 H162" marker-end="url(#mar)"/>
  <rect class="il-c" x="178" y="30" width="104" height="140" rx="10"/>
  <path class="il-g" d="M178 70 H282 M178 110 H282 M212 30 V170 M248 30 V170"/>
  <rect class="il-a" x="190" y="42" width="54" height="9" rx="4"/><rect class="il-f" x="190" y="120" width="80" height="7" rx="3"/><rect class="il-f" x="190" y="134" width="60" height="7" rx="3"/>
  <rect class="il-f2" x="212" y="70" width="58" height="38" rx="4"/>
</svg></div><div class="m-txt"><div class="m-h">Structure, not coordinates</div><div class="m-b">The model returns structure and content, never an x or a y. A coded engine reads that structure and computes every position on the slide.</div></div></div><div class="slide mslide"><div class="m-art"><svg class="il" viewBox="0 0 300 200" aria-hidden="true">
  <rect class="il-c" x="18" y="24" width="98" height="34" rx="9"/><g class="il-mi" transform="translate(28,29)"><path d="M9.2 14.8a4.8 4.8 0 1 1 5.6 0c-.7.5-1 1.1-1 1.9h-3.6c0-.8-.3-1.4-1-1.9z M10 18.4h4"/></g><rect class="il-f" x="54" y="37" width="48" height="8" rx="4"/>
  <rect class="il-c" x="18" y="76" width="98" height="34" rx="9"/><g class="il-mi" transform="translate(28,81)"><path d="M9.6 14.4 14.4 9.6 M8.2 12l-1.8 1.8a2.8 2.8 0 1 0 3.8 3.8L12 15.8 M15.8 12l1.8-1.8a2.8 2.8 0 1 0-3.8-3.8L12 8.2"/></g><rect class="il-f" x="54" y="89" width="48" height="8" rx="4"/>
  <rect class="il-c" x="18" y="128" width="98" height="34" rx="9"/><g class="il-mi" transform="translate(28,133)"><path d="M4.8 4.8h5.6v5.6h-5.6z M13.6 4.8h5.6v5.6h-5.6z M4.8 13.6h5.6v5.6h-5.6z M13.6 13.6h5.6v5.6h-5.6z"/></g><rect class="il-f" x="54" y="141" width="48" height="8" rx="4"/>
  <path class="il-l" d="M67 58 V76 M67 110 V128"/>
  <path class="il-al" d="M124 93 H160" marker-end="url(#mar)"/>
  <rect class="il-c" x="176" y="52" width="104" height="92" rx="7"/><rect class="il-a" x="187" y="63" width="48" height="7" rx="3.5"/><rect class="il-f" x="187" y="78" width="82" height="6" rx="3"/><rect class="il-f" x="187" y="90" width="64" height="6" rx="3"/>
  <circle class="il-a" cx="278" cy="56" r="13"/><g class="il-aw" transform="translate(269,47) scale(0.78)"><path d="M5.2 12.4 9.8 17 18.8 6.6"/></g>
</svg></div><div class="m-txt"><div class="m-h">A design pipeline per slide</div><div class="m-b">For each card the composer invents the idea, matches it to a library block, and lays it out. A linter rejects bad geometry before the slide lands.</div></div></div><div class="slide mslide"><div class="m-art"><svg class="il" viewBox="0 0 300 200" aria-hidden="true">
  <rect class="il-c" x="16" y="72" width="58" height="56" rx="10"/><rect class="il-f" x="27" y="86" width="36" height="6" rx="3"/><rect class="il-f" x="27" y="98" width="36" height="6" rx="3"/><rect class="il-f" x="27" y="110" width="24" height="6" rx="3"/>
  <path class="il-al" d="M80 100 H104" marker-end="url(#mar)"/>
  <rect class="il-a" x="110" y="70" width="60" height="60" rx="12"/><g class="il-aw" transform="translate(128,88)"><path d="M9 9h6v6H9z M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/></g>
  <path class="il-al" d="M176 100 H200" marker-end="url(#mar)"/>
  <rect class="il-c" x="206" y="64" width="78" height="72" rx="7"/><rect class="il-a" x="217" y="75" width="36" height="7" rx="3.5"/><rect class="il-f" x="217" y="90" width="56" height="6" rx="3"/><rect class="il-f" x="217" y="102" width="38" height="6" rx="3"/>
  <rect class="il-c" x="206" y="146" width="36" height="20" rx="6"/><rect class="il-f" x="214" y="153" width="20" height="6" rx="3"/>
  <rect class="il-c" x="248" y="146" width="36" height="20" rx="6"/><rect class="il-f" x="256" y="153" width="20" height="6" rx="3"/>
</svg></div><div class="m-txt"><div class="m-h">Deterministic output</div><div class="m-b">The engine renders each slide to SVG, then PNG, and an editable PPTX. The same structure always yields the same pixels, every run.</div></div></div></div></div>
    </div>
    <div class="navbar">
      <span class="ncap">Overview</span>
      <div class="nright">
        <div class="ndots"></div>
        <div class="nbtns">
          <button class="nbtn" id="fs-prev" type="button" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>
          <button class="nbtn" id="fs-next" type="button" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>
        </div>
      </div>
    </div>
  </section>
  <div class="meta"><section class="band" aria-label="Models">
    <h2 class="sh">Models</h2>
    <div class="models">
      <div class="model" tabindex="0">
        <span class="mc"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45"/></svg></span>
        <span class="tip"><span class="nm">DeepSeek V4 Pro</span><span class="id">deepseek-v4-pro-0813</span></span>
      </div>
      <div class="model" tabindex="0">
        <span class="mc"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg></span>
        <span class="tip"><span class="nm">Claude Sonnet 5</span><span class="id">claude-sonnet-5</span></span>
      </div>
      <div class="model" tabindex="0">
        <span class="mc"><svg class="lg" viewBox="0 0 24 24" fill-rule="evenodd" aria-hidden="true"><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"/></svg></span>
        <span class="tip"><span class="nm">GPT-5.6 Luna</span><span class="id">gpt-5.6-luna</span></span>
      </div>
      <div class="model" tabindex="0">
        <span class="mc"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/></svg></span>
        <span class="tip"><span class="nm">Gemini 3.5 Flash</span><span class="id">gemini-3.5-flash</span></span>
      </div>
    </div>
  </section><section class="band" aria-label="Stack">
    <h2 class="sh">Stack</h2>
    <div class="stack">
      <div class="sg">
        <span class="gl">Framework</span>
        <span class="gi">
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z"/></svg>Next.js 15</span>
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/></svg>React 19</span>
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>TypeScript</span>
        </span>
      </div>
      <div class="sg">
        <span class="gl">Model runtime</span>
        <span class="gi">
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 1.608 12 20.784H0Z"/></svg>Vercel AI SDK</span>
          <span class="si"><span class="mk">Ai</span>AI Gateway</span>
        </span>
      </div>
      <div class="sg">
        <span class="gl">Render engine</span>
        <span class="gi">
          <span class="si"><span class="mk">Fk</span>fontkit</span>
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.584 3.582a2.247 2.247 0 0 1 2.112-1.479h14.617c.948 0 1.794.595 2.115 1.487l2.44 6.777a2.248 2.248 0 0 1-.624 2.443l-9.61 8.52a2.247 2.247 0 0 1-2.963.018L.776 12.773a2.248 2.248 0 0 1-.64-2.467Zm12.038 4.887-9.11 5.537 5.74 5.007c.456.399 1.139.396 1.593-.006l5.643-5.001H14.4l6.239-3.957c.488-.328.69-.947.491-1.5l-1.24-3.446a1.535 1.535 0 0 0-1.456-1.015H5.545a1.535 1.535 0 0 0-1.431 1.01l-1.228 3.37z"/></svg>zod</span>
          <span class="si"><span class="mk">Rs</span>resvg</span>
          <span class="si"><span class="mk">Px</span>pptxgenjs</span>
        </span>
      </div>
      <div class="sg">
        <span class="gl">Data</span>
        <span class="gi">
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5594 14.7228a.5269.5269 0 0 0-.0563-.1191c-.139-.2632-.4768-.3418-1.0074-.2321-1.6533.3411-2.2935.1312-2.5256-.0191 1.342-2.0482 2.445-4.522 3.0411-6.8297.2714-1.0507.7982-3.5237.1222-4.7316a1.5641 1.5641 0 0 0-.1509-.235C21.6931.9086 19.8007.0248 17.5099.0005c-1.4947-.0158-2.7705.3461-3.1161.4794a9.449 9.449 0 0 0-.5159-.0816 8.044 8.044 0 0 0-1.3114-.1278c-1.1822-.0184-2.2038.2642-3.0498.8406-.8573-.3211-4.7888-1.645-7.2219.0788C.9359 2.1526.3086 3.8733.4302 6.3043c.0409.818.5069 3.334 1.2423 5.7436.4598 1.5065.9387 2.7019 1.4334 3.582.553.9942 1.1259 1.5933 1.7143 1.7895.4474.1491 1.1327.1441 1.8581-.7279.8012-.9635 1.5903-1.8258 1.9446-2.2069.4351.2355.9064.3625 1.39.3772a.0569.0569 0 0 0 .0004.0041 11.0312 11.0312 0 0 0-.2472.3054c-.3389.4302-.4094.5197-1.5002.7443-.3102.064-1.1344.2339-1.1464.8115-.0025.1224.0329.2309.0919.3268.2269.4231.9216.6097 1.015.6331 1.3345.3335 2.5044.092 3.3714-.6787-.017 2.231.0775 4.4174.3454 5.0874.2212.5529.7618 1.9045 2.4692 1.9043.2505 0 .5263-.0291.8296-.0941 1.7819-.3821 2.5557-1.1696 2.855-2.9059.1503-.8707.4016-2.8753.5388-4.1012.0169-.0703.0357-.1207.057-.1362.0007-.0005.0697-.0471.4272.0307a.3673.3673 0 0 0 .0443.0068l.2539.0223.0149.001c.8468.0384 1.9114-.1426 2.5312-.4308.6438-.2988 1.8057-1.0323 1.5951-1.6698zM12.581 11.728a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45"/></svg>Postgres</span>
          <span class="si"><svg class="lg" viewBox="0 0 368 305" fill-rule="evenodd" aria-hidden="true"><path d="M304 104.551L304 232.47C304 236.891 300.413 240.475 295.991 240.47L263.968 240.432C259.734 240.427 256.272 237.134 255.995 232.971C255.998 232.813 256 232.655 256 232.496L255.999 184.498C255.999 171.244 245.239 160.499 231.984 160.499C219.138 160.499 208.636 150.406 208 137.717V64.5095L264.03 64.5507C286.109 64.5669 304 82.4708 304 104.551ZM207.97 48.5095L208 48.5095L264.041 48.5507C294.953 48.5734 320 73.6388 320 104.551L320 232.47C320 245.735 309.238 256.485 295.972 256.47L263.949 256.432C257.835 256.425 252.258 254.132 248.024 250.363C243.775 254.177 238.158 256.497 231.998 256.496L71.9984 256.486C58.7442 256.485 48 245.74 48 232.486V104.498C48 73.57 73.0722 48.4979 104 48.498L191.97 48.4986H192H193.142H207.97V48.5095ZM144 64.4983L144 120.523C144 133.777 154.745 144.523 168 144.523H192L192 142.914C192 161.462 207.036 176.498 225.584 176.498C233.533 176.498 239.977 182.942 239.977 190.891L239.977 232.432C239.977 232.623 239.98 232.813 239.984 233.003C239.722 237.185 236.247 240.496 231.999 240.496L191.726 240.494L192 184.534C192.022 180.116 188.457 176.517 184.039 176.495C179.621 176.473 176.022 180.038 176 184.456L175.726 240.459L175.726 240.492L127.9 240.489V184.495C127.9 180.077 124.318 176.495 119.9 176.495C115.482 176.495 111.9 180.077 111.9 184.495V240.488L71.9995 240.486C67.5814 240.485 64 236.904 64 232.486V104.498C64 82.4066 81.9087 64.4979 104 64.498L144 64.4983ZM268.04 112.715C268.04 106.088 262.667 100.715 256.04 100.715C249.412 100.715 244.04 106.088 244.04 112.715C244.04 119.343 249.412 124.715 256.04 124.715C262.667 124.715 268.04 119.343 268.04 112.715Z"/></svg>PGlite</span>
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727"/></svg>Cloudflare R2</span>
        </span>
      </div>
      <div class="sg">
        <span class="gl">Services</span>
        <span class="gi">
          <span class="si"><svg class="lg" viewBox="0 0 32 32" aria-hidden="true"><path d="M24.1602 8.73682V12.5107H12.2729C11.9092 12.5108 11.6137 12.8062 11.6137 13.1699V13.4537C11.6137 13.8174 11.9092 14.1127 12.2729 14.1129H24.1602V17.8867H12.2729C11.9092 17.8869 11.6137 18.1822 11.6137 18.5459V18.8297C11.6138 19.1933 11.9093 19.4878 12.2729 19.4879H24.1602V23.2628H10.3631C8.96963 23.2624 7.83986 22.1321 7.83984 20.7386V11.26C7.84007 9.86668 8.96975 8.73717 10.3631 8.73682H24.1602Z"/></svg>E2B sandbox</span>
          <span class="si"><svg class="lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.033 14.273a1.612 1.612 0 011.139.47l.04.042.044.043a1.61 1.61 0 010 2.277l-3.073 3.073.816.816c.6.6.303 1.627-.525 1.814l-5.159 1.165a1.07 1.07 0 01-.897-.2l-.102-.09a1.07 1.07 0 01-.289-1l1.164-5.158A1.079 1.079 0 013.006 17l.816.817 3.074-3.074a1.612 1.612 0 011.137-.47zM17.042 13.246c0-.85.935-1.366 1.653-.912l4.47 2.824c.336.212.503.562.503.911 0 .35-.167.7-.501.913l-4.472 2.824a1.079 1.079 0 01-1.654-.912v-1.155h-7.027c.37-.4.605-.902.677-1.438l.022-.232a2.65 2.65 0 00-.492-1.669h6.821v-1.154zM8.188 0c.35 0 .7.168.913.503l2.823 4.47a1.079 1.079 0 01-.911 1.655H9.857v6.692h-1.67a2.633 2.633 0 00-1.668.48V6.629H5.365c-.849 0-1.366-.936-.912-1.654L7.276.503A1.072 1.072 0 018.188 0z"/></svg>Tavily</span>
          <span class="si"><svg class="lg" viewBox="166 0 30 30" fill-rule="evenodd" aria-hidden="true"><path d="M175.423 15.027c0-3.218 2.513-5.827 5.612-5.827 3.1 0 5.612 2.609 5.612 5.827 0 3.219-2.512 5.828-5.612 5.828-3.099 0-5.612-2.61-5.612-5.828zm16.224 9.394l-3.485-3.8a9.42 9.42 0 001.761-5.514c0-5.097-3.979-9.228-8.888-9.228-4.908 0-8.887 4.131-8.887 9.228 0 5.096 3.979 9.228 8.887 9.228a8.58 8.58 0 003.946-.96l3.542 3.862a13.524 13.524 0 01-7.488 2.263c-7.712 0-13.965-6.492-13.965-14.5S173.323.5 181.035.5C188.748.5 195 6.992 195 15c0 3.597-1.264 6.886-3.353 9.42z"/></svg>DataForSEO</span>
        </span>
      </div>
    </div>
  </section></div>`;

export default function FeatureShowcase({
  variant = "full",
}: {
  // "diagram" hides the built-in header and Models/Stack bands via CSS, so the
  // interactive showcase can sit inside the shared /work deep-dive shell (which
  // supplies its own hero, metrics, and "Built with" from the projects table).
  variant?: "full" | "diagram";
} = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ac = new AbortController();
    const sig = ac.signal;

    const TABS: { track: HTMLElement | null; caps: string[] }[] = [
      {
        track: root.querySelector("#fs-track0"),
        caps: ["Overview", "The brief", "A generated slide", "A run"],
      },
      { track: null, caps: ["From your brief to a finished deck"] },
      {
        track: root.querySelector("#fs-track2"),
        caps: [
          "One orchestrator, many hands",
          "Plan before pixels",
          "Structure, not coordinates",
          "A design pipeline per slide",
          "Deterministic output",
        ],
      },
    ];

    const pills = Array.from(root.querySelectorAll<HTMLElement>(".pill"));
    const stages = Array.from(root.querySelectorAll<HTMLElement>(".stage"));
    const pillbg = root.querySelector<HTMLElement>(".pillbg");
    const ncap = root.querySelector<HTMLElement>(".ncap");
    const ndots = root.querySelector<HTMLElement>(".ndots");
    const nright = root.querySelector<HTMLElement>(".nright");
    // Default to "Orchestration": the Screens tab has no real captures yet, so
    // opening there shows empty placeholders. The architecture view is complete.
    let cur = 1;
    const idx = [0, 0, 0];

    const movePill = () => {
      const p = pills[cur];
      if (!pillbg || !p) return;
      pillbg.style.width = `${p.offsetWidth}px`;
      pillbg.style.transform = `translateX(${p.offsetLeft - 4}px)`;
    };
    const render = () => {
      const t = TABS[cur];
      if (t.track) t.track.style.transform = `translateX(-${idx[cur] * 100}%)`;
      if (ncap) ncap.textContent = t.caps[idx[cur]];
      if (ndots) {
        const dots = Array.from(ndots.children) as HTMLElement[];
        for (const [i, d] of dots.entries())
          d.className = `ndot${i === idx[cur] ? " on" : ""}`;
      }
    };
    const buildDots = () => {
      const t = TABS[cur];
      if (!ndots || !nright) return;
      ndots.innerHTML = "";
      if (t.caps.length < 2) {
        nright.classList.add("hide");
        return;
      }
      nright.classList.remove("hide");
      for (const [i, c] of t.caps.entries()) {
        const b = document.createElement("button");
        b.className = `ndot${i === idx[cur] ? " on" : ""}`;
        b.type = "button";
        b.setAttribute("aria-label", c);
        b.addEventListener(
          "click",
          () => {
            idx[cur] = i;
            render();
          },
          { signal: sig },
        );
        ndots.appendChild(b);
      }
    };
    const switchTab = (t: number) => {
      if (t === cur) return;
      cur = t;
      for (const [i, x] of pills.entries()) x.classList.toggle("on", i === t);
      for (const s of stages)
        s.classList.toggle("on", s.getAttribute("data-p") === String(t));
      movePill();
      buildDots();
      render();
    };

    for (const [i, p] of pills.entries())
      p.addEventListener("click", () => switchTab(i), { signal: sig });
    const prev = root.querySelector<HTMLElement>("#fs-prev");
    const next = root.querySelector<HTMLElement>("#fs-next");
    prev?.addEventListener(
      "click",
      () => {
        const n = TABS[cur].caps.length;
        idx[cur] = (idx[cur] - 1 + n) % n;
        render();
      },
      { signal: sig },
    );
    next?.addEventListener(
      "click",
      () => {
        const n = TABS[cur].caps.length;
        idx[cur] = (idx[cur] + 1) % n;
        render();
      },
      { signal: sig },
    );
    window.addEventListener("resize", movePill, { signal: sig });

    for (const [i, x] of pills.entries()) x.classList.toggle("on", i === cur);
    for (const s of stages)
      s.classList.toggle("on", s.getAttribute("data-p") === String(cur));
    movePill();
    buildDots();
    render();

    return () => ac.abort();
  }, []);

  return (
    <div
      className={`feature-showcase${variant === "diagram" ? " diagram" : ""}`}
      ref={ref}
      dangerouslySetInnerHTML={{ __html: SHOWCASE_HTML }}
    />
  );
}
