const eq = [
  {
    label: '等于',
    value: 'eq'
  },
  {
    label: '不等于',
    value: 'not-eq'
  }
];

const contain = [
  {
    label: '包含',
    value: 'contain'
  },
  {
    label: '不包含',
    value: 'not-contain'
  }
];

const isNull = [
  {
    label: '为空',
    value: 'is-null'
  },
  {
    label: '不为空',
    value: 'not-null'
  }
];
export default {
  1: [...eq, ...isNull],
  2: contain,
  3: [...eq, ...contain, ...isNull],
  4: [...eq, ...contain]
};
