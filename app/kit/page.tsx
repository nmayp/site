import Link from "next/link";
import SeeMore from "@/components/SeeMore";
import Arch from "@/components/Arch";
import AttractorStills from "@/components/AttractorStills";
import { ColourBar, DotPlot, Dumbbell, LayoutFigure, MotionDemo, Scorecard, Specimens, Ticks, TypeScale } from "@/components/charts";
import { Cols, CountUp, Flow, Shots, Stack } from "@/components/Deck";
import { ICONS } from "@/components/icons";
import ProjectTwo from "@/content/ProjectTwo";
import { placeholder } from "@/lib/placeholder";
import Frame from "./Frame";
import "./kit.css";

export const metadata = { title: "Kit" };

const colours: [string, string, string][] = [
  ["Black", "--black", "#000"],
  ["White", "--white", "#fff"],
  ["Blue", "--blue", "#1840ff"],
  ["Grey, text", "--grey-text", "#555"],
  ["Grey, quiet", "--grey-quiet", "#8a8a8a"],
  ["Grey, faint", "--grey-faint", "#b4b4b4"],
  ["Grey, rail", "--grey-rail", "#d4d4d4"],
  ["Grey, line", "--grey-line", "#d8d8d8"],
  ["Grey, rule", "--grey-rule", "#ececec"],
];

const spaces = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6"];
const spaceEm = [0.4, 0.6, 0.8, 1.2, 2, 3.5];

export default function Kit() {
  return (
    <main className="kit">
      <div className="kit-top">
        <div>
          <h1>Kit</h1>
          <p>Every component and primitive, with placeholder data. Edit the data in the file, not here.</p>
        </div>
        <Link href="/">Back to the scene</Link>
      </div>

      <Frame name="Tokens: colour" note="styles/tokens.css. Black, white, one blue, and greys.">
        <ul className="kit-chips">
          {colours.map(([n, v, h]) => (
            <li key={v}>
              <i style={{ background: `var(${v})` }} />
              <b>{n}</b>
              <code>{v} · {h}</code>
            </li>
          ))}
        </ul>
      </Frame>

      <Frame name="Tokens: spacing" note="In em, so it scales with the panel's font size.">
        <ul className="kit-space">
          {spaces.map((v, i) => (
            <li key={v}>
              <code>{v} · {spaceEm[i]} em</code>
              <i style={{ width: `var(${v})` }} />
            </li>
          ))}
        </ul>
      </Frame>

      <Frame name="TypeScale" note="Type tokens, set in their own styles. Two families: Geist and Geist Mono.">
        <TypeScale />
      </Frame>

      <Frame name="ColourBar" note="Palette and the share of the page each colour takes. Pass your own palette.">
        <ColourBar />
      </Frame>

      <Frame name="MotionDemo" note="The tokens in lib/motion.ts, drawn as curves and played on a track.">
        <MotionDemo />
      </Frame>

      <Frame name="Specimens" note="The small parts of the interface as they are used.">
        <Specimens />
      </Frame>

      <Frame name="LayoutFigure" note="How the text finds room around the shape: the shape, its keep-out, the free area.">
        <div className="bench-chart"><LayoutFigure /></div>
      </Frame>

      <Frame name="Scene" note="components/Scene.tsx. The WebGL attractor; each child is one text block, each press moves the camera. It fills the whole window, so see it on the first page.">
        <Link className="see-more" href="/">Open the scene</Link>
      </Frame>

      <Frame name="AttractorStills" note="Small stills of the four shapes the scene cycles through.">
        <AttractorStills />
      </Frame>

      <Frame name="SeeMore + Deck" note="A link that opens a full-screen panel; the shape moves into its empty cell. Inside is a Deck: points on the left, a slide that rises in, a sliding slash. Click, arrow keys or space to move; Escape closes.">
        <p>
          <SeeMore label="Open a panel" title="Title" note="A short note.">
            <ProjectTwo />
          </SeeMore>
        </p>
      </Frame>

      <Frame name="Slide type" note="Plain markup inside a slide: lead, hero number, tiles, three points, notes, lists, tables.">
        <p className="lead">A lead line: one sentence, said plainly.</p>
        <div className="hero">
          <span className="big">0 <i>/ 0</i></span>
          <p className="lead small">A small lead beside the number.</p>
        </div>
        <ul className="tiles">
          <li><span className="n">0</span><span className="l">Label</span></li>
          <li><span className="n">0</span><span className="l">Label</span></li>
          <li><span className="n">0</span><span className="l">Label</span></li>
        </ul>
        <ul className="kw3">
          <li><b>Word</b><span>A short line of text.</span></li>
          <li><b>Word</b><span>A short line of text.</span></li>
          <li><b>Word</b><span>A short line of text.</span></li>
        </ul>
        <ul className="plain">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
        <table>
          <thead>
            <tr><th>Item</th><th>Label</th><th>Label</th></tr>
          </thead>
          <tbody>
            <tr className="hi"><th>Item 1</th><td>0</td><td>0</td></tr>
            <tr><th>Item 2</th><td>0</td><td>0</td></tr>
          </tbody>
        </table>
        <p className="note">A note: smaller and quieter, under the slide.</p>
      </Frame>

      <Frame name="CountUp" note="Numbers count up to their value when they appear; with reduced motion they show the final value at once.">
        <ul className="tiles">
          <li><span className="n"><CountUp to={100} /></span><span className="l">Whole number</span></li>
          <li><span className="n"><CountUp to={2.5} decimals={1} /></span><span className="l">One decimal</span></li>
        </ul>
      </Frame>

      <Frame name="Flow" note="Steps as a chain: numbered dots on one thin line. Blue and dashed are options.">
        <Flow
          steps={[
            "Group",
            { n: "1", t: "Step one", d: "One line about the step" },
            { n: "2", t: "Step two", d: "One line about the step", blue: true },
            { n: "3", t: "Step three", d: "One line about the step", dash: true },
          ]}
        />
      </Frame>

      <Frame name="Shots" note="Pictures with a short caption; a tall one spans two rows. These are made in code.">
        <Shots
          items={[
            { src: placeholder(600, 400), cap: "Caption" },
            { src: placeholder(600, 400), cap: "Caption" },
            { src: placeholder(300, 600), cap: "Caption", tall: true },
          ]}
        />
      </Frame>

      <Frame name="Cols" note="Two columns on a wide screen, stacked on a phone.">
        <Cols>
          <div><p className="lead small">Left column</p><p className="note">A note.</p></div>
          <div><p className="lead small">Right column</p><p className="note">A note.</p></div>
        </Cols>
      </Frame>

      <Frame name="Stack" note="Layers of what is used; `own` items are blue. Marks come from components/icons.ts.">
        <Stack
          rows={[
            { k: "Layer 1", items: [{ n: "Item 1" }, { n: "Item 2" }] },
            { k: "Layer 2", items: [{ n: "Item 1", s: "Detail", icon: "python" }, { n: "Item 2", icon: "react" }] },
            { k: "Layer 3", items: [{ n: "Item 1", icon: "nextdotjs", own: true }, { n: "Item 2", own: true }] },
          ]}
        />
      </Frame>

      <Frame name="Arch" note="An architecture diagram: zones, items with a technology and a line, arrows with a label.">
        <div className="bench-chart arch">
          <Arch
            title="Container view · Name"
            aria="Placeholder architecture diagram"
            stages={[
              { zone: "Zone one", flow: true, link: "what travels", items: [
                { t: "Item 1", tech: "Tech", icon: "python", d: "One line about what it does" },
                { t: "Item 2", tech: "Tech", own: true, d: "One line about what it does" },
                { t: "Item 3", tech: "Tech", icon: "react", d: "One line about what it does" },
              ] },
              { zone: "Zone two", items: [{ t: "Item 4", tech: "Tech", own: true, d: "One line about what it does" }] },
            ]}
          />
        </div>
      </Frame>

      <Frame name="icons" note={`Technology marks, one path each: ${Object.keys(ICONS).join(", ")}.`}>
        <Stack rows={[{ k: "Marks", items: Object.keys(ICONS).map((n) => ({ n, icon: n })) }]} />
      </Frame>

      <Frame name="Dumbbell" note="Two dots per row (a reference and a main value) and the gap between them.">
        <div className="bench-chart">
          <Dumbbell
            title="Title of the chart"
            valueTitle="Gap"
            max={60}
            ticks={[0, 20, 40, 60]}
            legend={["main", "reference"]}
            aria="Placeholder dumbbell chart"
            rows={[
              { label: "Label 1", base: 20, main: 50 },
              { label: "Label 2", base: 25, main: 45 },
              { label: "Label 3", base: 30, main: 42 },
              { label: "Label 4", base: 35, main: 40 },
            ]}
          />
        </div>
      </Frame>

      <Frame name="DotPlot" note="One dot per row on one axis; the first row is the one to look at.">
        <div className="bench-chart">
          <DotPlot
            title="Title of the chart"
            min={0}
            max={10}
            ticks={[0, 5, 10]}
            decimals={1}
            aria="Placeholder dot plot"
            rows={[
              { label: "Label 1", value: 2 },
              { label: "Label 2", value: 4 },
              { label: "Label 3", value: 5 },
              { label: "Label 4", value: 7 },
            ]}
          />
        </div>
      </Frame>

      <Frame name="Ticks" note="A row of small ticks, the first ones in blue; each rises in one after the other.">
        <div className="bench-chart">
          <Ticks total={20} count={12} leftLabel="Label" rightLabel="Label" aria="Twelve of twenty ticks are blue" />
        </div>
      </Frame>

      <Frame name="Scorecard" note="One row per item: a size (a dot, or a range with a flag), a pair of scores, or a short text.">
        <div className="bench-chart">
          <Scorecard
            headings={{ label: "Item", size: "Size", score: "Score, base vs main" }}
            sizeTicks={[0, 0.5, 1, 1.5]}
            scoreTicks={[0, 0.2, 0.4, 0.6]}
            sizeRef={1}
            aria="Placeholder scorecard"
            rows={[
              { label: "Item 1", sub: "A short line", size: 1, text: "Text" },
              { label: "Item 2", sub: "A short line", size: 0.8, score: [0.2, 0.5] },
              { label: "Item 3", sub: "A short line", score: [0.3, 0.4] },
              { label: "Item 4", sub: "A short line", size: [0.3, 0.6], flag: "Flag" },
            ]}
          />
        </div>
      </Frame>
    </main>
  );
}
