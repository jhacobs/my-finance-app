import { app, BrowserWindow } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { handleMainEvents } from "./app/main-events";
import { initializeAppConfig } from "./config/config";
import { logoutUser } from "./app/auth/logout";
import { NotificationEventType } from "./models/notification";

let mainWindow: BrowserWindow | null = null;

export const sendOnboardingNeededEvent = () => {
  if (!mainWindow) {
    return;
  }

  mainWindow.webContents.send("auth:onboarding-needed");
};

export const sendLoginNeededEvent = () => {
  if (!mainWindow) {
    return;
  }

  mainWindow.webContents.send("auth:login-needed");
};

export const sendNotificationEvent = (
  type: NotificationEventType,
  message: string,
) => {
  if (!mainWindow) {
    return;
  }

  mainWindow.webContents.send(`notification:${type}`, message);
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

if (process.platform === "win32") {
  app.setAppUserModelId("com.squirrel.MyFinanceApp.MyFinanceApp");
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: "/assets/icons/icon.png",
    webPreferences: {
      preload: path.resolve(app.getAppPath(), ".vite/build/preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(`.vite/renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  initializeAppConfig();
  handleMainEvents();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  logoutUser();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
