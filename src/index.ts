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
    isChange: false,
  };

  componentDidMount() {
    setTimeout(() => {
      this.state.name = "oishi22222";
      this.state.isChange = true;
      this._update(); // 主动触发更新
    }, 1000);
  }

  clickHandler() {
    alert("我是box");
  }

  render() {
    return h(BoxItem, {
      name: this.state.name,
    });
    return h(
      "div",
      {
        class: "box",
        id: "app",
        style: {
          background: this.state.isChange ? "red" : "blue",
          color: "#fff",
        },
        onclick: this.clickHandler.bind(this),
      },
      [
        h(BoxItem, {
          name: this.state.name,
        }),
        h("p", null, "我是p1标签"),
      ]
    );
  }
}

const $dom = document.getElementById("app");
const app = h(App);
$dom && render(app, $dom);
// setTimeout(() => {
//   $dom && render(app2, $dom);
// }, 1000);

// const prevVNode = h("div", null, [h("p", null, "22222"), h("p", null, "3333")]);

// const nextVNode = h("div", null, [
//   h("p", null, "444444"),
//   h("p", null, "655555"),
// ]);

// $dom && render(prevVNode, $dom);
// setTimeout(() => {
//   $dom && render(nextVNode, $dom);
// }, 1000);
