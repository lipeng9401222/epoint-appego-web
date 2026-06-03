<template>
  <e-dialog v-model="dialogVisible" :title="props.title" :width="props.width" :height="props.height" destroy-on-close
    @close="closeDialog">
    <e-table rowKey="guid" :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ y: 400 }"
      :row-selection="{
        type: 'radio',
        selectedRowKeys: state.selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: getCheckboxProps,
      }" :loading="state.loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'applicationName'">
          <span class="app-info">
            <span class="app-icon"></span>
            <span class="app-name">{{ record.applicationName }}</span>
          </span>
        </template>
        <template v-if="column.key === 'isExtended'">
          <span v-if="record.isExtended">否</span>
          <span v-if="!record.isExtended">是</span>
        </template>
      </template>
    </e-table>
    <template #footer>
      <span class="dialog-footer">
        <e-button @click.stop="closeDialog">取消</e-button>
        <e-button type="primary" :disabled="!hasSelected" @click.stop="openExtendAppDialog">扩展选中</e-button>
      </span>
    </template>
  </e-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { getAppListByCode } from '../api';
import { EMessage } from '@epoint-fe/eui-components';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '550px'
  },
  height: {
    type: String,
    default: '600px'
  },
  tabtype: {
    type: String,
    default: ''
  },
  apptype: {
    type: String,
    default: ''
  },
  currentGuid: {
    type: String,
    default: ''
  },
  developerstagList: {
    type: Array,
    default: () => []
  },
  hasExtendCallback: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['open-extendapp-dialog', 'close']);

const dialogVisible = ref(props.dialogVisible);
const developerstagList = ref([]);

const columns = ref([
  {
    title: '应用名称',
    dataIndex: 'applicationName',
    key: 'applicationName',
    width: 150,
  },
  {
    title: '应用标识',
    dataIndex: 'appTag',
    width: 150,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'developersTag',
    filters: [],
    onFilter: (value, record) => record.developersTag === value,
  },
  {
    title: '是否可扩展',
    dataIndex: 'isExtended',
    key: 'isExtended',
    filters: [{
      text: '是',
      value: false,
    }, {
      text: '否',
      value: true
    }],
    defaultFilteredValue: [false],
    onFilter: (value, record) => record.isExtended === value,
  },
]);

const tableData = ref([]);

const state = reactive({
  selectedRowKeys: [],
  selectedRow: [],
  loading: false,
});
const hasSelected = computed(() => state.selectedRowKeys.length > 0);

const onSelectChange = (selectedRowKeys, selectedRow) => {
  state.selectedRowKeys = selectedRowKeys;
  state.selectedRow = selectedRow;
};

const getCheckboxProps = (record) => ({
  disabled: record.isExtended, // 配置不可选中的列
  name: record.applicationName,
});

const getData = async () => {
  state.loading = true;
  tableData.value = [];
  developerstagList.value = [];
  for (let i = 0; i < props.developerstagList.length; i++) {
    const item = props.developerstagList[i];
    if (item.text !== '全部') {
      developerstagList.value.push({
        text: item.text,
        value: item.text
      });
    }
  }
  columns.value[2].filters = developerstagList.value;

  try {
    const data = await getAppListByCode({
      classCode: props.currentGuid,
      appType: props.apptype,
    });

    if (data.success && data.data) {
      for (let i = 0; i < data.data.length; i++) {
        const item = data.data[i];
        item.guid = item.applicationGuid;
        item.key = item.applicationGuid;
      }
      tableData.value = data.data;
    } else {
      EMessage({
        type: 'error',
        message: data.msg || '获取应用列表失败'
      });
    }
    state.loading = false;
  } catch (error) {
    state.loading = false;
  } finally {
    state.loading = false;
  }
};

// 监听应用信息弹窗是否打开
watch(
  () => props.dialogVisible,
  (val) => {
    dialogVisible.value = val;
    state.selectedRowKeys = [];
    state.selectedRow = [];

    if (val) {
      getData();
    }
  }
);

const openExtendAppDialog = () => {
  // 有选择扩展回调时，走回调逻辑
  if (props.hasExtendCallback) {
    emit('open-extendapp-dialog', state.selectedRow[0], () => {});
  } else {
    emit('open-extendapp-dialog', state.selectedRow[0]);
  }
  emit('select-extend-callback', state.selectedRow[0]);
}

// 关闭弹窗
const closeDialog = () => {
  emit('close', false);
};

</script>

<style lang="less" scoped>
.app-info {
  display: flex;
  align-items: center;
}

.app-icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
    border-radius: 8px;
    width: 38px;
    height: 38px;
    background: url('../assets/images/app.svg') no-repeat center;
    background-size: 100% 100%;
}

.app-name {
  display: inline-block;
    vertical-align: middle;
  word-break: break-all;
  flex: 1;
}
</style>