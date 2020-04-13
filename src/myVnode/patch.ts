import { VNode, VNodeFLags } from "./vnode";
import { containerType, mount } from "./render";
import { setPriority } from "os";

// 对比新旧节点差异，将改动部分打补丁
export const patch = function (
  oldVNode: VNode,
  newVNode: VNode,
  container: containerType
) {
  const oldNodeFlag = oldVNode.flag;
  const newNodeFlag = newVNode.flag;
  // 如果节点类型不一样直接替换
  if (oldNodeFlag != newNodeFlag) {
    replaceVNode(oldVNode, newVNode, container);
  } else if (newNodeFlag === VNodeFLags.HTMLELEMENT) {
    patchElement(oldVNode, newVNode, container);
  } else if (
    newNodeFlag === VNodeFLags.STATEFUL_COMPONENT ||
    newNodeFlag === VNodeFLags.FUNCTIONAL_COMPONENT
  ) {
    patchComponent();
  } else if (newNodeFlag === VNodeFLags.TEXT) {
    patchText();
  }
};

export function patchProps(
  el: any,
  propKey: string,
  oldVal: any,
  newVal: any
) {
  switch (propKey) {
    case "style":
      for (const key in newVal) {
        el && (el.style.cssText += `${key}:${newVal[key]}`);
      }
      break;
    case "class":
      el && newVal && (el.className = newVal);
      break;
    default:
      // on 开头当作事件处理
      if (propKey[0] === "o" && propKey[1] === "n") {
        const eventName = propKey.slice(2);
        if (oldVal) {
          el.removeEventListener(eventName, oldVal);
        }
        if (newVal) {
          el.addEventListener(eventName, oldVal);
        }
      } else if (propKey in el) {
        // 参考 input checked= true 用setAttribute 不能出了boolean值
        el[propKey] = newVal;
      } else {
        el.setAttribute(propKey, newVal);
      }
      break;
  }
}

function setStyle(style: CSSStyleDeclaration, name: string, value: string) {
  style.setProperty(name, value);
}

function patchElement(
  oldVNode: VNode,
  newVNode: VNode,
  container: containerType
) {
  // tag 不一样如div ul放弃对比  直接替换
  if (oldVNode.tag != newVNode.tag) {
    replaceVNode(oldVNode, newVNode, container);
    return;
  }
  const el = (oldVNode.el = newVNode.el);
  const oldProps = oldVNode.data;
  const newProps = newVNode.data;
  if (newProps) {
    for (const key in newProps) {
      const oldPropValue = oldProps && oldProps[key];
      const newPropValue = newProps && newProps[key];
      patchProps(el as HTMLElement, key, oldPropValue, newPropValue);
    }
  }
}

function patchComponent() {}
function patchText() {}

function replaceVNode(
  oldVNode: VNode,
  newVNode: VNode,
  container: containerType
) {
  oldVNode.el && container.removeChild(oldVNode.el);
  mount(newVNode, container);
}
