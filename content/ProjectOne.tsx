"use client";

// Placeholder project: five slides built from the template's components, with dummy data.
import Deck, { CountUp, Stack } from "@/components/Deck";
import Arch from "@/components/Arch";
import { DotPlot, Dumbbell, Scorecard, Ticks } from "@/components/charts";

export default function ProjectOne() {
  return (
    <Deck
      slides={[
        {
          k: "Section one",
          body: (
            <>
              <div className="hero">
                <span className="big"><CountUp to={50} /> <i>/ 100</i></span>
                <p className="lead small">A line that says what the big number means.</p>
              </div>
              <div className="bench-chart">
                <Ticks total={20} count={12} leftLabel="Label" rightLabel="Label" aria="Twelve of twenty ticks are blue" />
              </div>
              <ul className="tiles">
                <li><span className="n"><CountUp to={10} /></span><span className="l">Label</span></li>
                <li><span className="n"><CountUp to={20} /></span><span className="l">Label</span></li>
                <li><span className="n"><CountUp to={30} /></span><span className="l">Label</span></li>
              </ul>
              <p className="note">A note under the slide: where the numbers come from and what they do not show.</p>
            </>
          ),
        },
        {
          k: "Section two",
          body: (
            <div className="bench-chart arch">
              <Arch
                title="Container view · Project one"
                aria="Placeholder architecture diagram"
                stages={[
                  { zone: "Zone one", flow: true, link: "what travels", items: [
                    { t: "Item 1", tech: "Tech", icon: "python", d: "One line about what it does" },
                    { t: "Item 2", tech: "Tech", own: true, d: "One line about what it does" },
                    { t: "Item 3", tech: "Tech", icon: "react", d: "One line about what it does" },
                  ] },
                  { zone: "Zone two", items: [
                    { t: "Item 4", tech: "Tech", icon: "nextdotjs", own: true, d: "One line about what it does" },
                  ] },
                ]}
              />
            </div>
          ),
        },
        {
          k: "Section three",
          body: (
            <>
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
              <p className="note">A note under the charts.</p>
            </>
          ),
        },
        {
          k: "Section four",
          body: (
            <>
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
              <p className="note">A note under the scorecard.</p>
            </>
          ),
        },
        {
          k: "Section five",
          body: (
            <Stack
              rows={[
                { k: "Layer 1", items: [{ n: "Item 1" }, { n: "Item 2" }, { n: "Item 3" }] },
                { k: "Layer 2", items: [{ n: "Item 1", s: "Detail", icon: "python" }, { n: "Item 2", s: "Detail", icon: "react" }] },
                { k: "Layer 3", items: [{ n: "Item 1", icon: "typescript", own: true }, { n: "Item 2", icon: "nextdotjs", own: true }, { n: "Item 3", own: true }] },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
