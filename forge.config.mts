import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import fs from "node:fs";
import path from "node:path";

const packagedExactPaths = new Set(["/node_modules", "/node_modules/@phc"]);

const packagedPathPrefixes = [
  "/.vite",
  "/node_modules/@phc/format",
  "/node_modules/argon2",
  "/node_modules/better-sqlite3-multiple-ciphers",
  "/node_modules/bindings",
  "/node_modules/file-uri-to-path",
  "/node_modules/node-gyp-build",
];

const packagedTopLevelModules = new Set([
  "@phc",
  "argon2",
  "better-sqlite3-multiple-ciphers",
  "bindings",
  "file-uri-to-path",
  "node-gyp-build",
]);

const shouldIgnorePackagedPath = (file: string) => {
  if (!file) {
    return false;
  }

  if (packagedExactPaths.has(file)) {
    return false;
  }

  return !packagedPathPrefixes.some(
    (prefix) => file === prefix || file.startsWith(`${prefix}/`),
  );
};

const removePackagedPath = (buildPath: string, relativePath: string) => {
  fs.rmSync(path.join(buildPath, relativePath), {
    recursive: true,
    force: true,
  });
};

const removeNonRuntimeNativeFiles = (buildPath: string) => {
  [
    "node_modules/argon2/argon2",
    "node_modules/argon2/argon2.cpp",
    "node_modules/argon2/argon2.d.cts",
    "node_modules/argon2/argon2.d.cts.map",
    "node_modules/argon2/bin",
    "node_modules/argon2/binding.gyp",
    "node_modules/argon2/build/argon2.target.mk",
    "node_modules/argon2/build/binding.Makefile",
    "node_modules/argon2/build/config.gypi",
    "node_modules/argon2/build/gyp-mac-tool",
    "node_modules/argon2/build/libargon2.target.mk",
    "node_modules/argon2/build/Makefile",
    "node_modules/argon2/build/Release/.deps",
    "node_modules/argon2/build/Release/.forge-meta",
    "node_modules/argon2/build/Release/argon2.a",
    "node_modules/argon2/build/Release/obj.target",
    "node_modules/argon2/prebuilds",
    "node_modules/argon2/README.md",
    "node_modules/better-sqlite3-multiple-ciphers/binding.gyp",
    "node_modules/better-sqlite3-multiple-ciphers/build/Release/.forge-meta",
    "node_modules/better-sqlite3-multiple-ciphers/deps",
    "node_modules/better-sqlite3-multiple-ciphers/index.d.ts",
    "node_modules/better-sqlite3-multiple-ciphers/README.md",
    "node_modules/better-sqlite3-multiple-ciphers/src",
    "node_modules/bindings/README.md",
    "node_modules/file-uri-to-path/.npmignore",
    "node_modules/file-uri-to-path/.travis.yml",
    "node_modules/file-uri-to-path/History.md",
    "node_modules/file-uri-to-path/index.d.ts",
    "node_modules/file-uri-to-path/README.md",
    "node_modules/file-uri-to-path/test",
    "node_modules/node-gyp-build/bin.js",
    "node_modules/node-gyp-build/build-test.js",
    "node_modules/node-gyp-build/optional.js",
    "node_modules/node-gyp-build/README.md",
    "node_modules/node-gyp-build/SECURITY.md",
  ].forEach((relativePath) => removePackagedPath(buildPath, relativePath));
};

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    ignore: shouldIgnorePackagedPath,
  },
  rebuildConfig: {},
  hooks: {
    packageAfterCopy: async (_config, buildPath) => {
      fs.cpSync(
        path.resolve("src/db/migrations"),
        path.join(buildPath, ".vite/migrations"),
        { recursive: true },
      );
    },
    packageAfterPrune: async (_config, buildPath) => {
      const nodeModulesPath = path.join(buildPath, "node_modules");

      if (!fs.existsSync(nodeModulesPath)) {
        return;
      }

      for (const item of fs.readdirSync(nodeModulesPath, {
        withFileTypes: true,
      })) {
        if (!packagedTopLevelModules.has(item.name)) {
          fs.rmSync(path.join(nodeModulesPath, item.name), {
            recursive: true,
            force: true,
          });
        }
      }

      const phcPath = path.join(nodeModulesPath, "@phc");
      if (!fs.existsSync(phcPath)) {
        return;
      }

      for (const item of fs.readdirSync(phcPath, { withFileTypes: true })) {
        if (item.name !== "format") {
          fs.rmSync(path.join(phcPath, item.name), {
            recursive: true,
            force: true,
          });
        }
      }

      removeNonRuntimeNativeFiles(buildPath);
    },
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
    new MakerDMG({}),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "jhacobs",
          name: "my-finance-app",
        },
        prerelease: true,
      },
    },
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
