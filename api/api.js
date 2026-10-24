export const Api = (() => {
  const baseUrl = "https://jsonplaceholder.typicode.com";
  const todospath = "todos";

  const checkOk = (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response;
  };

  // FIX: previously fetched ALL 200 placeholder todos with no limit.
  // FIX: previously no response.ok check and no error surfacing at all.
  const getTodos = () =>
    fetch([baseUrl, todospath].join("/") + "?_limit=20")
      .then(checkOk)
      .then((response) => response.json());

  const deleteTodo = (id) =>
    fetch([baseUrl, todospath, id].join("/"), {
      method: "DELETE",
    }).then(checkOk);

  const addTodo = (newtodo) =>
    fetch([baseUrl, todospath].join("/"), {
      method: "POST",
      body: JSON.stringify(newtodo),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then(checkOk)
      .then((response) => response.json());
  return {
    getTodos,
    deleteTodo,
    addTodo,
  };
})();
