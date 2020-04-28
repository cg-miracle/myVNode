import { Component } from "./Component";

type VNodeTag = string | Function | Component | null;

type VNodeHelper = (
  tag: VNodeTag,
  props?: VNodeData | null,
  children?: VNodeChildren
) => VNode;

export type VNodeChildren = VNode[] | VNode | string | null;

export interface VNode {
  _isVNode: Boolean;
  tag: VNodeTag;
  el?: HTMLElement | Text;
  data: VNodeData | null;
  flag: VNodeFLags; // VNode 类型
  children?: VNodeChildren;
}

export interface VNodeData {
  class?: string; // dom class 属性
  style?: {
    [key: string]: string;
  }; // 样式属性
  [key: string]: any;
}

// 简陋版 只考虑3种（html，状态组建,函数组建）
// 如svg Fragment Protal等不考虑
export enum VNodeFLags {
  HTMLELEMENT,
  TEXT,
  STATEFUL_COMPONENT,
  FUNCTIONAL_COMPONENT,
}

// 生成vnode的辅助函数
export const h: VNodeHelper = function (tag, props = null, children = null) {
  let flag = VNodeFLags.HTMLELEMENT;
  if (typeof tag == "string") {
    flag = VNodeFLags.HTMLELEMENT;
  } else if (typeof tag == "function") {
    flag =
      tag.prototype && tag.prototype.render
        ? VNodeFLags.STATEFUL_COMPONENT
        : VNodeFLags.FUNCTIONAL_COMPONENT;
  } else {
    flag = VNodeFLags.TEXT;
  }

  // 如果children是字符串 当作text vnode处理
  if (typeof children === "string") {
    children = createTextNode(children);
  }

  return {
    _isVNode: true,
    tag,
    children,
    flag,
    data: props,
  };
};

function createTextNode(text: string): VNode {
  return {
    _isVNode: true,
    tag: null,
    data: null,
    flag: VNodeFLags.TEXT,
    children: text,
  };
}
