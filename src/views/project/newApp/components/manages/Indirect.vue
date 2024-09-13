<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// config
const handleEnterKey = (event) =>{
    // Prevents Enter key from submitting the form and instead adds a new line
    event.stopPropagation();
};

const textAreaNewLineCount = (text) =>{
    var lines = text.split(/\r|\r\n|\n/);
    var count = lines.length;

    return count;
}

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// define
const props = defineProps(['code', 'completed']); 
watch(() => props.completed, async (newValue, oldValue) => {
    fetching();  
});

// data
const products = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/indirect/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data
    console.log(products.value)
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

    const response = await axiosProject.put('/v2/indirect/'+product.value.id, product.value);
    if(response.data.status == 200){
        fetching();
        product.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Updated', life: 3000 });
        
        completedTrigger();
    }
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
    const response = await axiosProject.delete('/v2/indirect/'+product.value.id, {data: product.value,
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

// calculate
const calculateTotal = (name) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.category === name) {
                total = total + product.subtotal;
            }
        }
    }

    return total;
};

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};
const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
};

</script>

<template>
    <Toast />
    <DataTable
        :value="products"
        dataKey="id"
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete"
        tableClass="editable-cells-table"
        class="text-small"
        size="small"
        scrollable scrollHeight="600px"
        :filters="filters"
        rowGroupMode="subheader" 
        groupRowsBy="representative.category"
        sortMode="single"
        :sortOrder="1"
        sortField="item" 
        removableSort
    >
        <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <span class="block p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
            </div>
        </template>

        <template #groupheader="slotProps">
            <span class="align-middle ml-2 font-bold leading-normal">{{ slotProps.data.representative.category }}</span>
        </template>
        <Column field="representative.category" header="Representative"></Column>

        <Column field="item" header="Item" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Item</small></span>
                <small>{{ slotProps.data.item }}</small>
            </template>
        </Column>
        <Column field="remarks" header="Remarks" headerStyle="width: 10%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Remarks</small></span>
                <Textarea v-model="slotProps.data.remarks" :rows="textAreaNewLineCount(slotProps.data.remarks)" cols="20" readonly />
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" @keydown.enter="handleEnterKey" rows="5" cols="30" placeholder="Remarks..." />
            </template>
        </Column>
        <Column field="qty" header="Qty" headerStyle="width: 5%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Qty</small></span>
                <small>{{ formatNumber(slotProps.data.qty) }}</small>
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" integeronly />
            </template>
        </Column>
        <Column field="duration" header="Duration" headerStyle="width: 5%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Duration</small></span>
                <small>{{ formatNumber(slotProps.data.duration) }}</small>
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" integeronly />
            </template>
        </Column>
        <Column field="cost" header="Cost" headerStyle="width: 25%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Cost</small></span>
                <small>{{ formatCurrency(slotProps.data.cost) }}</small>
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" />
            </template>
        </Column>
        <Column field="subtotal" header="Subtotal" headerStyle="width: 25%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Subtotal</small></span>
                <small>{{ formatCurrency(slotProps.data.subtotal) }}</small>
            </template>
        </Column>
        <Column headerStyle="width: 2%">
            <template #body="slotProps">
                <Button 
                    label="Delete" class="p-button-rounded p-button-danger small-padding-button" 
                    @click="confirmDeleteProduct(slotProps.data)"
                    size="small" text
                />
            </template>
        </Column>
        <template #groupfooter="slotProps">
            <div class="text-right font-bold w-full mb-2">
                <small>
                    Total: {{ formatCurrency(calculateTotal(slotProps.data.representative.category)) }}
                </small>
            </div>
        </template>
    </DataTable>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '550px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.item }}</b
                > {{ formatCurrency(product.subtotal) }} ?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
        </template>
    </Dialog>
</template>
<style lang="scss" scoped>

.small-padding-button {
    /* Sesuaikan nilai padding sesuai kebutuhan Anda */
    padding: 4px !important;
}
</style>