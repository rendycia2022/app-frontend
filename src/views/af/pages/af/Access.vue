<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { axiosAf } from '../../../../service/axios';

// utilities
const toast = useToast();

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

// local data
const local = ref({
    id: localStorage.getItem('id'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    access_id: localStorage.getItem('access_id'),
});

// product
const products = ref(null);
const product = ref({});
const selectedProduct = ref(null);
const productDialog = ref(false);
const submitted = ref(false);
const access = ref(null);

onMounted( () => {
    fetch();
});

const fetch = async () =>{
    const response = await axiosAf.get('/af/access/list',{ 
        params: local.value
    });
    products.value = response.data.metadata.list;
    
}

// new
const openNew = async () => {
    product.value = {};
    productDialog.value = true;

    const responseAccess = await axiosAf.get('/af/access/type',{ 
        params: local.value
    });
    access.value = responseAccess.data.metadata.list;
    console.log(access.value)
};

const saveProduct = async () => {
    submitted.value = true;
    product.value.local = local.value;
    const data = product.value;
    console.log(data);
};

// searching email
const items = ref([]);
const payload = ref({});
const search = async (event) => {
    payload.value = local.value;
    payload.value.query = event.query;
    const response = await axiosAf.get('/af/',{
        params: payload.value
    });
    if(response.status == 200){
        items.value = response.data.metadata;
        payload.value = {};
    }
}

</script>

<template>
    <Toolbar class="mb-4">
        <template v-slot:start>
            <router-link to="/af/dashboard" class="mr-2">
                <Button label="Back" text icon="pi pi-angle-left" class="p-button-info" />
            </router-link>
        </template>
        <template #center>
            <h4>Access</h4>
        </template>
        <template v-slot:end>
            
        </template>
    </Toolbar>
    <div class="card">
        <DataTable 
            v-model:selection="selectedProduct"
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
            sortMode="single" 
            sortField="" 
            :sortOrder="1"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <!-- <Button icon="pi pi-trash" severity="danger" rounded aria-label="Delete" class="mr-2" title="Delete Data" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length"  /> -->
                        <Button icon="pi pi-plus" severity="success" rounded aria-label="New" title="New Data" @click="openNew" />
                    </div>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column field="user_name" header="Name" sortable></Column>
            <Column field="access.label" header="Access" sortable></Column>
        </DataTable>
    </div >

    <Dialog v-model:visible="productDialog" :style="{ width: '50vw' }" header="New" :modal="true" maximizable modal class="p-fluid">
        <div class="field">
            <label for="account">Email</label>
            <AutoComplete id="account" v-model="product.user" :suggestions="items" @complete="search" />
        </div>

        <div class="field">
            <label for="access">Access</label>
            <Dropdown id="access" v-model="product.access" :options="access" optionLabel="label" placeholder="Select a Access Type" class="w-full " />
        </div>


        <template #footer>
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
        </template>
    </Dialog>
</template>
