let consoleOn = true;

const originalConsole = {
  log: console.log,
  group: console.group,
  groupCollapsed: console.groupCollapsed,
  groupEnd: console.groupEnd,
};

function updateConsoleState(state) {
  if (!state) {
    console.log = () => {};
    console.group = () => {};
    console.groupCollapsed = () => {};
    console.groupEnd = () => {};
  } else {
    console.log = originalConsole.log;
    console.group = originalConsole.group;
    console.groupCollapsed = originalConsole.groupCollapsed;
    console.groupEnd = originalConsole.groupEnd;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateConsoleState(consoleOn);
});
