import { VNode, VNodeFLags } from "./vnode";
import { containerType, mount } from "./render";

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
    patchElement();
  } else if (
    newNodeFlag === VNodeFLags.STATEFUL_COMPONENT ||
    newNodeFlag === VNodeFLags.FUNCTIONAL_COMPONENT
  ) {
    patchComponent();
  } else if (newNodeFlag === VNodeFLags.TEXT) {
    patchText();
  }
};

function patchElement() {}
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
