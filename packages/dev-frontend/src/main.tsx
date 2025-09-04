import ReactDOM from "react-dom/client";
import Modal from "react-modal";
import { ErrorScreen } from "./pages/ErrorScreen";

import App from "./App";
import "./index.css";

Modal.setAppElement("#root");

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

const isMaintenance = import.meta.env.VITE_APP_MAINTENANCE === "true";

root.render(
  isMaintenance ? (
    <ErrorScreen
      buttonHref="https://midl.xyz/"
      name="Maintenance"
      description="Please wait for 15 minutes - we'll be back soon"
    />
  ) : (
    <App />
  )
);
