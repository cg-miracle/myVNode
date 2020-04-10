import { h, render } from "./myVnode/index";

const $app = document.getElementById("app");

const $box = h("div", {}, "Hello world");
console.log($box)
render($box, $app);
