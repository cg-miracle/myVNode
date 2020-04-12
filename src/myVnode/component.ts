export interface ClassComponent {
  new (...args: any[]): any;
}

export class Component {
  render() {
    throw "缺少render 函数";
  }
}
