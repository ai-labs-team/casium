process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');
const enzyme = require('enzyme');
const { render, shallow, mount } = enzyme;

chai.use(chaiEnzyme());

Object.assign(global, {
  expect: chai.expect,
  mount,
  render,
  shallow,
});
