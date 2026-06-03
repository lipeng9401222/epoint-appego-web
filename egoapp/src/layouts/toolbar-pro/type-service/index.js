import { reactive } from 'vue';

import personnel from './personnel.vue';
import datepicker from './datepicker.vue';
import date from './date.vue';
import status from './status.vue';
import county from './county.vue';
import string1 from './string1.vue';
import string2 from './string2.vue';

export const baseComponents = {
  personnel,
  datepicker,
  date,
  status,
  county,
  string1,
  string2
};

// 创建响应式对象
export const ServiceType = reactive({ ...baseComponents });

// 提供扩展方法
export const extendServiceType = (components) => {
  Object.assign(ServiceType, components);
};
