<template>
  <div class="common-layout" v-loading="loading">
    <e-container>
      <e-steps :active="currentStep" align-center>
        <e-step title="对比" />
        <e-step title="安装" />
      </e-steps>
      <e-container>
        <template v-if="currentStep == 1">
          <e-aside width="200px" toggleable>
            <div class="tree">
              <e-tree :data="treeData" :expanded-keys="['all']" @select="onSelectTree" />
            </div>
          </e-aside>
          <e-main>
            <div ref="table1Ref" style="height: 100%;">
              <e-table
                :scroll="{ x: true, y: table1Height }"
                row-key="engineCaseGuid"
                :columns="columns"
                :data-source="commitListData"
                :row-expandable="() => true"
                :pagination="false"
                @expand="onExpand"
              >
                <template #expandedRowRender>
                  <e-table row-key="filePath" :columns="engineCaseFileColumns" :data-source="engineCaseFileData" :pagination="false">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'filePath'">
                        <span class="filePath">{{ record.filePath }}</span>
                      </template>
                      <template v-else-if="column.key === 'action'">
                        <span>
                          <e-button @click="handleCompare(record)" link type="primary">比较</e-button>
                        </span>
                      </template>
                    </template>
                  </e-table>
                </template>
              </e-table>
            </div>
          </e-main>
        </template>
        <template v-if="currentStep == 2">
          <iframe :src="installAppUrl" frameborder="0" width="100%" height="100%"></iframe>
        </template>
      </e-container>
      <e-footer height="65px">
        <div class="e-dialog__footer">
          <span class="dialog-footer">
            <e-button @click="cancel">关闭</e-button>
            <e-button type="primary" @click="nextStep" v-show="showNext">下一步</e-button>
          </span>
        </div>
      </e-footer>
    </e-container>
  </div>
</template>

<script setup>
import { ref, reactive, defineAsyncComponent, getCurrentInstance, h, inject, onMounted } from 'vue';
const { proxy } = getCurrentInstance();
import { EMessage, EMessageBox } from '@epoint-fe/eui-components';
import { getCommitList } from './api';
import { getRightUrl } from '@epoint-fe/utils';

const getCurrentDialog = inject('getCurrentDialog');
const props = defineProps({
  applicationGuid: {
    type: String,
  }
});

const installAppUrl = ref(getRightUrl('/lowcode/applicationcenter/modulefactory/installapplicationlist?applicationGuid=' + props.applicationGuid)); // 安装更新弹窗地址
const loading = ref(true); // 是否显示loading
const currentStep = ref('1'); // 当前步骤
const treeData = ref([]); // 文件树数据
const table1Ref = ref(null);
const table1Height = ref(0);
const showNext = ref(true); // 是否显示下一步按钮
// 提交记录表格列
const columns = [
  {
    title: '名称',
    dataIndex: 'engineCaseName',
    key: 'engineCaseName',
  },
  {
    title: '编码',
    dataIndex: 'engineCaseGuid',
    key: 'engineCaseGuid',
  },
  {
    title: '类型',
    dataIndex: 'engineName',
    key: 'engineName',
  },
];
const commitListData = ref([]); // 当前展示的提交记录数据
const allCommitListData = ref([]);  // 所有提交记录数据
const engineCaseFileData = ref([]); // 当前展示的文件数据
const engineCaseFileColumns = [
  {
    title: '名称',
    dataIndex: 'filePath',
    key: 'filePath',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
  },
];

// 行展开
const onExpand = (expanded, record) => {
  getEngineCaseFileData(record.engineCaseGuid);
};

// 获取待提交的文件
const handleGetCommitList = async (callback) => {
  loading.value = true;
  try {
    const data = await getCommitList({
      applicationGuid: props.applicationGuid,
      isGit: false
    });

    if (data.success == 'success') {
      const datas = data.data;
      datas.engineList.forEach((item) => {
        item.label = item.engineNmae;
        item.value = item.engineGuid;
      })
      treeData.value = [{
        label: datas.applicationName,
        value: 'all',
        expanded: true,
        children: datas.engineList
      }]
      // 遍历datas.engiceCaseList，将treeData中的engineGuid找到对应的engineName
      datas.engiceCaseList.forEach((item) => {
        const engine = datas.engineList.find((engine) => engine.engineGuid === item.engineGuid);
        if (engine) {
          item.engineName = engine.label;
        }
      })
      commitListData.value = datas.engiceCaseList;
      allCommitListData.value = datas.engiceCaseList;
      loading.value = false;

      callback && callback();
    } else {
      EMessage({
        type: 'error',
        message: data.msg
      });
    }
    table1Height.value = getElementHeight(table1Ref.value);
  } catch (error) {
    EMessage({
      type: 'error',
      message: '获取失败，请稍后重试'
    });
    table1Height.value = getElementHeight(table1Ref.value);
  }
}

handleGetCommitList();

// 获取表格的实际高度
const getElementHeight = (element) => {
  if (element) {
    const height = element.offsetHeight; // 包含padding和border
    const clientHeight = element.clientHeight; // 只包含内容区域
    const scrollHeight = element.scrollHeight; // 包含滚动内容的总高度

    return height - 55;
  }
  return 0;
};

// 选择树形菜单
const onSelectTree = (val) => {
  val = val[0];
  if (val === 'all') {
    commitListData.value = allCommitListData.value;
    return;
  }
  // 根据val获取对应的commitListData
  const commitList = allCommitListData.value.filter((item) => item.engineGuid === val);
  commitListData.value = commitList;
}

// 关闭
const cancel = () => {
  // 关闭弹窗
  getCurrentDialog().close();
};

// 下一步
const nextStep = () => {
  if (currentStep.value === '1') {
    currentStep.value = '2';
  } else if (currentStep.value === '2') {
    // 发送获取guidlist的自定义事件
    window.dispatchEvent(new CustomEvent('getGuidList'));
    // 隐藏下一步
    showNext.value = false;
  }
}

// 获取提交的具体文件
const getEngineCaseFileData = (engineCaseGuid) => {
  const selectedData = commitListData.value.filter((item) => item.engineCaseGuid === engineCaseGuid);
  engineCaseFileData.value = [];
  selectedData.forEach((item) => {
    item.engineCaseFile.forEach((file) => {
      file.engineCaseGuid = item.engineCaseGuid;
      file.engineGuid = item.engineGuid;
    })
    // 将 item.engineCaseFile 合并到 engineCaseFile
    engineCaseFileData.value = engineCaseFileData.value.concat(item.engineCaseFile);
  });
}

// 比较
const handleCompare = (record) => {
  proxy?.$dialog(
    {
      title: '元数据对比',
      width: 1200,
      height: 750,
      contentPadding: 0,
      closeCallback: (action) => {
        // if (action === 'save') {
        //   EMessage({
        //     type: 'success',
        //     message: '合并成功，正在刷新列表'
        //   });
        //   // 刷新列表
        //   handleGetCommitList(getEngineCaseFileData);
        // }
      },
    },
    () => {
      return h(
        defineAsyncComponent(() => import('./metadata-merging.vue')),
        {
          applicationGuid: props.applicationGuid,
          filePath: record.filePath,
          engineGuid: record.engineGuid,
          engineCaseGuid: record.engineCaseGuid
        }
      );
    }
  );
}

const resizeTableHeight = () => {
  table1Height.value = 0;
  setTimeout(() => {
    table1Height.value = getElementHeight(table1Ref.value);
  }, 30);
}

</script>

<style lang="less" scoped>
.common-layout {
  height: 100%;
  display: flex;
}

.ml10 {
  margin-left: 10px;
}

.commit-description {
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding: 0 20px;

  .required {
    color: #f44830;
  }
}

.tree {
  padding-left: 20px;
  padding-top: 10px;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

.filePath {
  // 英文换行
  word-break: break-all;
}
</style>
