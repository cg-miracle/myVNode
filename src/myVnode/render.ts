import { VNode, VNodeFLags, VNodeData, VNodeChildren } from "./vnode";

type containerType = HTMLElement | null;

export function render(vnode: VNode, container: containerType) {
  if (!container) {
    throw new Error("miss container");
  }
  const { flag } = vnode;
  switch (flag) {
    case VNodeFLags.HTMLELEMENT:
      mountELement(vnode, container);
      break;
  }
}

function mountELement(vnode: VNode, container: containerType) {
  let { tag, data, children } = vnode;
  const $dom = document.createElement(tag as string);
  vnode.el = $dom;

  data && updateProps(vnode, data);
  children && updateChildren(children, container);
  container && container.appendChild($dom);
}

function updateProps(vnode: VNode, data: VNodeData) {
  const { el } = vnode;
  for (const propKey in data) {
    switch (propKey) {
      case "style":
        for (const key in data.style) {
          el && (el.style.cssText = data.style[key]);
        }
        break;
      case "class":
        el && data.class && (el.className = data.class);
        break;
      default:
        // on 开头当作事件处理
        if (propKey[0] === "o" && propKey[1] === "n") {
          const eventName = propKey.slice(2);
          const eventCb = data[propKey];
          document.addEventListener(eventName, eventCb);
        }
        break;
    }
  }
}

function updateChildren(children: VNodeChildren, container: containerType) {
  if (typeof children === "object") {
    
  }
}
