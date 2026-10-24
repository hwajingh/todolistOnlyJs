import { Api } from "./api/api.js";

const View = (() => {
  const domstr = {
    todolist: "#todolist_container",
    deletebtn: ".deletebtn",
    inputbox: ".todolist_input",
  };

  const render = (ele, tmp) => {
    ele.innerHTML = tmp;
  };

  // FIX: escape interpolated data. Previously ${todo.title} went raw into
  // innerHTML, so any "<" in data became markup (XSS).
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const createTmp = (arr) => {
    let tmp = "";
    arr.forEach((todo) => {
      tmp += `
        <li>
          <span>${todo.id}${escapeHtml(todo.title)}</span>
          <button class="deletebtn" id="${todo.id}">X</button>
        </li>
      `;
    });
    return tmp;
  };

  return {
    render,
    domstr,
    createTmp,
  };
})();

// MODEL
const Model = ((api, view) => {
  const { getTodos, deleteTodo, addTodo } = api;

  class Todo {
    constructor(title) {
      this.userId = 4;
      this.title = title;
      this.completed = false;
    }
  }

  class State {
    #todolist = [];

    get todolist() {
      return this.#todolist;
    }

    set todolist(newlist) {
      this.#todolist = [...newlist];

      const ulcontainer = document.querySelector(view.domstr.todolist);
      const tmp = view.createTmp(this.#todolist);
      view.render(ulcontainer, tmp);
    }
  }

  return { getTodos, deleteTodo, addTodo, State, Todo };
})(Api, View);

//controller
const Controller = ((model, view) => {
  const state = new model.State();

  const deleteTodo = () => {
    const ulconatiner = document.querySelector(view.domstr.todolist);
    ulconatiner.addEventListener("click", (event) => {
      // FIX: closest() so clicks on a child of the button still work.
      // Previously className === "deletebtn" silently missed those.
      // FIX: only remove locally AFTER the DELETE succeeds. Previously the
      // item was removed first, so a failed DELETE left local and server
      // state silently out of sync.
      const btn = event.target.closest(".deletebtn");
      if (btn) {
        const id = btn.id;
        model
          .deleteTodo(id)
          .then(() => {
            state.todolist = state.todolist.filter(
              (ele) => +ele.id !== +id
            );
          })
          .catch(() => {
            alert("Could not delete that todo. Please try again.");
          });
      }
    });
  };

  const addTodo = () => {
    const inputbox = document.querySelector(view.domstr.inputbox);
    inputbox.addEventListener("keyup", (event) => {
      if (event.code === "Enter" && event.target.value.trim() !== "") {
        const newtodo = new model.Todo(event.target.value.trim());
        model
          .addTodo(newtodo)
          .then((todofrombe) => {
            state.todolist = [todofrombe, ...state.todolist];
          })
          .catch(() => {
            alert("Could not add that todo. Please try again.");
          });
        event.target.value = "";
      }
    });
  };

  const init = () => {
    model
      .getTodos()
      .then((todos) => {
        state.todolist = todos;
      })
      .catch(() => {
        alert("Could not load todos. Please refresh and try again.");
      });
  };

  const bootstrap = () => {
    init();
    deleteTodo();
    addTodo();
  };

  return { bootstrap };
})(Model, View);

Controller.bootstrap();
