<template>
  <div class="package" :class="{ 'has-expand': showExpand }">
    <span class="icon-expand" v-show="showExpand" @click="onClickExpand"></span>
    <e-page-header :icon="null" :title="typeTitle">
      <template #extra>
        <div class="app-header-right">
          <div class="search-box">
            <e-input
              v-show="showSearchInput"
              class="search-input"
              v-model="searchText"
              :prefix-icon="Search"
              placeholder="搜索套件"
              :maxlength="50"
              clearable
              @change="onSearch"
              ref="searchInputRef"
            />
            <span class="search-btn" v-show="!showSearchInput" :class="{ active: showSearchInput }" @click="showSearchInput = !showSearchInput"></span>
          </div>

          <div class="app-header-right-btn">
            <e-dropdown>
              <e-button type="primary" @click="handleEdit('')">+ 套件</e-button>
            </e-dropdown>
            <e-dropdown>
              <e-button>更多</e-button>
              <template #dropdown>
                <e-dropdown-menu>
                  <e-dropdown-item @click.stop="recycledVisible = true">回收站</e-dropdown-item>
                  <!-- <e-dropdown-item @click.stop="openDeveloperManagementDialog">开发商管理</e-dropdown-item> -->
                  <e-dropdown-item @click.stop="openInstallApplicationDialog">安装</e-dropdown-item>
                </e-dropdown-menu>
              </template>
            </e-dropdown>
          </div>
        </div>
      </template>
    </e-page-header>
    <div class="package-content">
      <div class="package-list" v-if="packageList && packageList.length > 0">
        <div class="package-item" v-for="item in packageList" :key="item.id" @click="openPackage(item.id, item.text)">
          <h4 class="package-item-title">{{ item.text }}</h4>
          <p class="package-item-intro" v-if="item.introduce">{{ item.introduce }}</p>
          <p class="package-item-intro" v-else>暂无描述</p>
          <div class="package-item-footer">
            <span>
              {{ item.classtag }}
            </span>
            <span v-for="(value, index) in item.developerstaglist" :key="index">
              <span class="num">{{ value.count }}</span
              >{{ value.text }}
            </span>
          </div>

          <div @click.stop="">
            <e-dropdown class="show-menu-btn" :teleported="false">
              <span class="btn-wrap">
                <e-button class="btn" :icon="MoreFilled" text @click.stop="" />
              </span>
              <template #dropdown>
                <e-dropdown-menu style="width: 95px">
                  <e-dropdown-item @click="handleEdit(item)">编辑</e-dropdown-item>
                  <e-dropdown-item class="delete" @click="handleDelete(item.id)">删除</e-dropdown-item>
                </e-dropdown-menu>
              </template>
            </e-dropdown>
          </div>
        </div>
      </div>
      <div class="empty-container" v-else-if="!loading && packageList.length === 0">
        <img :src="empty" alt="empty" />
        <p class="title">暂无套件</p>
        <div class="btns">
          <e-button type="primary" size="large" class="app-btn create-app" @click="handleEdit('')">新建套件</e-button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <e-dialog v-model="editDialogVisible" :title="editDialogTitle" width="500" align-center destroy-on-close>
      <e-form ref="ruleFormRef" :model="form" label-position="top" :rules="rules">
        <e-form-item label="套件名称" prop="name">
          <e-input v-model="form.name" autocomplete="off" show-word-limit maxlength="20" @change="changeName" placeholder="请输入套件名称" />
        </e-form-item>
        <e-form-item label="套件标识" prop="tag">
          <e-input v-model="form.tag" autocomplete="off" show-word-limit maxlength="50" placeholder="请输入套件标识" />
        </e-form-item>
        <e-form-item label="父级套件">
          <e-tree-select
            v-model="form.parentId"
            :data="parentTreeData"
            placeholder="请选择父级套件"
            clearable
            check-strictly
            :render-after-expand="false"
            :field-names="{ value: 'id', label: 'text', children: 'children' }"
          />
        </e-form-item>
        <e-form-item label="描述">
          <e-input v-model="form.intro" autocomplete="off" :rows="4" type="textarea" resize="none" show-word-limit maxlength="500" placeholder="请输入描述" />
        </e-form-item>
      </e-form>
      <template #footer>
        <span class="dialog-footer">
          <e-button @click="handleClose">取消</e-button>
          <e-button type="primary" @click="submitForm(ruleFormRef)"> 确定 </e-button>
        </span>
      </template>
    </e-dialog>

    <!-- 回收站弹窗 -->
    <e-dialog v-model="recycledVisible" class="app-info-dialog" destroy-on-close title="回收站" width="1300px" height="780px" :content-padding="[0, 0]" align-center>
      <Recycled ref="recycled" :apptype="props.apptype"> </Recycled>
    </e-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, defineAsyncComponent, getCurrentInstance, h, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { MoreFilled } from '@epoint-fe/eui-icons';
import { EMessage, EMessageBox } from '@epoint-fe/eui-components';
import { getClassList, addAppClass, updateAppClass, deleteAppClass, getAllAppClass } from '../api';
import { noSpaceValidator } from '@/plugins/custom-directive';
import { Recycled } from '../components';
import Pinyin from 'wd-hanzi2pinyin';
import empty from '../assets/images/no-data.svg';
const emit = defineEmits(['openPackage', 'click-expand']);
const { proxy } = getCurrentInstance();
//传入props
const props = defineProps({
  apptype: {
    type: String,
    default: ''
  },
  showExpand: {
    type: Boolean,
    default: false
  }
});
const packageList = ref([]);
const parentPackageList = ref([]); // 可选的父级套件列表
const editDialogVisible = ref(false);
const editDialogTitle = ref('新建套件');
const ruleFormRef = ref(); // 表单引用
const showBtnPanel = ref(false);
const showSearchInput = ref(false);
const searchInputRef = ref();
const searchText = ref(''); // 搜索框输入的值
const recycledVisible = ref(false);
const loading = ref(false);
const form = reactive({
  id: '',
  name: '',
  tag: '',
  intro: '',
  parentId: '', // 父级套件ID
  parentName: '' // 父级套件名称
});

// 父级套件树形选择相关
const parentTreeData = ref([]);

// 套件类型标题
const typeTitle = ref('应用中心');

// 递归转换节点格式
const transformNode = (item, excludeId) => {
  if (item.id === excludeId) return null;

  const node = {
    id: item.id,
    text: item.text,
    classcode: item.classcode || '',
    children: []
  };

  // 如果有 children，递归处理
  if (item.children && item.children.length > 0) {
    node.children = item.children
      .map(child => transformNode(child, excludeId))
      .filter(n => n !== null);
  }

  return node;
};

// 将列表数据转换为树形结构
const buildTreeData = (list, excludeId = '') => {
  // 创建 f9root 根节点
  const rootNode = {
    id: 'f9root',
    text: '根目录',
    children: []
  };

  if (!list || list.length === 0) {
    return [rootNode];
  }

  // 检查数据是否已经是嵌套结构（有 children 字段）
  const hasNestedChildren = list.some(item => item.children && item.children.length > 0);

  if (hasNestedChildren) {
    // 数据已经是嵌套结构，直接转换格式
    rootNode.children = list
      .map(item => transformNode(item, excludeId))
      .filter(n => n !== null);
  } else {
    // 扁平结构，需要构建树
    // 过滤掉当前编辑的套件
    const filteredList = list.filter((item) => item.id !== excludeId);

    // 构建 id 到节点的映射
    const nodeMap = new Map();
    filteredList.forEach((item) => {
      nodeMap.set(item.id, {
        id: item.id,
        text: item.text,
        classcode: item.classcode || '',
        children: []
      });
    });

    // 构建树形结构
    filteredList.forEach((item) => {
      const node = nodeMap.get(item.id);
      const parentId = item.classcode || '';

      if (!parentId || parentId === 'f9root') {
        // 直接挂在根节点下
        rootNode.children.push(node);
      } else {
        // 查找父节点
        const parentNode = nodeMap.get(parentId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // 父节点不在列表中，挂在根节点下
          rootNode.children.push(node);
        }
      }
    });
  }

  return [rootNode];
};
if (props.apptype === 'app') {
  typeTitle.value = '应用中心';
} else if (props.apptype === 'easyapp') {
  typeTitle.value = '智能中心';
} else if (props.apptype === 'dataanalyse') {
  typeTitle.value = '数据分析中心';
}

// 验证规则
const rules = reactive({
  name: [{ required: true, validator: noSpaceValidator, errorText: '请输入主题名称', trigger: ['blur', 'change'] }],
  tag: [{ required: true, validator: noSpaceValidator, errorText: '请输入主题标识', trigger: ['blur', 'change'] }]
});

// 监听name数据变化，自动生成tag
const changeName = (val) => {
  // 根据applicationname自动生成apptag
  form.tag = str2pinyin(form.name);
};

// 汉字转拼音
const str2pinyin = (str) => {
  const arr = Pinyin.parse(str) || [];
  var str = '';
  arr.forEach((item) => {
    // 只取拼音首字母
    str += item.target[0];
  });
  return str.toUpperCase();
};

// 获取套件列表
const handleGetClassList = async () => {
  loading.value = true;
  try {
    const data = await getClassList({
      isreturnroot: false,
      apptype: props.apptype,
      classcode: '',
      classname: searchText.value || '',
      source: ''
    });

    packageList.value = data;
    loading.value = false;
  } catch (error) {
    EMessage({
      type: 'error',
      message: '获取套件失败，请稍后重试'
    });
    loading.value = false;
  }
};

handleGetClassList();

// 打开某一个套件
const openPackage = (id, name) => {
  // 调用父组件的事件
  emit('openPackage', id, name);
};

const onClickExpand = () => {
  emit('click-expand');
};

// 编辑
const handleEdit = (item) => {
  // 构建父级套件树形数据（排除当前编辑的套件及其子套件）
  const excludeId = item && item.id ? item.id : '';
  parentTreeData.value = buildTreeData(packageList.value, excludeId);

  // 编辑
  if (item && item.id) {
    editDialogTitle.value = '编辑套件';
    form.id = item.id;
    form.name = item.text;
    form.tag = item.classtag;
    form.intro = item.introduce;
    form.parentId = item.classcode || 'f9root'; // 设置父级套件ID，默认为根目录
    if (form.parentId === '') {
      form.parentId = 'f9root';
    }
  } else {
    // 新增
    editDialogTitle.value = '新建套件';
    // 如果传入了 classcode，使用传入的值作为父级套件
    form.parentId = (item && item.classcode) || 'f9root';
  }
  editDialogVisible.value = true;
};

// 删除
const handleDelete = async (id) => {
  // 删除文件夹，先判断是否有数据
  const data = await getAllAppClass({
    classcode: id,
    tabtype: 'all',
    apptype: props.apptype,
    source: props.source || '',
    developerstag: '',
    filteruse: true
  });
  if (Array.isArray(data) && data.length > 0) {
    // 有数据时，只需提示无法删除
    EMessageBox.alert('请先转移套件内的数据，再做删除！', '提示', {
      type: 'warning',
      confirmButtonText: '知道了'
    });
  } else {
    // 无数据时，弹出确认框，确认是否删除
    EMessageBox.confirm('是否确认删除该套件?', '提示', {
      type: 'warning'
    })
      .then(() => {
        // 删除文件夹
        handleDeleteAppClass(id);
      })
      .catch(() => {
        // 取消删除
      });
  }
};

const handleDeleteAppClass = async (id) => {
  try {
    const data = await deleteAppClass({
      rowguid: id
    });

    if (data.success === 'success') {
      EMessage({
        type: 'success',
        message: data.msg || '删除成功'
      });
      handleGetClassList();
    } else {
      EMessage({
        type: 'error',
        message: data.msg || '删除失败，请稍后重试'
      });
    }
  } catch (error) {
    EMessage({
      type: 'error',
      message: '删除失败，请稍后重试'
    });
  }
};

const handleClose = () => {
  editDialogVisible.value = false;
  form.id = '';
  form.name = '';
  form.tag = '';
  form.intro = '';
  form.parentId = 'f9root';
  form.parentName = '';
};

// 提交编辑
const submitForm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      if (editDialogTitle.value === '编辑套件') {
        handleUpdateAppClass();
      } else {
        handleAddAppClass();
      }
    }
  });
};

// 新增套件
const handleAddAppClass = async () => {
  try {
    const data = await addAppClass({
      apptype: props.apptype,
      classcode: '',
      classname: form.name || '',
      classtag: form.tag || '',
      ordernumber: 0,
      introduce: form.intro || '',
      classcode: form.parentId === 'f9root' ? '' : form.parentId // 父级套件ID，f9root表示根目录
    });

    if (data.success === 'success') {
      EMessage({
        type: 'success',
        message: data.msg || '新增成功'
      });
      handleClose();
      handleGetClassList();
    } else {
      EMessage({
        type: 'error',
        message: data.msg
      });
    }
  } catch (error) {
    EMessage({
      type: 'error',
      message: '新增套件失败，请稍后重试'
    });
  }
};

// 编辑套件
const handleUpdateAppClass = async () => {
  try {
    const data = await updateAppClass({
      apptype: 'app',
      classcode: '',
      classname: form.name || '',
      classtag: form.tag || '',
      rowguid: form.id || '',
      ordernumber: 0,
      introduce: form.intro || '',
      classcode: form.parentId === 'f9root' ? '' : form.parentId // 父级套件ID，f9root表示根目录
    });

    if (data.success === 'success') {
      EMessage({
        type: 'success',
        message: data.msg || '修改成功'
      });
      handleClose();
      handleGetClassList();
    } else {
      EMessage({
        type: 'error',
        message: data.msg
      });
    }
  } catch (error) {
    EMessage({
      type: 'error',
      message: '编辑套件失败，请稍后重试'
    });
  }
};

// 搜索应用
const onSearch = () => {
  handleGetClassList();
};

watch(showSearchInput, (val) => {
  if (val) {
    nextTick(() => {
      searchInputRef.value.focus();
    });
  }
});

const outerClick = (evt) => {
  if (showBtnPanel.value && !evt.target?.closest('#create-btn') && !evt.target?.closest('#btn-panel')) {
    showBtnPanel.value = false;
  } else if (showSearchInput.value && !evt.target?.closest('.search-box') && !searchText.value.trim()) {
    showSearchInput.value = false;
  }
};

// 开发商管理
const openDeveloperManagementDialog = (params) => {
  const handler = proxy?.$dialog({
    title: '开发商管理',
    url: getRightUrl('lowcode/applicationcenter/applicationfactory/lowcodedevelopers/lowcodedeveloperslist'),
    width: 1300,
    height: 780
  });
};

// 安装
const openInstallApplicationDialog = (params) => {
  const handler = proxy?.$dialog({
    title: '安装应用',
    url: getRightUrl('lowcode/applicationcenter/modulefactory/installapplicationlist'),
    width: '90%',
    height: '90%'
  });
};

onMounted(() => {
  document.body.addEventListener('click', outerClick);
});
onUnmounted(() => {
  document.body.removeEventListener('click', outerClick);
});

// 暴露方法给父组件调用
defineExpose({
  handleEdit,
  packageList,
  parentTreeData
});
</script>

<style lang="less" scoped>
.package {
  position: relative;
  flex: 1;
  min-width: 0;

  .e-page-header {
    padding: 0 24px 6px;
  }

  :deep(.e-page-header) .e-page-header__title {
    font-weight: 500;
  }

  &-content {
    height: calc(100% - 54px);
    padding: 0 24px;
    overflow: auto;
    box-sizing: border-box;
  }

  &-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;
    display: grid;

    // 默认显示4列
    grid-template-columns: repeat(4, 1fr);

    // 当宽度小于1606px时显示3列
    @media screen and (max-width: 1606px) {
      grid-template-columns: repeat(3, 1fr);
    }

    // 当宽度小于1126px时显示2列
    @media screen and (max-width: 1126px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &-item {
    position: relative;
    flex: 1;
    min-width: 0;
    margin: 8px 0;
    background: #fff;
    background-color: #fff;
    box-shadow: 0px 2px 8px 0px rgba(23, 26, 29, 0.04);
    border-radius: 8px;
    padding: 26px 24px;
    box-sizing: border-box;
    height: 191px;
    cursor: pointer;

    &:hover {
      box-shadow: 0px 8px 24px 0px rgba(23, 26, 29, 0.1);

      .btn {
        display: block;
      }
    }

    &-title {
      font-weight: 700;
      font-size: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 32px;
      height: 32px;
      color: #171a1d;
      width: calc(100% - 20px);
    }

    &-intro {
      font-size: 16px;
      line-height: 24px;
      height: 48px;
      color: #8a8c8d;
      word-break: break-all;
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      margin-top: 16px;
      margin-bottom: 26px;
    }

    &-footer {
      font-size: 14px;
      height: 40px;
      line-height: 16px;
      color: #8a8c8d;
      overflow: hidden;

      & > span {
        margin-right: 8px;
        display: inline-block;
        border-right: 1px solid #e2e2e2;
        padding-right: 8px;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:last-child {
          padding-right: 0;
          border-right: none;
        }

        .num {
          color: #2370ef;
          margin-right: 2px;
        }
      }
    }
  }
}

.icon-expand {
  position: absolute;
  top: 3px;
  left: 24px;
  z-index: 2;
  width: 24px;
  height: 24px;
  background: url('../assets/images/icon-expand.svg') no-repeat center;
  cursor: pointer;

  &:hover {
    background: url('../assets/images/icon-expand-h.svg') no-repeat center;
  }
}

.package.has-expand {
  :deep(.e-page-header) .e-page-header__title {
    padding-left: 32px;
  }
}

.show-menu-btn {
  position: absolute;
  right: 24px;
  top: 30px;

  .btn-wrap {
    display: block;
    width: 24px;
    height: 24px;

    &:hover {
      .btn {
        background: rgba(35, 112, 239, 0.1);
      }
    }
  }

  .btn-wrap[aria-expanded='true'] {
    .btn {
      background: rgba(35, 112, 239, 0.1);
      color: #2370ef;
    }
  }

  .btn {
    padding: 0;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: none;
  }

  :deep(.e-dropdown-menu__item).delete {
    color: #f44830;
  }
}

.app-header-right {
  display: flex;
  align-items: center;

  .search-btn {
    display: inline-block;
    // margin-right: 8px;
    width: 28px;
    height: 28px;
    background: url('../assets/images/icon-search.svg') no-repeat center;
    cursor: pointer;

    &.active {
      background: url('../assets/images/icon-search-h.svg') no-repeat center;
    }
  }

  .filter-btn {
    display: inline-block;
    margin-right: 16px;
    width: 28px;
    height: 28px;
    background: url('../assets/images/icon-filter.svg') no-repeat center;
    cursor: pointer;
  }

  .search-box {
    margin-right: 16px;
    width: 280px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .e-input__wrapper {
      padding: 0 10px;
      width: 100%;
      border-radius: 8px;
    }

    .e-input__prefix {
      color: #7d8da6;
    }
  }

  .create-box {
    position: relative;
  }

  .more-btn {
    margin-left: 16px;
    padding: 0;
    width: 28px;
    height: 28px;
  }
}

.empty-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #999;
  user-select: none;

  .title {
    line-height: 40px;
    font-size: 16px;
    color: #171a1d;
  }

  .description {
    line-height: 22px;
    font-size: 16px;
    color: #8a8c8d;
  }

  .btns {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;

    .app-btn {
      border-radius: 8px;
    }
  }
}
</style>
