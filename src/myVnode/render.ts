import { VNode, VNodeFLags, VNodeData, VNodeChildren, h } from "./vnode";
import { patch, patchProps } from "./patch";
import { ClassComponent } from "./Component";

export interface containerType extends HTMLElement {
  vnode?: VNode | null; //用来存放 oldVNode 方便对比
}

export function render(vnode: VNode, container: containerType) {
  const oldVNode = container.vnode;
  if (!oldVNode) {
    mount(vnode, container);
    container.vnode = vnode;
  } else {
    if (vnode) {
      // 新旧节点同时存在 对比差异进行patch
      patch(oldVNode, vnode, container);
      container.vnode = vnode;
    } else {
      // 只有旧节点没有新节点说明需要删除
      oldVNode.el && container.removeChild(oldVNode.el);
      container.vnode = null;
    }
  }
}

export function mount(vnode: VNode, container: containerType) {
  const { flag } = vnode;
  switch (flag) {
    case VNodeFLags.HTMLELEMENT:
      mountELement(vnode, container);
      break;
    case VNodeFLags.TEXT:
      mountText(vnode, container);
      break;
    case VNodeFLags.STATEFUL_COMPONENT:
      mountComponent(vnode, container);
      break;
    case VNodeFLags.FUNCTIONAL_COMPONENT:
      mountComponent(vnode, container);
      break;
  }
}

// 挂载组件
function mountComponent(vnode: VNode, container: containerType) {
  const { flag } = vnode;
  if (flag === VNodeFLags.STATEFUL_COMPONENT) {
    mountStatefulComponent(vnode, container);
  } else {
    mountFunctionalComponent(vnode, container);
  }
}

function mountStatefulComponent(vnode: VNode, container: containerType) {
  /**
   * 有状态组件此刻tag是一个class
   * 实例化组件 获取mount返回的vnode
   */
  const { tag, data } = vnode;
  const statefulComp = tag as ClassComponent;
  const instance = new statefulComp();
  instance._update = function () {
    if (instance._mounted) {
      const oldVNode = instance.$vnode;
      const newVnode = instance.render();
      patch(oldVNode, newVnode, instance.$vnode.el.parentNode);
    } else {
      instance.$vnode = instance.render(); // 方便获取挂载后的真实el元素
      mount(instance.$vnode, container);
      instance.$el = vnode.el = instance.$vnode.el;
      instance.$props = data;
      instance._mounted = true;
      // mounted 生命周期
      instance.componentDidMount && instance.componentDidMount();
    }
  };

  instance._update();
}

function mountFunctionalComponent(vnode: VNode, container: containerType) {
  const { tag, data } = vnode;

  const functionalComp = tag as Function;
  const $vnode = functionalComp(data);
  mount($vnode, container);
  vnode.el = $vnode.el;
}

// 挂载文本节点
function mountText(vnode: VNode, container: containerType) {
  let { children } = vnode;
  const $text = document.createTextNode(children as string);
  vnode.el = $text;
  container && container.appendChild($text);
}

// 挂载普通html 元素
function mountELement(vnode: VNode, container: containerType) {
  let { tag, data, children } = vnode;
  const $dom = document.createElement(tag as string);
  vnode.el = $dom;
  data && updateProps(vnode, data);
  children && updateChildren(children, $dom);
  container && container.appendChild($dom);
}

function updateProps(vnode: VNode, data: VNodeData) {
  for (const propKey in data) {
    patchProps(vnode.el as HTMLElement, propKey, null, data[propKey]);
  }
}

function updateChildren(children: VNodeChildren, container: containerType) {
  /**

   * children是单个对象就是single vnode
   * chilren是数组就是vnode array
   */
  if (Array.isArray(children)) {
    children.forEach((value) => mount(value, container));
  } else if (children && typeof children === "object") {
    mount(children, container);
  }
}
