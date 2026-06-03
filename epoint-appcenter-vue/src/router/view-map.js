const modules = import.meta.glob('../views/**/**/*.vue');

const routerMap = Object.keys(modules).reduce((p, c) => {
  p[c.replace(/^..\/views\//, '')] = modules[c];
  return p;
}, {});

export { routerMap };
