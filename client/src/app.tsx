import _ from "lodash-es";

import "./app.scss";
import { responses } from "./content/responses";

export function App() {
  console.log(_.chunk(_.shuffle(responses), 7));
  console.log(responses.length);

  return <>h</>;
}
