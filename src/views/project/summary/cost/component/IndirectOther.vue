
<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../../../service/axios';

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const toast = useToast();

// emit
const emit = defineEmits(['completeTodo']);

// getting data
const products = ref(null);
const options = ref({});
const total = ref({});

const fetching =  async() =>{
    const response = await axiosProject.get('/project/summary/indirect/other',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
        }
    });
    products.value = response.data.metadata.list;
    options.value = response.data.metadata.options;
    total.value = response.data.metadata.total;

    emit('completeTodo', total.value);

} 

onBeforeMount( async() => {
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
// create data
const product = ref({});
const createNew = async () => {
    const payload = local.value;
    const response = await axiosProject.post('/project/summary/indirect/other',payload);
    fetching();
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data created', life: 5000 });
};

// edit data
const onCellEditComplete = async (event) => {
    product.value = event.newData;

    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;
    product.value.project_id = local.value.project_id;

    const data = product.value;
    const response = await axiosProject.put('/project/summary/indirect/other',data);
    fetching();
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
    const response = await axiosProject.delete('/project/summary/indirect/other',{data: {data},
        params: local.value
    });
    if(response.data.status == 200){
        fetching();
        deleteSelectedDialog.value = false;
        selectedProduct.value = null;
    }   
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
};


</script>

<template>
    <Toast />
    <div class="py-3">
        <Toolbar class="mb-4">
            <template v-slot:start>
                <Button icon="pi pi-trash" severity="indangerfo" rounded class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" />
                <Button icon="pi pi-plus" severity="success" rounded class="p-button-success mr-2" @click="createNew" />
                <div class="text-xl font-bold text-primary-400 ">Cost of Fund</div>
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
            resizableColumns 
            columnResizeMode="fit" 
        >
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column field="value" header="Value" >
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.value) }}
                </template>
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" />
                </template>
            </Column>
            <Column field="remark" header="Remark" >
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" placeholder="Enter Remarks here.." />
                </template>
            </Column>

        </DataTable>
    </div>

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