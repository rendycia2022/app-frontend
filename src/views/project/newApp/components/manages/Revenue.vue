<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// define
const props = defineProps(['code']);

// data
const products = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/revenue/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;
}

onMounted(() => {
    fetching();
});

const completedTrigger = () =>{
    let date = new Date();
    emit('completeTodo', date);
}

// edit data
const emit = defineEmits(['completeTodo']);
const product = ref({});
const onCellEditComplete = async (event) => {
    product.value = event.newData;
    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    const response = await axiosProject.put('/v2/revenue/'+product.value.id, product.value);
    if(response.data.status == 200){
        fetching();
        product.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Updated', life: 3000 });
        
        completedTrigger();
    }
};

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

// delete record
const deleteProductDialog = ref(false);
const confirmDeleteProduct = (detail) => {
    product.value = detail;
    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    deleteProductDialog.value = true;
};

const deleteProduct = async () =>{
    const response = await axiosProject.delete('/v2/revenue/'+product.value.id, {data: product.value,
        params: local.value
    });
    if(response.data.status == 200){
        fetching();
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'error', summary: 'Warning!', detail: 'Data deleted', life: 3000 });
        completedTrigger();
    }
};

</script>

<template>
    <Toast />
    <DataTable 
        :value="products"
        dataKey="code"
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete"
        tableClass="editable-cells-table"
        class="p-fluid"
    >
        <Column field="description" header="Description" headerStyle="width: 20%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Description</small></span>
                <small>{{ slotProps.data.description }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" />
            </template>
        </Column>
        <Column field="qty" header="Qty" headerStyle="width: 10%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Qty</small></span>
                <small>{{ slotProps.data.qty }}</small>
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" integeronly />
            </template>
        </Column>
        <Column field="price" header="Price" headerStyle="width: 10%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Price</small></span>
                <small>{{ formatCurrency(slotProps.data.price) }}</small>
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" />
            </template>
        </Column>
        <Column headerStyle="width: 2%">
            <template #body="slotProps">
                <Button 
                    icon="pi pi-trash" class="p-button-rounded p-button-danger mt-2" 
                    @click="confirmDeleteProduct(slotProps.data)"
                />
            </template>
        </Column>
    </DataTable>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '550px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.description }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
        </template>
    </Dialog>
</template>
