export interface ClassComponent {
  new (...args: any[]): any;
}

export class Component {
  _update() { }
  
  render() {
    throw "缺少render 函数";
  }
}
