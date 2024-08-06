
<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount,  defineProps, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../../service/axios';

// component
import IndirectOther from './component/IndirectOther.vue'
import IndirectRequest from './component/IndirectRequest.vue'

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});
const toast = useToast();

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

// emit
const emit = defineEmits(['completeTodo']);
const updateTodos = (updatedTodo) => {
    fetching();
};

// getting data
const products = ref(null);
const total = ref({});
const headers = ref({});
const complete = ref({});
const fetching = async () =>{
    const response = await axiosProject.get('/project/summary/indirect',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
        }
    });
    products.value = response.data.metadata.list;
    total.value = response.data.metadata.total;

    emit('completeTodo', total.value);
}

onMounted( async() => {
    fetching();
});

// formating data
const formatDate = (date) => {
    if(date === null){
        return null;
    }

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// Data manipulate
const product = ref({});
// create data
const createNew = async () => {
    const payload = local.value;
    const response = await axiosProject.post('/project/summary/indirect',payload);
    if(response.data.status == 200){
        fetching();
    }
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data created', life: 5000 });
};

// edit data
const onCellEditComplete = async (event) => {
    product.value = event.newData;

    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    const payload = product.value;
    const response = await axiosProject.put('/project/summary/indirect',payload);
    if(response.data.status == 200){
        fetching();
    }
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
};

// delete data
const selectedProduct = ref(null);
const deleteSelectedDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    const data = selectedProduct.value;
    const response = await axiosProject.delete('/project/summary/indirect',{data: {data},
        params: local.value
    });
    if(response.data.status == 200){
        fetching();
        deleteSelectedDialog.value = false;
        selectedProduct.value = null;
    }   
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
};

// builder
const builderDialog = ref(false);
const request = ref({});
const builder = async () =>{
    builderDialog.value = true;
    const response = await axiosProject.get('/project/summary/createid',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    request.value.id = response.data.metadata;
}

const saveDocument = async () =>{
    product.value.token = local.value.token;
    product.value.project_id = local.value.project_id,
    product.value.user_id = local.value.user_id;
    product.value.request_id = request.value.id;

    const payload = product.value;
    const response = await axiosProject.post('/project/summary/indirect/request',payload);
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
    builderDialog.value = false;
}

const closeDocument = async () =>{
    const response = await axiosProject.get('/project/summary/indirect/request/batch/clear',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            request_id: request.value.id,
        }
    });
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
    builderDialog.value = false;
}

</script>

<template>
    <Toast />
    <Toolbar class="mb-2">
        <template v-slot:start>
            <div class="text-xl font-bold mr-2">Total: <label class="text-xl font-bold text-blue-400">{{ formatCurrency(total.cost) }}</label></div>
        </template>
        <template v-slot:end>
        </template>
    </Toolbar>
    <DataTable 
        :value="products"
        v-model:selection="selectedProduct" 
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete" 
        tableClass="editable-cells-table" 
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
    >
        <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <div style="text-align:left">
                    <Button icon="pi pi-trash" severity="indangerfo" rounded class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" />
                    <Button icon="pi pi-plus" severity="success" rounded class="p-button-success mr-2" @click="createNew()" />
                    <Button icon="pi pi-file" class="p-button-rounded p-button mr-2" title="Request Budget" @click="builder()" />
                </div>
                <span class="block mt-2 md:mt-0 p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
            </div>
        </template>
        <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
        <Column field="header.label" header="Budget" sortable >
            <template #body="slotProps">
                {{ slotProps.data.header.label }}
            </template>
            <template #editor="slotProps">
                <Dropdown v-model="slotProps.data.header" :options="slotProps.data.headers" optionLabel="label" placeholder="Select a budget" class="w-full md:w-14rem" />
            </template>
        </Column>
        <Column field="option.label" header="Cost" sortable >
            <template #body="slotProps">
                {{ slotProps.data.option.label }}
            </template>
            <template #editor="slotProps">
                <Dropdown v-model="slotProps.data.option" :options="slotProps.data.options" optionLabel="label" placeholder="Select a cost item" class="w-full md:w-14rem" />
            </template>
        </Column>
        <Column field="qty" header="Qty" sortable >
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" integeronly placeholder="Enter quantity item" />
            </template>
        </Column>
        <Column field="unit" header="Unit" sortable >
            <template #editor="{ data, field }">
                <InputText v-model="data[field]" placeholder="Enter unit of quantity" />
            </template>
        </Column>
        <Column field="duration" header="Duration" sortable >
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" integeronly placeholder="Enter duration item" />
            </template>
        </Column>
        <Column field="cost" header="Cost IDR" sortable headerStyle="min-width: 12rem" >
            <template #body="slotProps">
                {{ formatCurrency(slotProps.data.cost) }}
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" placeholder="Enter cost item" />
            </template>
        </Column>
        <Column field="subtotal" header="Total Cost IDR" >
            <template #body="slotProps">
                {{ formatCurrency(slotProps.data.subtotal) }}
            </template>
        </Column>
        <Column field="note" header="Note" >
            <template #body="slotProps">
                <label v-if="slotProps.data.note" :title="slotProps.data.note">{{ slotProps.data.note.substr(0,20) }}</label>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" cols="30" placeholder="Enter note..." />
            </template>
        </Column>
    </DataTable>

    <Dialog v-model:visible="builderDialog" :style="{ width: '1080px' }" header="New Request Budget" :closable="false" :modal="true" maximizable modal>
        <div class="p-fluid">
            <div class="field">
                <label for="id">ID</label>
                <InputText id="id" v-model="request.id" readonly/>
            </div>
        </div>
        
        
        <IndirectRequest :requestId="request.id" />
        <template #footer >
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDocument" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveDocument" />
        </template>

    </Dialog>

    <!-- <IndirectOther /> -->
    <IndirectOther @complete-todo="updateTodos" />

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