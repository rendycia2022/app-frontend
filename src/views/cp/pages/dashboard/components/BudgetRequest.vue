<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosCpSmart } from '../../../../../service/axios';

const toast = useToast();

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    project_name: (new URL(window.location.href)).pathname.split('/')[4],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    backend_target: 'http://103.188.175.175:58301/api/v1',
});

const props = defineProps(['reference']); 

const products = ref(null);
const product = ref({});
const fetching = async () =>{
    const response = await axiosCpSmart.get('/budget/request/'+local.value.project_id+'/'+local.value.project_name+'/'+props.reference,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
}

onMounted(() => {
    fetching();
});

// delete record
const deleteProductDialog = ref(false);
const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = async () =>{
    const response = await axiosCpSmart.delete('/budget/request/'+product.value.id+'/'+local.value.user_id);
    if(response.data.status == 200){
        fetching();
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'warn', summary: 'Attention!', detail: 'Request Deleted', life: 3000 });
    }
};

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

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

</script>

<template>
    <div class="card">
        <DataTable
            :value="products"
            dataKey="id"
            removableSort
            :paginator="true"
            :rows="25"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[25, 50, 100]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            responsiveLayout="scroll"
            scrollable scrollHeight="300px"
            resizableColumns 
            columnResizeMode="fit"
            sortMode="single" 
            size="small"
            :filters="filters"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                    
                </div>
            </template>
            <Column header="#" headerStyle="width: 1%">
                <template #body="slotProps">
                    <small>{{ slotProps.index + 1 }}</small>
                </template>
            </Column>
            <Column field="date" header="Date" :sortable="true" headerStyle="width: 10%">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Date</small></span>
                    <small>{{ slotProps.data.date }}</small>
                </template>
            </Column>
            <Column field="value" header="Request" :sortable="true" headerStyle="width: 10%">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Request</small></span>
                    <small>{{ formatCurrency(slotProps.data.value) }}</small>
                </template>
            </Column>
            <Column field="remarks" header="Remarks" :sortable="true" headerStyle="width: 20%">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Remarks</small></span>
                    <small>{{ slotProps.data.remarks }}</small>
                </template>
            </Column>
            <Column headerStyle="width: 2%">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>
    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '550px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ formatCurrency(product.value) }}</b
                > in {{ product.date }}?</span
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

