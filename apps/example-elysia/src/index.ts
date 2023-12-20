import { generateId } from "@bunlive/core";
import { ElysiaWebSocketHandler, getWSID } from "@bunlive/elysia-handler";
import Elysia from "elysia";
import { indexRouter } from "./routers";

const app = new Elysia();
app.use(indexRouter);

const connections: Map<string, ElysiaWebSocketHandler> = new Map();

app.ws("/live", {
  open: (ws) => {
    const clientID = generateId();
    const handler = new ElysiaWebSocketHandler(ws as any);
    handler.setID(clientID);
    connections.set(clientID, handler);

    handler.onConnectionOpen();
  },
  message: (ws, message) => {
    const id = getWSID(ws as any);

    const handler = connections.get(id);

    if (!handler) {
      return;
    }

    handler.onMessageReceived(message);
  },
  close: (ws) => {
    const id = getWSID(ws as any);

    const handler = connections.get(id);

    if (!handler) {
      return;
    }

    handler.onConnectionClosed();

    connections.delete(id);
  },
});

app.listen(3000, () => console.log("Server is running on port 3000"));
