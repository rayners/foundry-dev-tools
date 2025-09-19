import { createFoundryTestConfig } from './index.js';

export default createFoundryTestConfig({
  test: {
    include: ['test/**/*.test.js'],
    environment: 'node'
  }
});
