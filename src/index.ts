import { h, render, Component } from "./myVnode/index";

// 函数式组件
const BoxItem = function (props: any) {
  return h("p", null, `我是函数式组件,我的名字叫${props.name}`);
};

// 有状态组件
class App extends Component {
  constructor() {
    super();
  }

  state = {
    name: "miracle",
  };

  clickHandler() {
     alert("我是box");
  }

  render() {
    return h(
      "div",
      {
        class: "box",
        id:'app',
        style: {
          background: "blue",
          color: "#fff",
        },
        onclick: this.clickHandler.bind(this),
      },
      [
        h(BoxItem, {
          name: this.state.name,
        }),
        h("p", null, "我是p标签"),
      ]
    );
  }
}

const $dom = document.getElementById("app");
const app = h(App);

$dom && render(app, $dom);
