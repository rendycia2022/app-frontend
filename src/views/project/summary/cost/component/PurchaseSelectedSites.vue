<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../../../service/axios';

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const props = defineProps({
    directHeaderId:{
        type: String,
        required: true
    },
    directDetailId: {
        type: String,
        required: true
    },
    itemId:{
        type: String,
        required: true
    },
    purchaseId: {
        type: String,
        required: true
    },
});

const toast = useToast();

const products = ref(null);
const product = ref({});
const productsDrop = ref(null);

// filter
onBeforeMount(() => {
    initFilters();
});
const filters = ref({});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const fetching = async()=>{
    local.value.direct_header_id = props.directHeaderId;
    local.value.direct_detail_id = props.directDetailId;
    local.value.detail_item_id = props.itemId;
    local.value.purchase_id = props.purchaseId;

    const response = await axiosProject.get('/project/summary/purchase/sites/id',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            direct_detail_id: local.value.direct_detail_id,
        }
    });
    products.value = response.data.metadata.list;
    productsDrop.value = response.data.metadata.drop;
}

// getting data
onMounted(async () => {
    fetching();
});

// delete data
const deleteProduct = async (editProduct) =>{
    product.value = { ...editProduct };
    const data = product.value;
    const response = await axiosProject.delete('/project/summary/purchase/sites',{data: {data},
        params: local.value
    });

    if(response.data.status == 200){
        fetching();
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
    }   
}


</script>

<template>
    <Toast />
    <div class="card">
        <DataTable 
            :value="products"
            resizableColumns 
            columnResizeMode="fit"
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            :filters="filters"
            removableSort
            sortField="no_document" 
            :sortOrder="1"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div class="my-2">
                        <!-- <Button label="Cancel" rounded class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" /> -->
                    </div>
                    <div class="my-2">
                        <span class="block mt-2 md:mt-0 p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </span>
                    </div>
                    
                </div>
            </template>
            <!-- <Column selectionMode="multiple" headerStyle="width: 5%"></Column> -->
            <Column field="site_id" header="Id" sortable ></Column>
            <Column field="site_name" header="Name" sortable ></Column>
            <Column field="site_area" header="Area" sortable ></Column>
            <Column field="no_document" header="PR No." sortable ></Column>
            <Column headerStyle="width: 5%" header="Action" >
                <template #body="slotProps">
                    <Button v-if="slotProps.data.purchase_request_id == local.purchase_id" icon="pi pi-times" class="p-button-rounded p-button-danger" title="Cancel Button" @click="deleteProduct(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

    </div>

</template>

<style lang="scss" scoped>
::v-deep(.editable-cells-table td.p-cell-editing) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>