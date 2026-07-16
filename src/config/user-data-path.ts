import { app } from "electron";
import path from "node:path";

// Keep existing encrypted databases and authentication metadata discoverable
// after changing the user-facing product name.
app.setPath("userData", path.join(app.getPath("appData"), "my-finance"));
