
<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosMaintenance } from '../../../../service/axios';
import Ticket from './Ticket.vue';

const local = ref({
    user_id: localStorage.getItem('user_id'),
    token: localStorage.getItem('token'),
});

const toast = useToast();

const products = ref(null);
const product = ref({});


const fetching = async() =>{
    // products
    const response = await axiosMaintenance.get('/workorders/'+local.value.user_id);
    products.value = response.data.metadata.workorders;
}

// getting data
onMounted(async () => {
    fetching();
});

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

// create data
const productDialog = ref(false);
const submitted = ref(false);

const openProductDialog = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideProductDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};
const saveProduct = async () => {
    submitted.value = true;
    if(product.value.ticket && product.value.header){
        product.value.token = local.value.token;
        product.value.userid = local.value.user_id;
        const payload = product.value;
        const response = await axiosMaintenance.post('/ticket',payload);
        fetching();
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Data created', life: 5000 });
        productDialog.value = false;
    }
    
};

// edit data
const onCellEditComplete = async (event) => {
    product.value = event.newData;

    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    const data = product.value;
    const response = await axiosMaintenance.put('/workorders',data);
    product.value = {};
    fetching();
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });

};

// deleting
const selectedProduct = ref(null);
const deleteSelectedDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    product.value = products.value.filter((val) => selectedProduct.value.includes(val));
    const data = product.value;
    const response = await axiosMaintenance.delete('/workorders',{data: {data},
        params: local.value
    });
    if(response.data.status == 200){
        deleteSelectedDialog.value = false;
        selectedProduct.value = null;
        fetching();
        product.value = {}; 
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });

    }  
};

// expander
const expandedRows = ref([]);
const onRowExpand = (event) => {
    
};
const onRowCollapse = (event) => {

};
const expandedRowGroups = ref();
const collapseAll = () => {
    expandedRows.value = null;
};

const center = ref({ lat: 33.678, lng: -116.243 });


</script>

<template>
    <Toast />
    <div class="card">
        <DataTable 
            :value="products"
            v-model:selection="selectedProduct" 
            :filters="filters"
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table" 
            tableStyle="min-width: 50rem"
            v-model:expandedRows="expandedRows"
            v-model:expandedRowGroups="expandedRowGroups"
            @rowExpand="onRowExpand" @rowCollapse="onRowCollapse"
            resizableColumns 
            columnResizeMode="fit" 
            removableSort
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <Button icon="pi pi-trash" severity="danger" rounded aria-label="Delete" class="mr-2" title="Delete Data" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length"  />
                        <Button icon="pi pi-plus" severity="success" rounded aria-label="New" title="New Data" @click="openProductDialog" />
                    </div>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." class="mr-2" />
                        <Button text icon="pi pi-minus" severity="success" label="Collapse All" @click="collapseAll" />
                    </span>
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column expander style="width: 5rem" />
            <Column field="name" header="Ticket" sortable >
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" title="Enter value here..." />
                </template>
            </Column>
            <Column field="header" header="Header" sortable >
                <template #body="slotProps">
                    <label v-if="slotProps.data.header" :title="slotProps.data.header">{{ slotProps.data.header.substr(0,20) }}...</label>
                    <label v-else></label>
                </template>
                <template #editor="{ data, field }">
                    <Textarea v-model="data[field]" rows="5" cols="30" title="Enter value here..." />
                </template>
            </Column>
            <Column field="report" header="Summary" sortable >
                <template #body="slotProps">
                    <label v-if="slotProps.data.report" :title="slotProps.data.report">{{ slotProps.data.report.substr(0,20) }}...</label>
                </template>
                <template #editor="{ data, field }">
                    <Textarea v-model="data[field]" rows="5" cols="30" readonly />
                </template>
            </Column>
            <Column field="file" header="Lastest Data" sortable >
                <template #body="slotProps">
                    <Image v-if="slotProps.data.file" :src="slotProps.data.file" :alt="slotProps.data.file" width="55" preview />
                    <br><label>{{ slotProps.data.caption }}</label>
                    <br><span>{{ slotProps.data.last_date }}</span>
                </template>
            </Column>
            <template #expansion="slotProps">
                <Ticket :code="slotProps.data.code" :ticket="slotProps.data.name" />
            </template>
        </DataTable>
    </div>

    <!-- Product dialog -->
    <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Ticket" :modal="true" class="p-fluid mb-3">

        <div class="field">
            <label for="ticket">Nomor Ticket</label>
            <InputText id="ticket" v-model="product.ticket" placeholder="Enter Ticket..." :class="{ 'p-invalid': submitted && !product.ticket }" required="true" autofocus  />
            <small class="p-invalid" v-if="submitted && !product.ticket">Nomor Ticket is required.</small>
        </div>

        <div class="field">
            <label for="header">Header</label>
            <Textarea v-model="product.header" rows="5" cols="30" placeholder="Enter Header..." :class="{ 'p-invalid': submitted && !product.header }" required="true" autofocus />
            <small class="p-invalid" v-if="submitted && !product.header">Header is required.</small>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideProductDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
        </template>
    </Dialog>

    <!-- Delete selected dialog -->
    <Dialog v-model:visible="deleteSelectedDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product">Are you sure you want to delete the selected data?</span>
        </div>
        <template #footer >
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteSelectedDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
        </template>
    </Dialog>

</template>

<style lang="scss" scoped>
::v-deep(.editable-cells-table td.p-cell-editing) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>