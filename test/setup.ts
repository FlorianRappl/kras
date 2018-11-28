import * as Adapter from 'enzyme-adapter-react-16';
import { configure, shallow, render, mount } from 'enzyme';

// React 16 Enzyme adapter
configure({
  adapter: new Adapter(),
});

declare const global: any;

global.requestAnimationFrame = (cb: any) => setTimeout(cb, 0);
global.shallow = shallow;
global.render = render;
global.mount = mount;
