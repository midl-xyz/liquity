import ReactDOM from "react-dom/client";
import Modal from "react-modal";

import App from "./App";
import "./index.css";

Modal.setAppElement("#root");

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(<App />);
