
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../service/axios';

// component
import Sites from './component/Sites.vue';

// emit
const emit = defineEmits(['completeTodo']);

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const toast = useToast();

const products = ref(null);
const total = ref({});
const product = ref({});
const header = ref([]);

const fetchingData = async() =>{
    // products
    const response = await axiosProject.get('/project/summary/revenue',{  
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
        }
    });
    products.value = response.data.metadata.list;
    total.value = response.data.metadata.total;

    // product header
    const projectById = await axiosProject.get('/project/summary/project',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
        }
    });
    header.value = projectById.data.metadata.project;

    emit('completeTodo', total.value);
}

// getting data
onMounted(async () => {
    fetchingData();
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
// create data
const createNew = async () => {
    const payload = local.value;
    const response = await axiosProject.post('/project/summary/revenue',payload);
    fetchingData();
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data created', life: 5000 });
};

// edit data
const onCellEditComplete = async (event) => {
    product.value = event.newData;
    product.value.date = formatDate(product.value.date);

    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;
    product.value.project_id = local.value.project_id;

    const data = product.value;
    const response = await axiosProject.put('/project/summary/revenue',data);
    fetchingData();
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });

};

// delete data
const selectedProduct = ref(null);
const deleteSelectedDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    product.value = products.value.filter((val) => selectedProduct.value.includes(val));
    const data = product.value;
    const response = await axiosProject.delete('/project/summary/revenue',{data: {data},
        params: local.value
    });
    if(response.data.status == 200){
        products.value = response.data.metadata.list;
        deleteSelectedDialog.value = false;
        selectedProduct.value = null;
        fetchingData();
    }   
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
};

// sites
const productDialog = ref(false);
const openProduct = async (editProduct) => {
    product.value = { ...editProduct };
    productDialog.value = true;
};

const closeProductDialog = async () => {
    fetchingData();
    productDialog.value = false;
};

// open budget
const revenueData = ref({});
const openBudget = (editProduct) => {
    revenueData.value = { ...editProduct };
}


</script>

<template>
    <Toast />
    <div class="card p-fluid">
        <Toolbar class="mb-4">
            <template v-slot:start>
                <Button label="Delete" icon="pi pi-trash" class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" />
                <Button label="New" icon="pi pi-plus" class="p-button-success " @click="createNew" />
            </template>
            <template v-slot:end>
                <div class="text-xl font-bold text-blue-400">Total Revenue: {{ formatCurrency(total.price) }} / {{ total.qty }} Site</div>
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
            removableSort
        >
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column field="counter" header="No." ></Column>
            <Column field="item" header="Item" headerStyle="min-width: 15rem" sortable>
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" placeholder="Enter new item of revenue services" />
                </template>
            </Column>
            <Column field="date" header="Date" headerStyle="min-width: 12rem" sortable>
                <template #editor="{ data, field }">
                    <Calendar v-model="data[field]" :selectOtherMonths="true" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" ></Calendar>
                </template>
            </Column>
            <Column header="Sites" headerStyle="width: 5%">
                <template #body="slotProps">
                    <Button icon="pi pi-map-marker" text rounded class="p-button-rounded p-button-danger mr-2" @click="openProduct(slotProps.data)" />
                </template>
            </Column>
            <Column field="qty" header="Qty" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.qty }}
                </template>
            </Column>
            <Column field="price" header="Unit Price" headerStyle="min-width: 15rem" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.price) }}
                </template>
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" />
                </template>
            </Column>
            <Column field="sub_total" header="Total Price" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.sub_total) }}
                </template>
            </Column>
            <Column field="no_document" header="PO Number" headerStyle="min-width: 15rem" sortable>
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" placeholder="Enter PO Number Customer" />
                </template>
            </Column>
            <Column field="description" header="Remarks" headerStyle="min-width: 15rem" >
                <template #body="slotProps">
                    <label v-if="slotProps.data.description" :title="slotProps.data.description">{{ slotProps.data.description.substr(0,20) }}</label>
                </template>
                <template #editor="{ data, field }">
                    <Textarea v-model="data[field]" rows="5" cols="30" placeholder="Enter description of revenue services" />
                </template>
            </Column>
            
        </DataTable>
    </div>
    

    <!-- Sites -->
    <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Sites" :modal="true" :closable="false" maximizable modal class="p-fluid">
        <Sites :revenueId="product.id" />

        <template #footer >
            <Button label="Close" icon="pi pi-times" class="p-button-text" @click="closeProductDialog" />
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