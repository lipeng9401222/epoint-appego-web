<template>
  <div class="filter-panel" ref="filterPanelRef">
    <!-- 开发商筛选行 -->
    <div class="filter-row">
      <div class="filter-label">开发商</div>
      <div class="filter-content">
        <div class="filter-tags">
          <span
            class="filter-tag"
            :class="{ active: !selectedDeveloperId }"
            @click="onSelectDeveloper(null)"
          >
            不限
          </span>
          <!-- 顶级开发商 -->
          <span
            v-for="item in allDevelopers"
            :key="item.id"
            class="filter-tag cascade-trigger"
            :class="{
              active: selectedDeveloperId === item.id || (cascadeParentId === item.id && cascadeSelectedPath)
            }"
            @click="onDeveloperClick($event, item)"
          >
            {{ item.text }}{{ cascadeParentId === item.id && cascadeSelectedPath ? '/' + cascadeSelectedPath : '' }}
          </span>
        </div>
      </div>
      <!-- 收起/展开 -->
      <div class="filter-toggle-wrap">
        <div class="filter-toggle" @click="expanded = !expanded">
          {{ expanded ? '收起' : '展开' }}
          <span class="toggle-arrow" :class="{ 'is-expanded': expanded }">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.179768 0.264748C0.44933 -0.0347481 0.921065 -0.0679067 1.23555 0.187735L5.98996 4.06835L10.7444 0.187735C10.8184 0.123039 10.9054 0.0731905 11.0001 0.041157C11.0948 0.00912346 11.1953 -0.00444038 11.2956 0.00127241C11.3959 0.00698521 11.4939 0.0318581 11.584 0.0744106C11.674 0.116963 11.7541 0.176325 11.8195 0.248964C11.8849 0.321604 11.9343 0.406034 11.9648 0.497232C11.9952 0.58843 12.0061 0.68453 11.9968 0.779813C11.9874 0.875096 11.958 0.967614 11.9104 1.05186C11.8627 1.13611 11.7977 1.21036 11.7193 1.2702L6.47742 5.54872C6.34166 5.65951 6.16876 5.72041 5.98996 5.72041C5.81117 5.72041 5.63827 5.65951 5.50251 5.54872L0.26176 1.2702C0.110965 1.14717 0.0176249 0.972167 0.00225066 0.783635C-0.0131236 0.595104 0.0507252 0.408472 0.179768 0.264748Z" fill="#7D8DA6"/>
              <path d="M0.179768 4.54327C0.44933 4.24377 0.921065 4.21062 1.23555 4.46626L5.98996 8.34688L10.7444 4.46626C10.8953 4.34314 11.0913 4.28214 11.2894 4.29668C11.4875 4.31123 11.6714 4.40012 11.8007 4.54381C11.93 4.68749 11.9941 4.8742 11.9788 5.06286C11.9635 5.25152 11.8702 5.42667 11.7193 5.54979L6.47742 9.82831C6.34166 9.93911 6.16876 10 5.98996 10C5.81117 10 5.63827 9.93911 5.50251 9.82831L0.26176 5.54979C0.110965 5.42677 0.0176249 5.25176 0.00225066 5.06323C-0.0131236 4.8747 0.0507252 4.68806 0.179768 4.54434V4.54327Z" fill="#7D8DA6"/>
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- 应用分类筛选行 -->
    <template v-for="(level, levelIndex) in categoryLevels" :key="levelIndex">
      <div
        class="filter-row"
        :class="{ 'no-border': levelIndex === 0 && categoryLevels.length > 1, 'sub-filter-row': levelIndex > 0 }"
        v-show="expanded && level.length"
      >
        <div class="filter-label" :class="{ 'empty-label': levelIndex > 0 }">{{ levelIndex === 0 ? '应用分类' : '' }}</div>
        <div class="filter-content">
          <div class="filter-tags">
            <span
              class="filter-tag"
              :class="{ active: !selectedCategoryPath[levelIndex] }"
              @click="onSelectCategoryUnlimited(levelIndex)"
            >
              不限
            </span>
            <span
              v-for="item in level"
              :key="item.id"
              class="filter-tag"
              :class="{ active: selectedCategoryPath[levelIndex] && selectedCategoryPath[levelIndex].id === item.id }"
              @click="onSelectCategory(item, levelIndex)"
            >
              {{ item.text }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- 开发商级联弹窗 -->
    <teleport to="body">
      <div
        v-show="showCascader"
        ref="cascaderRef"
        class="dev-cascade-popover"
        :style="cascaderPos"
      >
        <template v-for="(col, colIdx) in visibleColumns" :key="colIdx">
          <div class="cascade-col" v-if="col && col.length">
            <div
              v-for="item in col"
              :key="item.id"
              class="cascade-node"
              :class="{
                selected: activeNodes[colIdx] && activeNodes[colIdx].id === item.id,
                disabled: item.disabled
              }"
              @click="onNodeClick(item, colIdx)"
            >
              <span class="cascade-node-label">{{ item.text }}</span>
              <span v-if="!item.isleaf" class="cascade-node-arrow"></span>
            </div>
          </div>
        </template>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { getDevelopersTree, getClassListLazy } from '../api';

const props = defineProps({
  appType: {
    type: String,
    default: 'app'
  },
  source: {
    type: String,
    default: ''
  },
  currentGuid: {
    type: String,
    default: ''
  },
  developerstag: {
    type: String,
    default: ''
  },
  useMockData: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change']);

// ========== 模拟多层级开发商数据 ==========
const MOCK_DEVELOPER_TREE = [
  { id: 'xd', text: '新点', isleaf: true, pid: '' },
  {
    id: 'zjc', text: '中建材', isleaf: false, pid: '',
    children: [
      {
        id: 'zjc-sh', text: '上海分公司', isleaf: false, pid: 'zjc',
        children: [
          { id: 'zjc-sh-1', text: '上海中一建', isleaf: true, pid: 'zjc-sh' },
          { id: 'zjc-sh-2', text: '上海中二建', isleaf: true, pid: 'zjc-sh' },
        ]
      },
      {
        id: 'zjc-bj', text: '北京分公司', isleaf: false, pid: 'zjc',
        children: [
          {
            id: 'zjc-bj-zy', text: '北京中一建', isleaf: false, pid: 'zjc-bj',
            children: [
              { id: 'zjc-bj-zy-cy', text: '中一建朝阳分公司', isleaf: true, pid: 'zjc-bj-zy' },
            ]
          },
          { id: 'zjc-bj-ze', text: '北京中二建', isleaf: true, pid: 'zjc-bj' },
          { id: 'zjc-bj-zs', text: '北京中三建', isleaf: true, pid: 'zjc-bj' },
          { id: 'zjc-bj-zsi', text: '北京中四建', isleaf: true, pid: 'zjc-bj', disabled: true },
          {
            id: 'zjc-bj-zw', text: '北京中五建', isleaf: false, pid: 'zjc-bj',
            children: [
              {
                id: 'zjc-bj-zw-cy', text: '中五建朝阳子公司', isleaf: false, pid: 'zjc-bj-zw',
                children: [
                  { id: 'zjc-bj-zw-cy-1', text: '朝阳一分部', isleaf: true, pid: 'zjc-bj-zw-cy' },
                ]
              },
              {
                id: 'zjc-bj-zw-sh', text: '中五建四环分公司', isleaf: false, pid: 'zjc-bj-zw',
                children: [
                  { id: 'zjc-bj-zw-sh-1', text: '四环一分部', isleaf: true, pid: 'zjc-bj-zw-sh' },
                ]
              },
            ]
          },
        ]
      },
      { id: 'zjc-gz', text: '广州分公司', isleaf: true, pid: 'zjc', disabled: true },
    ]
  },
];

// ========== 状态 ==========
const filterPanelRef = ref(null);
const expanded = ref(true);

// --- 开发商 ---
const allDevelopers = ref([]);
const selectedDeveloperId = ref('');
const cascadeParentId = ref(''); // 当前级联展开的顶级开发商id
const cascadeSelectedPath = ref(''); // 级联选中的路径文本 如"北京分公司/北京中一建"

// --- 级联弹窗 ---
const showCascader = ref(false);
const cascaderRef = ref(null);
const cascaderPos = reactive({ top: '0px', left: '0px' });
const activeNodes = ref({}); // { 0: node, 1: node, 2: node, ... }
const columnsData = ref({}); // { 0: [...], 1: [...], 2: [...], ... }

const visibleColumns = computed(() => {
  const cols = [];
  for (let i = 0; i <= 5; i++) {
    if (columnsData.value[i] && columnsData.value[i].length) {
      cols.push(columnsData.value[i]);
    } else {
      break;
    }
  }
  return cols;
});

// --- 应用分类 ---
const categoryLevels = ref([]);
const selectedCategoryPath = ref([]);
const categoryBaseCode = ref('');
const selectedClassCode = ref('');
const lastEmittedClassCode = ref('');

const getResponseList = (res) => {
  const data = res?.data ?? res ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.children)) return data.children;
  return [];
};

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

const normalizeDeveloper = (item, parentId = '') => {
  const children = Array.isArray(item.children) ? item.children.map(child => normalizeDeveloper(child, item.id || item.guid || item.rowguid || item.value || '')) : null;
  return {
    id: item.id || item.guid || item.rowguid || item.value || '',
    text: item.text || item.name || item.label || item.developername || item.developersname || '',
    pid: item.pid || item.parentguid || item.parentid || parentId,
    isleaf: toBoolean(item.isleaf, !(children && children.length)),
    disabled: toBoolean(item.disabled || item.isdisabled),
    children
  };
};

const normalizeCategory = (item) => ({
  ...item,
  id: item.id || item.guid || item.rowguid || item.value || item.classcode || '',
  text: item.text || item.name || item.label || item.classname || item.title || ''
});

const getInitialClassCode = () => {
  const currentGuid = props.currentGuid || '';
  return ['', 'f9root', 'myapp', 'recycled'].includes(currentGuid) ? '' : currentGuid;
};

// ========== 生命周期 ==========
onMounted(async () => {
  await fetchDevelopers();
  await initCategoryLevels();
  document.addEventListener('click', onGlobalClick, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onGlobalClick, true);
});

const onGlobalClick = (e) => {
  if (!showCascader.value) return;
  // 点击弹窗内部不关闭
  if (cascaderRef.value && cascaderRef.value.contains(e.target)) return;
  // 点击触发器不关闭（由触发器自行处理）
  if (filterPanelRef.value && filterPanelRef.value.contains(e.target)) return;
  showCascader.value = false;
};

// ========== 数据获取 ==========
const fetchDevelopers = async () => {
  if (props.useMockData) {
    allDevelopers.value = MOCK_DEVELOPER_TREE;
    return;
  }
  try {
    const res = await getDevelopersTree({ parentguid: '' });
    const list = getResponseList(res).map(item => normalizeDeveloper(item));
    allDevelopers.value = list;
  } catch (error) {
    console.error('获取开发商失败:', error);
  }
};

const findNodeChildren = (nodes, targetId) => {
  for (const node of nodes) {
    if (node.id === targetId) return node.children || [];
    if (node.children) {
      const found = findNodeChildren(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

const getChildren = async (parentId) => {
  if (props.useMockData) {
    await new Promise(r => setTimeout(r, 150));
    return findNodeChildren(MOCK_DEVELOPER_TREE, parentId) || [];
  }
  try {
    const res = await getDevelopersTree({ parentguid: parentId });
    return getResponseList(res).map(item => normalizeDeveloper(item, parentId));
  } catch { return []; }
};

const fetchCategoryChildren = async (classcode = '') => {
  try {
    const data = await getClassListLazy({
      classcode,
      classname: '',
      apptype: props.appType,
      source: props.source,
      isreturnroot: false
    });
    return getResponseList(data).map(item => normalizeCategory(item)).filter(item => item.id);
  } catch (error) {
    console.error('获取应用分类失败:', error);
    return [];
  }
};

const initCategoryLevels = async () => {
  const initialClassCode = getInitialClassCode();
  categoryBaseCode.value = initialClassCode;
  selectedClassCode.value = initialClassCode;
  selectedCategoryPath.value = [];
  const categories = await fetchCategoryChildren(initialClassCode);
  categoryLevels.value = categories.length ? [categories] : [];
};

// ========== 交互 ==========

const updateCascaderPosition = (target) => {
  const rect = target.getBoundingClientRect();
  cascaderPos.top = (rect.bottom + 4) + 'px';
  cascaderPos.left = rect.left + 'px';
};

const selectDeveloper = (item, path = '') => {
  selectedDeveloperId.value = item.id;
  cascadeSelectedPath.value = path;
  showCascader.value = false;
  triggerChange();
};

const buildSelectedPath = (activeNodeMap, level, item) => {
  const parts = [];
  for (let i = 0; i < level; i++) {
    if (activeNodeMap[i]) {
      parts.push(activeNodeMap[i].text);
    }
  }
  parts.push(item.text);
  return parts.join('/');
};

// 选择不限
const onSelectDeveloper = (item) => {
  showCascader.value = false;
  cascadeParentId.value = '';
  cascadeSelectedPath.value = '';
  if (!item) {
    selectedDeveloperId.value = '';
  } else {
    selectedDeveloperId.value = item.id;
  }
  triggerChange();
};

// 点击开发商：先查子级，有子级展示弹窗，无子级直接筛选
const onDeveloperClick = async (e, item) => {
  e.stopPropagation();

  cascadeParentId.value = item.id;
  cascadeSelectedPath.value = '';
  updateCascaderPosition(e.currentTarget);

  const children = await getChildren(item.id);
  item.children = children;

  if (children.length) {
    activeNodes.value = {};
    columnsData.value = { 0: children };
    showCascader.value = true;
    return;
  }

  activeNodes.value = {};
  columnsData.value = {};
  cascadeParentId.value = '';
  selectDeveloper(item);
};

// 级联节点点击：有子级继续展开，无子级确认选择
const onNodeClick = async (item, level) => {
  if (item.disabled) return;

  const newActiveNodes = { ...activeNodes.value };
  newActiveNodes[level] = item;
  for (let i = level + 1; i <= 5; i++) {
    delete newActiveNodes[i];
  }
  activeNodes.value = newActiveNodes;

  const newColumns = { ...columnsData.value };
  for (let i = level + 1; i <= 5; i++) {
    delete newColumns[i];
  }

  const children = await getChildren(item.id);
  item.children = children;

  if (children.length) {
    newColumns[level + 1] = children;
    columnsData.value = newColumns;
    return;
  }

  columnsData.value = newColumns;
  selectDeveloper(item, buildSelectedPath(newActiveNodes, level, item));
};

// 应用分类
const onSelectCategory = async (item, levelIndex) => {
  selectedCategoryPath.value = selectedCategoryPath.value.slice(0, levelIndex);
  selectedCategoryPath.value[levelIndex] = item;
  selectedClassCode.value = item.id;
  categoryLevels.value = categoryLevels.value.slice(0, levelIndex + 1);
  triggerChange();

  const children = await fetchCategoryChildren(item.id);
  if (children.length) {
    categoryLevels.value = [...categoryLevels.value, children];
  }
};

const onSelectCategoryUnlimited = (levelIndex) => {
  selectedCategoryPath.value = selectedCategoryPath.value.slice(0, levelIndex);
  categoryLevels.value = categoryLevels.value.slice(0, levelIndex + 1);
  const parentCategory = selectedCategoryPath.value[levelIndex - 1];
  selectedClassCode.value = parentCategory?.id || categoryBaseCode.value || '';
  triggerChange();
};

const triggerChange = () => {
  const classcode = selectedClassCode.value || categoryBaseCode.value || '';
  lastEmittedClassCode.value = classcode;
  emit('change', {
    developerstag: selectedDeveloperId.value,
    classcode
  });
};

watch(
  () => props.currentGuid,
  async (val) => {
    if (val === lastEmittedClassCode.value) {
      return;
    }
    await initCategoryLevels();
  }
);
</script>

<style lang="less" scoped>
.filter-panel {
  position: relative;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  margin: 0 24px 16px 24px;
}

.filter-row {
  display: flex;
  align-items: stretch;
}

.filter-row .filter-label,
.filter-row .filter-content,
.filter-row .filter-toggle-wrap {
  border-bottom: 1px solid #f0f0f0;
}

.filter-row:last-child .filter-label,
.filter-row:last-child .filter-content,
.filter-row:last-child .filter-toggle-wrap {
  border-bottom: none;
}

.filter-row.no-border .filter-label {
  border-bottom: none;
}

.filter-row.no-border .filter-content,
.filter-row.no-border .filter-toggle-wrap {
  border-bottom: 1px solid #f0f0f0;
}

.filter-label {
  flex-shrink: 0;
  width: 100px;
  font-size: 14px;
  color: #666;
  user-select: none;
  background-color: #FAFAFA;
  border-right: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 14px 16px;
  line-height: 24px;
  box-sizing: border-box;
}

.filter-content {
  flex: 1;
  min-width: 0;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 4px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  line-height: 20px;
  padding: 6px 10px;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  background-color: transparent;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover, &.active:hover {
    background-color: #F2F4F7 !important;
    color: #171A1D !important;
  }

  &.active {
    color: #2370ef;
  }

  &.cascade-trigger {
    cursor: pointer;
  }
}

.filter-toggle-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-right: 24px;
  margin-left: auto;
  box-sizing: border-box;
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    background-color: #F2F4F7;
    color: #171A1D;
  }

  .toggle-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;

    &.is-expanded {
      transform: rotate(180deg);
    }
  }
}


</style>

<!-- 级联弹窗全局样式（teleport到body，不能scoped） -->
<style lang="less">
.dev-cascade-popover {
  position: fixed;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  z-index: 9999;
}

.cascade-col {
  width: 160px;
  border-right: 1px solid #f0f0f0;
  padding: 6px 8px;
  overflow-y: auto;
  max-height: 260px;
  box-sizing: border-box;

  &:last-child {
    border-right: none;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e5e5;
    border-radius: 2px;
  }
}

.cascade-node {
  padding: 6px 8px;
  margin-bottom: 2px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 20px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
  box-sizing: border-box;

  &:hover {
    background-color: #F2F4F7 !important;
    color: #171A1D !important;
  }

  &.selected {
    background-color: transparent;
    color: #2370ef;
    font-weight: 500;
  }
  
  &.selected:hover {
    background-color: #F2F4F7 !important;
    color: #171A1D !important;
  }

  &.disabled {
    color: #c0c4cc;
    cursor: not-allowed;
    background-color: transparent;
  }

  .cascade-node-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cascade-node-arrow {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-top: 1.5px solid #c0c4cc;
    border-right: 1.5px solid #c0c4cc;
    transform: rotate(45deg);
    margin-left: 8px;
    transition: border-color 0.15s ease;
  }

  &:hover .cascade-node-arrow {
    border-color: #2E3033 !important;
  }

  &.selected .cascade-node-arrow {
    border-color: #2370ef;
  }

  &.selected:hover .cascade-node-arrow {
    border-color: #2E3033 !important;
  }

  &.disabled .cascade-node-arrow {
    border-color: #e4e7ed;
  }
}
</style>
