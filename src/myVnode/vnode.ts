type VNodeTag = string | Function;

type VNodeHelper = (
  tag: VNodeTag,
  props: VNodeData | null,
  children: VNodeChildren
) => VNode;

export type VNodeChildren = [] | {} | string | null;

export interface VNode {
  tag: VNodeTag;
  el?: HTMLElement;
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

  return {
    tag: tag,
    data: props,
    children,
    flag,
  };
};
