process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');
const enzyme = require('enzyme');
const adapter = require('enzyme-adapter-react-15');
const { render, shallow, mount } = enzyme;

enzyme.configure({ adapter: new adapter() });

chai.use(chaiEnzyme());

Object.assign(global, {
  expect: chai.expect,
  mount,
  render,
  shallow,
});
