// custom-validators.js
export const noSpaceValidator = (value, rule) => {
  // 直接去除前后空格
  const trimmedValue = value?.trim();
  // 判断是否为 null 或 undefined
  if (trimmedValue === 'null' || trimmedValue === 'undefined') {
    return new Error('不能为null或undefined');
  }
  if (!trimmedValue) {
    // 如果去除前后空格后为空，则返回错误
    return new Error(rule?.errorText || '该字段不能为空');
  }

  return true; // 验证通过
};

// 应用标识验证
export const apptagValidator = (value, rule) => {
  // 直接去除前后空格
  const trimmedValue = value?.trim();
  
  // 1. 判断是否为 null 或 undefined（字符串形式）
  if (trimmedValue === 'null' || trimmedValue === 'undefined') {
    return new Error('不能为null或undefined');
  }
  
  // 2. 校验是否为空（去除空格后）
  if (!trimmedValue) {
    return new Error(rule?.errorText || '该字段不能为空');
  }
  
  // 3. 新增：校验格式（以字母开头，仅包含数字、字母、下划线）
  const formatReg = /^[a-zA-Z]\w*$/;
  if (!formatReg.test(trimmedValue)) {
    return new Error('必须以字母开头，由数字、字母和下划线组成');
  }

  return true; // 所有验证通过
};
