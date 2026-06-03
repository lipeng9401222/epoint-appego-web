<template>
  <e-config-provider v-bind="configProviderParams" :form="{ bordered: false }">
    <router-view />
  </e-config-provider>
</template>

<script setup>
import { configProviderParams } from '@epframe/eui-core';
</script>
<style>
.block-loading {
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 9990;
  background-color: #fff;
}
.block-loading .block-loading-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.block-loading .block-loading-box-warp {
  width: 80px;
  height: 80px;
}

.block-loader {
  --d: 22px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  color: var(--theme-color, #2e6be5);
  box-shadow:
    calc(1 * var(--d)) calc(0 * var(--d)) 0 0,
    calc(0.707 * var(--d)) calc(0.707 * var(--d)) 0 1px,
    calc(0 * var(--d)) calc(1 * var(--d)) 0 2px,
    calc(-0.707 * var(--d)) calc(0.707 * var(--d)) 0 3px,
    calc(-1 * var(--d)) calc(0 * var(--d)) 0 4px,
    calc(-0.707 * var(--d)) calc(-0.707 * var(--d)) 0 5px,
    calc(0 * var(--d)) calc(-1 * var(--d)) 0 6px;
  animation: l27 1s infinite steps(8);
}
@keyframes l27 {
  100% {
    transform: rotate(1turn);
  }
}
</style>
