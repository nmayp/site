import Scene from "@/components/Scene";
import SeeMore from "@/components/SeeMore";
import ProjectOne from "@/content/ProjectOne";
import ProjectTwo from "@/content/ProjectTwo";
import { site } from "@/content/site";

// Each direct child of <Scene> is one text block; each press moves to the next one.
export default function Page() {
  return (
    <main>
      <header className="chrome">
        <span className="mark">{site.name}</span>
        <span className="where">{site.place}</span>
      </header>
      <Scene>
        <div>
          <span className="eyebrow">Hello</span>
          <h1>{site.name}</h1>
        </div>
        <div>
          <span className="eyebrow">About</span>
          <p>{site.line}</p>
        </div>
        <div className="plist">
          <span className="eyebrow">Work</span>
          <p>A line about the list</p>
          <ul>
            <li>
              <SeeMore label="Project one" title="Project one" note="A short note about this project.">
                <ProjectOne />
              </SeeMore>
              <span className="kind">Tag</span>
            </li>
            <li>
              <SeeMore label="Project two" title="Project two" note="A short note about this project.">
                <ProjectTwo />
              </SeeMore>
              <span className="kind">Tag</span>
            </li>
          </ul>
        </div>
      </Scene>
    </main>
  );
}
