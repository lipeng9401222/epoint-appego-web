<template>
  <img v-if="url" :src="url" class="user-avatar" :style="{ width: width, height: height }" :title="props.name" />
  <span v-else class="user-avatar" :style="`width: ${width};height: ${height};line-height: ${height}`" :title="props.name">{{ realName }}</span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    url: string;
    bgColor?: string;
    width?: string;
    height?: string;
  }>(),
  {
    bgColor: '#2e6be5',
    width: '30px',
    height: '30px'
  }
);

// 先排除掉()内的内容，再取最后两个字符
const realName = computed(() => props.name?.replace(/\(.*\)/, '').slice(-2) ?? '');
</script>

<style lang="less" scoped>
.user-avatar {
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  font-size: 12px;
  // background: #5894f6;
  background: linear-gradient(180deg, #2370ef 0%, #9463fb 100%);
  border-radius: 50%;
  color: #fff;
  text-align: center;
  vertical-align: top;
}
</style>
