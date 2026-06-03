<template>
    <div class="recycled-main">
        <e-toolbar button-position="left" filter-position="right">
            <template #button>

            </template>
            <template #actions>
                <div class="search-box">
                    <e-input
                        v-show="showSearchInput"
                        class="search-input"
                        v-model="searchRecycledText"
                        :prefix-icon="Search"
                        placeholder="搜索"
                        :maxlength="50"
                        clearable
                        @change="onSearchRecycled"
                        ref="searchInputRef"
                    />
                    <e-button v-show="!showSearchInput" text :icon="Search" @click="showSearchInput = !showSearchInput" />
                </div>
                <span class="filter-btn"></span>
                <e-button :disabled="recycledDisabled" :type="recycledDisabled ? 'default' : 'primary'" class="create-btn" @click="handleRemove()">彻底删除</e-button>
                <e-button :disabled="recycledDisabled" :type="recycledDisabled ? 'default' : 'primary'" class="create-btn" @click="handleRestore()">还原</e-button>
                <!-- <e-button text :icon="MoreFilled" /> -->
            </template>
        </e-toolbar>
        <div class="table-container">
            <e-table rowKey="rowguid" :row-selection="rowSelection" :preserveSelectedRowKeys="true" :columns="columns" :data-source="dataSource"
                :scroll="{ y: 550 }" style="height: calc(100% - 0px);" :pagination="pagination" :loading="loading" @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'applicationname'">
                        <span>
                            <span class="app-icon"></span>
                            {{ record.applicationname }}
                        </span>
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <span>
                            <e-button link type="primary" @click="handleRemove(record.rowguid, record.applicationname)">彻底删除</e-button>
                            <e-button link type="primary" @click="handleRestore(record.rowguid, record.applicationname)">还原</e-button>
                        </span>
                    </template>
                </template>
            </e-table>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, unref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { EMessage,EMessageBox } from '@epoint-fe/eui-components';
import { getRecyclebinApp, completelyDeleteApp, revertApp } from '../api';
import { MoreFilled, Search } from '@epoint-fe/eui-icons';
const emit = defineEmits(['recycled-disabled']);

//传入props
const props = defineProps({
  apptype: {
    type: String,
    required: true,
    default: ''
  },
  appname: {
    type: String,
    required: false,
    default: ''
  },
});
const appType = props.apptype;
const current = ref(1)
const pageSize = ref(10)
const dataSource = ref([])
const pagination = reactive({
    total: 0,
    current: current.value,
    pageSize: pageSize.value,
});
const loading = ref(false);
const columns = [
    {
        title: '名称',
        // minWidth: 200,
        width: 240,
        dataIndex: 'applicationname',
        key: 'applicationname',
        ellipsis: true,
    },
    {
        title: '创建人',
        width: 240,
        dataIndex: 'author',
    },
    {
        title: '删除人',
        width: 240,
        dataIndex: 'operateusername',
    },
    {
        title: '删除时间',
        width: 300,
        dataIndex: 'operatedate',
    },
    {
        title: '操作',
        width: 180,
        key: 'action',
        fixed: 'right',
    },
];
const selectedRowKeys = ref([]);
const selectedRowName = ref([]);
const recycledDisabled = ref(true);
const showSearchInput = ref(false);
const searchRecycledText = ref('');
const searchInputRef = ref();

watch(showSearchInput, (val) => {
  if (val) {
    nextTick(() => {
      searchInputRef.value.focus();
    });
  }
});

// 行选中事件
const onSelectChange = (changableRowKeys, changableRow) => {
    selectedRowName.value = [];
    for (let i = 0; i < changableRow.length; i++) {
        selectedRowName.value.push(changableRow[i].applicationname);
    }
    selectedRowKeys.value = changableRowKeys;
    if (changableRowKeys.length === 0) {
        emit('recycled-disabled', true);
        recycledDisabled.value = true;
    } else {
        emit('recycled-disabled', false);
        recycledDisabled.value = false;
    }
};

const rowSelection = computed(() => {
    return {
        selectedRowKeys: unref(selectedRowKeys),
        onChange: onSelectChange,
        hideDefaultSelections: true,
        defaultShowIndex: true,
    };
});

// 获取回收站列表
const getData = async (params) => {
    loading.value = true;
    try {
        const data = await getRecyclebinApp({
            apptype: appType,
            appname: props.appname || searchRecycledText.value,
            first: pagination.pageSize * (pagination.current - 1),
            pageSize: pagination.pageSize,
            ...params
        });

        dataSource.value = data.applist;
        pagination.total = data.rowcount;
        loading.value = false;
    } catch (error) {
        EMessage({
            type: 'error',
            message: '回收站加载失败，请稍后重试'
        });
        loading.value = false;
    }
}

// 彻底删除
const handleRemove = async (rowguid, name) => {
    if (!name && selectedRowName.value.length > 1) {
        name = selectedRowName.value[0] + ' 等' + selectedRowName.value.length + '项';
    }
    name = name || selectedRowName.value[0];
    EMessageBox.confirm(`确定将 ${name} 彻底删除吗？`, '提醒', {
        type: 'warning',
    })
        .then(async () => {
            let guidlist = [];
            if (rowguid) {
                guidlist = [rowguid];
            } else {
                guidlist = selectedRowKeys.value;
            }
            try {
                const data = await completelyDeleteApp({
                    guidlist: guidlist,
                });

                // 如果data.success为true，则表示修改成功
                if (data.success) {
                    // 弹出成功提示框
                    EMessage({
                        type: 'success',
                        message: data.msg || '删除成功！'
                    });
                    // 更新回收站
                    getData();
                } else {
                    EMessage({
                        type: 'error',
                        message: data.msg
                    });
                }
            } catch (error) {
                EMessage({
                    type: 'error',
                    message: '删除失败，请稍后重试'
                });
            }
        });
}

// 还原
const handleRestore = (rowguid, name) => {
    if (!name && selectedRowName.value.length > 1) {
        name = selectedRowName.value[0] + ' 等' + selectedRowName.value.length + '项';
    }
    name = name || selectedRowName.value[0];
    EMessageBox.confirm(`确定将 ${name} 还原吗？`, '提醒', {
        type: 'warning',
    })
        .then(async () => {
            let guidlist = [];
            if (rowguid) {
                guidlist = [rowguid];
            } else {
                guidlist = selectedRowKeys.value;
            }
            try {
                const data = await revertApp({
                    guidlist: guidlist,
                });

                // 如果data.success为true，则表示修改成功
                if (data.success) {
                    // 弹出成功提示框
                    EMessage({
                        type: 'success',
                        message: data.msg || '还原成功！'
                    });
                    // 更新回收站
                    getData();
                } else {
                    EMessage({
                        type: 'error',
                        message: data.msg
                    });
                }
            } catch (error) {
                EMessage({
                    type: 'error',
                    message: '还原失败，请稍后重试'
                });
            }
        });
}

// table组件切换分页
const handleTableChange = (
    pag,
    filters,
    sorter,
) => {
    pagination.pageSize = pag.pageSize;
    pagination.current = pag.current;

    getData({
        appname: '',
        sortfield: '',
        sortorder: '',
    })
};

// 搜索回车站
const onSearchRecycled = () => {
    getData({
      first: 0,
    });
};

getData();

// 暴露方法给父组件
defineExpose({
  handleRemove,
  handleRestore,
  getData
});

const outerClick = (evt) => {
  if (showSearchInput.value && !evt.target?.closest('.search-box') && !searchRecycledText.value.trim()) {
    showSearchInput.value = false;
  }
};

onMounted(() => {
  document.body.addEventListener('click', outerClick);
});
onUnmounted(() => {
  document.body.removeEventListener('click', outerClick);
});
</script>

<style lang="less" scoped>
.recycled-main {
    height: 100%;
}

.e-toolbar {
    padding-top: 0;
}

.table-container {
    height: calc(100% - 90px - 20px);
    padding: 0 20px 24px;
    box-sizing: border-box;
}

/* 修复table组件样式bug */
:deep(.e-table) {
    .e-table-container {
        height: 100%;
    }

    .e-table-cell.e-table-selection-column {
        .e-table-column-content {
            display: block;
        }
    }

    .e-table-column-content {
        overflow: visible;
    }
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

.search-box {
    margin-right: 16px;
    width: 280px;
    display: inline-block;
    width: 200px;
    text-align: right;

    .e-input {
        width: 100%!important;
    }

    .e-input__wrapper {
        padding: 0 10px;
        width: 100%;
        border-radius: 8px;
    }

    .e-input__prefix {
        color: #7d8da6;
    }
  }
</style>
