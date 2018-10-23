const { configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

configure({ adapter: new Adapter() });

Object.assign(global, {
  requestAnimationFrame: foo => foo(),
});

