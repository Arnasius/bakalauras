let storage;

function load() {
  storage = JSON.parse(localStorage.getItem("guiConfig"));
}

function get(key) {
  if (!storage) load();
  if (storage) return storage[key];
}

function set(key, value) {
  storage = storage ? { ...storage, [key]: value } : { [key]: value };
  localStorage.setItem("guiConfig", JSON.stringify(storage));
}

function remove(value) {
  delete storage[value];
  localStorage.setItem("guiConfig", JSON.stringify(storage));
}

export default { get, set, load, remove };
