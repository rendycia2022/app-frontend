
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
const dt = ref(null);
const selectedProducts = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/project/summary/tracker',{ 
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

const exportCSV = () => {
    dt.value.exportCSV();
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
        ref="dt"
        :value="products"
        v-model:selection="selectedProducts"
        dataKey="revenue_site_id"
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
        sortField="no_document_revenue" 
        :sortOrder="1"
    >
        <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <div style="text-align:left">
                    <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                </div>
                <span class="block mt-2 md:mt-0 p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
            </div>
        </template>
        <Column field="no_document_revenue" header="PO Customer" sortable></Column>
        <Column field="site_id" header="Site Id" sortable></Column>
        <Column field="site_name" header="Site Name" sortable></Column>
        <Column field="site_area" header="Site Area" sortable></Column>
        <Column field="pr_document" header="No PR Internal" sortable></Column>
        <Column field="pr_date" header="PR Internal date" sortable></Column>
    </DataTable>

</template>

<style lang="scss" scoped>
::v-deep(.editable-cells-table td.p-cell-editing) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>