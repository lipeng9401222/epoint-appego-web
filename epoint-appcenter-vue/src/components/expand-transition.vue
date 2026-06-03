<template>
  <Transition name="expand" @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" @before-leave="beforeLeave" @leave="leave" @after-leave="afterLeave">
    <slot></slot>
  </Transition>
</template>
<script lang="ts" setup>
const beforeEnter = (el: any) => {
  el.classList.add('theme-collapse-transition');
  if (!el.dataset) el.dataset = {};

  el.dataset.oldPaddingTop = el.style.paddingTop;
  el.dataset.oldPaddingBottom = el.style.paddingBottom;

  el.style.height = '0';
  el.style.paddingTop = 0;
  el.style.paddingBottom = 0;
  el.style.opacity = 0;
};
const enter = (el: any) => {
  el.dataset.oldOverflow = el.style.overflow;
  if (el.scrollHeight !== 0) {
    el.style.height = `${el.scrollHeight}px`;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  } else {
    el.style.height = '';
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  }
  el.style.opacity = 1;

  el.style.overflow = 'hidden';
};
const afterEnter = (el: any) => {
  el.classList.remove('theme-collapse-transition');
  el.style.height = '';
  el.style.overflow = el.dataset.oldOverflow;
  el.style.opacity = '';
};
const beforeLeave = (el: any) => {
  if (!el.dataset) {
    el.dataset = {};
  }
  // 记录原始状态
  el.dataset.oldPaddingTop = el.style.paddingTop;
  el.dataset.oldPaddingBottom = el.style.paddingBottom;
  el.dataset.oldOverflow = el.style.overflow;

  // 设置高度 和 移除不可见
  el.style.height = `${el.scrollHeight}px`;
  el.style.overflow = 'hidden';
  el.style.opacity = 1;
};
const leave = (el: any) => {
  // 离开时 加过渡样式 设值终点状态
  if (el.scrollHeight !== 0) {
    el.classList.add('theme-collapse-transition');
  }
  el.style.height = 0;
  el.style.paddingTop = 0;
  el.style.paddingBottom = 0;
  el.style.opacity = 0;
};
const afterLeave = (el: any) => {
  // 离开完成 移除过渡样式 恢复原始属性
  el.style.height = '';
  el.style.overflow = el.dataset.oldOverflow;
  el.style.paddingTop = el.dataset.oldPaddingTop;
  el.style.paddingBottom = el.dataset.oldPaddingBottom;
  el.style.opacity = '';
};
</script>
<style lang="less">
.theme-collapse-transition {
  transition: all 0.3s ease-in-out;
}
</style>