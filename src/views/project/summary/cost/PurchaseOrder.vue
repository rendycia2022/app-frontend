
<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount,  defineProps, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../../service/axios';

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});
const toast = useToast();

// // props
const props = defineProps(['todos']);
watch(() => props.todos, async (newValue, oldValue) => {
    fetching();  
});

// filtering
onBeforeMount(() => {
    initFilters();
});
const filters = ref({});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// getting data
const products = ref(null);
const product = ref({});
const fetching = async () =>{
    const response = await axiosProject.get('/project/summary/purchase/',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
        }
    });
    products.value = response.data.metadata;
}

onMounted( () => {
    fetching();
});

// deleteing data
const deleteProductDialog = ref(false);
const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};
const deleteProduct = async () => {
    const data = product.value;
    const response = await axiosProject.delete('/project/summary/purchase',{data: {data},
        params: local.value
    });

    if(response.data.status == 200){
        deleteProductDialog.value = false;
        product.value = {};
        fetching();
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
    } 
};

</script>

<template>
    <Toast />
    <!-- <Toolbar class="mb-2">
        <template v-slot:start>
            <div class="text-xl font-bold mr-2">Purchasing Request</div>
        </template>
        <template v-slot:end>
        </template>
    </Toolbar> -->
    <DataTable 
        :value="products"
        tableStyle="min-width: 50rem"
        resizableColumns 
        columnResizeMode="fit"
        :paginator="true"
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        :filters="filters"
        removableSort
        sortField="updated_at" 
        :sortOrder="-1"
    >
        <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <div style="text-align:left">
                    <div class="text-xl font-bold mr-2">Purchasing Order</div>
                </div>
                <span class="block mt-2 md:mt-0 p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
            </div>
        </template>
        <Column field="no_document" header="No. PR" sortable></Column>
        <Column headerStyle="" header="Download">
            <template #body="slotProps">
                <a :href="'http://103.188.175.175:8021/api/public/files/direct/'+slotProps.data.direct_cost_id+'/purchase/'+slotProps.data.id+'/pdf?project_id='+local.project_id+'&user_id='+local.user_id" target="_blank">
                    <Button icon="pi pi-file-pdf"  class="p-button-rounded p-button-info mr-2" title="Pdf Button" />
                </a>
            </template>
        </Column>
        <Column field="updated_by" header="Updated by" sortable></Column>
        <Column field="updated_at" header="Updated at" sortable></Column>
        <Column headerStyle="" header="Action">
            <template #body="slotProps">
                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
            </template>
        </Column>
    </DataTable>

    <!-- Delete dialog  -->
    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.no_document }}</b
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
::v-deep(.editable-cells-table td.p-cell-editing) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>