import { VNode, VNodeFLags, VNodeChildren } from "./vnode";
import { containerType, mount } from "./render";
import { isObejct } from "./utils";

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
    patchComponent(oldVNode, newVNode, container);
  } else if (newNodeFlag === VNodeFLags.TEXT) {
    patchText(oldVNode, newVNode);
  }
};

/**
 *
 * @param el
 * @param propKey
 * @param oldVal
 * @param newVal
 * patch props属性  包括样式 class 事件以及自定义属性
 *
 */
export function patchProps(el: any, propKey: string, oldVal: any, newVal: any) {
  switch (propKey) {
    case "style":
      /**
       * 更新样式
       */
      for (const key in newVal) {
        setStyle(el.style, key, newVal[key]);
      }
      for (const key in oldVal) {
        if (!newVal.hasOwnProperty(key)) {
          setStyle(el.style, key, "");
        }
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
  const el = (newVNode.el = oldVNode.el);
  const oldProps = oldVNode.data;
  const newProps = newVNode.data;
  // 将新增属性全部patch 再把不存在于新data上的key&&value 从oldProps上删除
  if (newProps) {
    for (const key in newProps) {
      const oldPropValue = oldProps && oldProps[key];
      const newPropValue = newProps && newProps[key];
      patchProps(el as HTMLElement, key, oldPropValue, newPropValue);
    }
  }
  if (oldProps) {
    for (const k in oldProps) {
      const oldValue = oldProps[k];
      if (oldValue && newProps && !newProps.hasOwnProperty(k)) {
        patchProps(el as HTMLElement, k, oldValue, null);
      }
    }
  }

  patchChildren(oldVNode.children, newVNode.children, el as HTMLElement);
}

function patchComponent(
  oldVNode: VNode,
  newVNode: VNode,
  container: containerType
) {}

// 只有文本内容不一样需要patch
function patchText(oldVNode: VNode, newVNode: VNode) {
  const el = (newVNode.el = oldVNode.el);
  if (
    typeof newVNode.children == "string" &&
    oldVNode.children !== newVNode.children
  ) {
    (el as HTMLElement).nodeValue = newVNode.children;
  }
}

function replaceVNode(
  oldVNode: VNode,
  newVNode: VNode,
  container: containerType
) {
  oldVNode.el && container.removeChild(oldVNode.el);
  mount(newVNode, container);
}

/**
 *
 * @param oldChildren
 * @param newChildren
 * @param container
 * 1. 老的children不存在 新的children存在 新的全部挂载
 * 2. 新的children不存在 老的children存在 老的全部卸载
 * 3. 新老同时存在 按情况处理
 */
function patchChildren(
  oldChildren: VNodeChildren = null,
  newChildren: VNodeChildren = null,
  container: HTMLElement
) {
  if (!oldChildren) {
    handleNoOldChildren(newChildren, container);
    return;
  }

  if (!newChildren) {
    handleNoNewChildren(oldChildren, container);
    return;
  }
  if (oldChildren && newChildren) {
    handleNormal(oldChildren, newChildren, container);
  }
}

function handleNoOldChildren(children: VNodeChildren, container: HTMLElement) {
  if (Array.isArray(children)) {
    children.forEach((vn) => mount(vn, container));
  } else if (children && typeof children === "object") {
    mount(children, container);
  }
}

function handleNoNewChildren(children: VNodeChildren, container: HTMLElement) {
  if (Array.isArray(children)) {
    children.forEach((vn) => container.removeChild(vn.el as HTMLElement));
  } else if (children && typeof children === "object") {
    container.removeChild(children.el as HTMLElement);
  }
}

// 新老children同时存在
function handleNormal(
  oldChildren: VNodeChildren,
  newChildren: VNodeChildren,
  container: HTMLElement
) {
  // 老数组新单节点
  if (Array.isArray(oldChildren) && isObejct(newChildren)) {
    oldChildren.forEach((vn) => container.removeChild(vn.el as HTMLElement));
    mount(newChildren as VNode, container);
  } else if (Array.isArray(newChildren) && isObejct(oldChildren)) {
    // 新数组旧单节点
    container.removeChild((oldChildren as VNode).el as HTMLElement);
    newChildren.forEach((vn) => mount(vn, container));
  } else if (Array.isArray(newChildren) && Array.isArray(oldChildren)) {
    // 多对多  todo diff算法
    oldChildren.forEach((vn) => container.removeChild(vn.el as HTMLElement));
    newChildren.forEach((vn) => mount(vn, container));
  }
}
