"use client";

// Placeholder project: four slides built from the template's components, with dummy data.
import Deck, { Cols, CountUp, Flow, Shots } from "@/components/Deck";
import { placeholder } from "@/lib/placeholder";

export default function ProjectTwo() {
  return (
    <Deck
      slides={[
        {
          k: "Section one",
          body: (
            <>
              <p className="lead">One sentence that says what this is.</p>
              <ul className="kw3">
                <li><b>Word</b><span>A short line of text.</span></li>
                <li><b>Word</b><span>A short line of text.</span></li>
                <li><b>Word</b><span>A short line of text.</span></li>
              </ul>
              <ul className="tiles">
                <li><span className="n">0</span><span className="l">Label</span></li>
                <li><span className="n">0</span><span className="l">Label</span></li>
                <li><span className="n">0</span><span className="l">Label</span></li>
              </ul>
              <p className="note">A note under the slide.</p>
            </>
          ),
        },
        {
          k: "Section two",
          body: (
            <Cols>
              <div>
                <p className="lead small">A lead line for the left column.</p>
                <ul className="plain">
                  <li>Item 1</li>
                  <li>Item 2</li>
                  <li>Item 3</li>
                </ul>
              </div>
              <div>
                <table>
                  <thead>
                    <tr><th>Item</th><th>Label</th><th>Label</th></tr>
                  </thead>
                  <tbody>
                    <tr className="hi"><th>Item 1</th><td>0</td><td>0</td></tr>
                    <tr><th>Item 2</th><td>0</td><td>0</td></tr>
                    <tr><th>Item 3</th><td>0</td><td>0</td></tr>
                  </tbody>
                </table>
                <p className="note">A note under the table.</p>
              </div>
            </Cols>
          ),
        },
        {
          k: "Section three",
          body: (
            <>
              <Flow
                steps={[
                  "Group",
                  { n: "1", t: "Step one", d: "One line about the step" },
                  { n: "2", t: "Step two", d: "One line about the step", blue: true },
                  { n: "3", t: "Step three", d: "One line about the step", dash: true },
                ]}
              />
              <p className="note">A note under the steps.</p>
            </>
          ),
        },
        {
          k: "Section four",
          body: (
            <>
              <Shots
                items={[
                  { src: placeholder(600, 400), cap: "Caption" },
                  { src: placeholder(600, 400), cap: "Caption" },
                  { src: placeholder(300, 600), cap: "Caption", tall: true },
                ]}
              />
              <ul className="tiles">
                <li><span className="n"><CountUp to={10} /></span><span className="l">Label</span></li>
                <li><span className="n"><CountUp to={2.5} decimals={1} /></span><span className="l">Label</span></li>
              </ul>
            </>
          ),
        },
      ]}
    />
  );
}
