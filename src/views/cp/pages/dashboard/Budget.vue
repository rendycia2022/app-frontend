<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount, defineProps } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import BudgetRequest from './components/BudgetRequest.vue';

import { axiosCpSmart, axiosHR } from '../../../../service/axios';

const toast = useToast();

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    project_name: (new URL(window.location.href)).pathname.split('/')[4],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    backend_target: 'http://103.188.175.175:58301/api/v1',
});

onMounted(() => {
    fetching();
});

const products = ref(null);
const product = ref({});
const title = ref({});
const fetching = async () =>{
    const response = await axiosCpSmart.get('/budget/plan/'+local.value.project_id+'/'+local.value.project_name,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;

    const project = await axiosCpSmart.get('/dashboard/project/'+local.value.project_id+'/'+local.value.project_name,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });

    title.value = project.data
}

// filter
const filters = ref({});
onBeforeMount(() => {
    initFilters();
});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};


const onUpload = () => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    fetching();
};

// download template
const downloadTemplateBudgetPlan = async () => {
    await axiosCpSmart.get('/budget/plan/template', {
        params:{
                
            },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_BudgetPlan_'+title.value.project_name+'.xlsx'); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};

const downloadTemplateRequest = async () => {
    await axiosCpSmart.get('/budget/request/'+local.value.project_id+'/'+local.value.project_name+'/template/download', {
        params:{
                
            },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Request_'+title.value.project_name+'.xlsx'); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// expander
const expandedRows = ref([]);
const onRowExpand = (event) => {
};
const onRowCollapse = (event) => {
};
const expandAll = () => {
    expandedRows.value = products.value.filter((p) => p.id);
};
const collapseAll = () => {
    expandedRows.value = null;
};

// table style
const rowClass = (data) => {
    return [{ 'bg-red-100': data.value < data.total_request }];
};

// delete record
const deleteProductDialog = ref(false);
const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = async () =>{
    const response = await axiosCpSmart.delete('/budget/plan/'+product.value.id+'/'+local.value.user_id);
    if(response.data.status == 200){
        fetching();
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'warn', summary: 'Attention!', detail: response.data.message, life: 3000 });
    }else{
        toast.add({ severity: 'danger', summary: 'Warning', detail: response.data.message, life: 3000 });
    }
};


</script>

<template>
    
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <div class="mb-1" >
                    <span>Segment: <b>{{ title.project_name }}</b></span>
                </div>
                <span class="mb-5">Project: {{ title.project }}</span>

                <DataTable
                    v-model:expandedRows="expandedRows"
                    :value="products" 
                    dataKey="id"
                    @rowExpand="onRowExpand" @rowCollapse="onRowCollapse"
                    :paginator="true"
                    :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    resizableColumns 
                    columnResizeMode="fit"
                    :filters="filters"
                    removableSort
                    sortMode="single" 
                    sortField="name" 
                    :sortOrder="1"
                    :rowClass="rowClass"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <div class="flex items-center">
                                <FileUpload 
                                    mode="basic" name="file" class="mr-2"
                                    :url="local.backend_target+'/budget/plan/'+local.project_id+'/'+local.project_name+'/'+local.user_id" 
                                    accept=".xlsx,.xls" :maxFileSize="10000000" @upload="onUpload" 
                                    :auto="true"
                                    v-tooltip="'Import Budget Plan File'"
                                    chooseLabel="Budget"
                                />
                                <Button icon="pi pi-file-excel" severity="success" v-tooltip="'Download Budget Plan Template'" outlined rounded aria-label="Download Tempate" @click="downloadTemplateBudgetPlan()" ></Button>
                            </div>
                            <span>Budget</span>
                            <div class="flex flex-wrap justify-end gap-1">
                                <FileUpload 
                                    mode="basic" name="file" class="mr-1"
                                    :url="local.backend_target+'/budget/request/'+local.project_id+'/'+local.project_name+'/'+local.user_id" 
                                    accept=".xlsx,.xls" :maxFileSize="10000000" @upload="onUpload" 
                                    :auto="true"
                                    v-tooltip="'Upload Usage File'"
                                    chooseLabel="Usage"
                                    :disabled="!products || !products.length"
                                />
                                <Button icon="pi pi-file-excel" severity="danger" v-tooltip="'Download Usage Template'" outlined rounded aria-label="Download Tempate" @click="downloadTemplateRequest()" :disabled="!products || !products.length" ></Button>
                                <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" class="mr-2 mb-2" />
                                <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" class="mb-2" />
                            </div>
                        </div>
                    </template>

                    <Column header="#" headerStyle="width: 1%">
                        <template #body="slotProps">
                            <small>{{ slotProps.index + 1 }}</small>
                        </template>
                    </Column>
                    <Column expander headerStyle="width: 1%" />
                    <Column field="name" header="Name" :sortable="true" headerStyle="width: 10%">
                        <template #body="slotProps">
                            <span><small>{{ slotProps.data.name }}</small></span>
                        </template>
                    </Column>
                    <Column field="value" header="Budget" :sortable="true" headerStyle="width: 10%">
                        <template #body="slotProps">
                            <span><small>{{ formatCurrency(slotProps.data.value) }}</small></span>
                        </template>
                    </Column>
                    <Column field="total_request" header="Usage" :sortable="true" headerStyle="width: 10%">
                        <template #body="slotProps">
                            <span><small>{{ formatCurrency(slotProps.data.total_request) }}</small></span>
                        </template>
                    </Column>
                    <Column field="balance" header="Balance" :sortable="true" headerStyle="width: 10%">
                        <template #body="slotProps">
                            <span><small>{{ formatCurrency(slotProps.data.value - slotProps.data.total_request) }}</small></span>
                        </template>
                    </Column>
                    <Column headerStyle="width: 2%">
                        <template #body="slotProps">
                            <Button 
                                icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" 
                                @click="confirmDeleteProduct(slotProps.data)" 
                                :disabled="slotProps.data.total_request > 0"
                            />
                        </template>
                    </Column>
                    <template #expansion="slotProps">
                        <BudgetRequest :reference="slotProps.data.name" />
                    </template>
                    
                </DataTable>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '550px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.name }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
        </template>
    </Dialog>

</template>

<style lang="scss" scoped>
</style>

