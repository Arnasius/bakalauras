var listeners = {};

function emitEvent(name, data) {
  let listenGroup = listeners[name];
  if (!listenGroup) return;

  listenGroup.forEach((listenCb) => listenCb(data, name));
}

function onEvent(name, fn) {
  let listenGroup = listeners[name];
  if (!listenGroup) listenGroup = listeners[name] = [];

  listenGroup.push(fn);

  return () => {
    let index = listenGroup.indexOf(fn);
    if (index === -1) return;
    listenGroup.splice(index, 1);
  };
}

export default {
  emit: emitEvent,
  on: onEvent,
};
