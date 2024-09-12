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
    const response = await axiosProject.get('/v2/direct/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data

}

onMounted(() => {
    fetching();
});

const completedTrigger = () =>{
    let date = new Date();
    emit('completeTodo', date);
}

// grouping
const expandedRowGroups = ref([]);
const onRowGroupExpand = (event) => {
};
const onRowGroupCollapse = (event) => {
};
const expandAll = () => {
    for (let i = 0; i < products.value.length; i++) {
        expandedRowGroups.value.push(products.value[i].representative.partner);
    }
};
const collapseAll = () => {
    expandedRowGroups.value = [];
};

// edit data
const emit = defineEmits(['completeTodo']);
const product = ref({});
const onCellEditComplete = async (event) => {
    product.value = event.newData;
    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    const response = await axiosProject.put('/v2/direct/'+product.value.id, product.value);
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
    const response = await axiosProject.delete('/v2/direct/'+product.value.id, {data: product.value,
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
const calculateTotalPartner = (name) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.partner === name) {
                let subtotal = product.qty * product.price;
                total = total + subtotal;
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
    <!-- <DataTable
        v-model:expandedRowGroups="expandedRowGroups"
        :value="products"
        dataKey="id"
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete"
        tableClass="editable-cells-table"
        class="text-small"
        size="small"
        scrollable scrollHeight="600px"
        :filters="filters"
        expandableRowGroups
        rowGroupMode="subheader" 
        groupRowsBy="representative.partner"
        sortMode="single"
        :sortOrder="1"
        sortField="representative.partner" 
        removableSort
        @rowgroup-expand="onRowGroupExpand" @rowgroup-collapse="onRowGroupCollapse"
    >
        <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <span class="block p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
                <div style="text-align:right">
                    <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" size="small" class="mr-2 mb-2" />
                    <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" size="small" class="mb-2" />
                </div>
            </div>
        </template>

        <template #groupheader="slotProps">
            <span class="align-middle ml-2 font-bold leading-normal">{{ slotProps.data.representative.partner }}</span>
        </template>
        <Column field="representative.partner" header="Representative"></Column>

        <Column field="item_title" header="Category" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Category</small></span>
                <small>{{ slotProps.data.item_title }}</small>
            </template>
        </Column>
        <Column field="item" header="Item" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Item</small></span>
                <small>{{ slotProps.data.item }}</small>
            </template>
        </Column>
        <Column field="qty" header="Qty" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Qty</small></span>
                <small>{{ formatNumber(slotProps.data.qty) }}</small>
            </template>
        </Column>
        <Column field="price" header="Price" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Price</small></span>
                <small>{{ formatCurrency(slotProps.data.price) }}</small>
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" />
            </template>
        </Column>
        <Column field="subtotal" header="Subtotal" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Subtotal</small></span>
                <small>{{ formatCurrency(slotProps.data.price * slotProps.data.qty) }}</small>
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
            <div class="text-right font-bold w-full">
                <small>
                    Total: {{ formatCurrency(calculateTotalPartner(slotProps.data.representative.partner)) }}
                </small>
            </div>
        </template>
    </DataTable> -->

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '550px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.representative.partner }} - {{ product.item }}</b
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

.small-padding-button {
    /* Sesuaikan nilai padding sesuai kebutuhan Anda */
    padding: 4px !important;
}
</style>