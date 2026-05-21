const { execSync } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

function listProcesses() {
  const output = execSync("ps -eo pid=,ppid=,args=", {
    cwd: rootDir,
    encoding: "utf8",
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(\d+)\s+(.*)$/);

      if (!match) {
        return null;
      }

      return {
        pid: Number(match[1]),
        ppid: Number(match[2]),
        command: match[3],
      };
    })
    .filter(Boolean);
}

function isBomberManosDevProcess(processInfo) {
  const command = processInfo.command;

  if (!command.includes(rootDir)) {
    return false;
  }

  const markers = [
    `${path.sep}node_modules${path.sep}.bin${path.sep}concurrently`,
    `${path.sep}node_modules${path.sep}.bin${path.sep}nodemon`,
    `${path.sep}node_modules${path.sep}.bin${path.sep}npm-watch`,
    `${path.sep}node_modules${path.sep}.bin${path.sep}vite`,
    `${path.sep}node_modules${path.sep}.bin${path.sep}tsc --watch`,
    `${path.sep}server${path.sep}build${path.sep}index.js`,
    `${path.sep}gameserver${path.sep}build${path.sep}index.js`,
  ];

  return markers.some((marker) => command.includes(marker));
}

function buildChildrenMap(processes) {
  const children = new Map();

  for (const processInfo of processes) {
    const siblings = children.get(processInfo.ppid) ?? [];
    siblings.push(processInfo.pid);
    children.set(processInfo.ppid, siblings);
  }

  return children;
}

function collectDescendants(pid, childrenMap, seen) {
  const children = childrenMap.get(pid) ?? [];

  for (const childPid of children) {
    if (seen.has(childPid)) {
      continue;
    }

    seen.add(childPid);
    collectDescendants(childPid, childrenMap, seen);
  }
}

function killProcesses(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch (error) {
      if (error && error.code !== "ESRCH") {
        throw error;
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (process.platform === "win32") {
    console.error("`npm run dev:stop` is currently supported on Unix-like systems only.");
    process.exit(1);
  }

  const processes = listProcesses();
  const processMap = new Map(processes.map((processInfo) => [processInfo.pid, processInfo]));
  const childrenMap = buildChildrenMap(processes);
  const matchedPids = processes.filter(isBomberManosDevProcess).map((processInfo) => processInfo.pid);
  const allPids = new Set(matchedPids);

  for (const pid of matchedPids) {
    collectDescendants(pid, childrenMap, allPids);
  }

  allPids.delete(process.pid);
  allPids.delete(process.ppid);

  const orderedPids = Array.from(allPids).sort((left, right) => right - left);

  if (orderedPids.length === 0) {
    console.log("No BomberManos dev processes found.");
    return;
  }

  killProcesses(orderedPids, "SIGTERM");
  await sleep(1000);

  const remainingPids = orderedPids.filter((pid) => processMap.has(pid) && (() => {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  })());

  if (remainingPids.length > 0) {
    killProcesses(remainingPids, "SIGKILL");
  }

  console.log(`Stopped BomberManos dev processes: ${orderedPids.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
