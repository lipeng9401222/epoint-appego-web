const modules = import.meta.glob('../views/**/**/*.vue');

const routerMap = Object.keys(modules).reduce((p, c) => {
  p[c.replace(/^..\/views\//, '')] = modules[c];
  return p;
}, {});

// routerMap['frame-ou/list.vue'] = modules['./views/frame-ou/list.vue'];

export { routerMap };
