const net = require("net");
const path = require("path");
const fs = require("fs");

const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return values;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return values;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      values[key] = value;
      return values;
    }, {});
}

function parsePort(value, fallback) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : fallback;
}

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: "127.0.0.1" });

    socket.once("connect", () => {
      socket.destroy();
      resolve({ port, inUse: true });
    });

    socket.once("error", () => {
      resolve({ port, inUse: false });
    });
  });
}

async function main() {
  const envValues = readEnvFile(envPath);
  const serverHttpPort = parsePort(envValues.PORT, 3000);
  const gameserverHttpPort = parsePort(envValues.GAMESERVER_PORT, 4000);
  const ports = [
    serverHttpPort,
    serverHttpPort + 1,
    gameserverHttpPort,
    gameserverHttpPort + 1,
  ];

  const results = await Promise.all(ports.map(checkPort));
  const busyPorts = results.filter((result) => result.inUse).map((result) => result.port);

  if (busyPorts.length === 0) {
    return;
  }

  console.error(
    `Ports already in use: ${busyPorts.join(", ")}. Run \`npm run dev:stop\` or stop the previous BomberManos dev processes before running this command again.`
  );
  process.exit(1);
}

main();
