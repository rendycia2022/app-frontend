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
const revenue = ref({});
const fetching = async () =>{
    const response = await axiosProject.get('/v2/sites/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;

    const totalRevenue = await axiosProject.get('/v2/revenue/total/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    revenue.value = totalRevenue.data

}

onMounted(() => {
    fetching();
});

const completedTrigger = () =>{
    let date = new Date();
    emit('completeTodo', date);
}

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

// edit data
const emit = defineEmits(['completeTodo']);
const product = ref({});
const onCellEditComplete = async (event) => {
    product.value = event.newData;
    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    const response = await axiosProject.put('/v2/sites/'+product.value.id, product.value);
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
    const response = await axiosProject.delete('/v2/sites/'+product.value.id, {data: product.value,
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

// calculate
const calculateQty = () => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            total++;
        }
    }

    return total;
};

</script>

<template>
    <Toast />
    <DataTable 
        :value="products"
        dataKey="id"
        sortMode="single"
        removableSort
        :sortOrder="1"
        sortField="site_name" 
        :filters="filters"
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete"
        tableClass="editable-cells-table"
        class="text-small"
        size="small"
        scrollable scrollHeight="400px"
    >
        <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <div style="text-align:left">
                    <span class="mr-2">Total Site:</span>
                    <span v-if="calculateQty() <= revenue.qty" class="text-green-500"><b>{{ calculateQty() }}</b></span>
                    <span v-else class="text-red-500"><b>{{ calculateQty() }}</b></span>
                </div>
                <span class="block p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
            </div>
        </template>
        <Column header="#" style="min-width: 10px">
            <template #body="slotProps">
                <small>{{ slotProps.index + 1 }}</small>
            </template>
        </Column>
        <Column field="site_id" header="Tower/Site ID" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Tower/Site ID</small></span>
                <small>{{ slotProps.data.site_id }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
            </template>
        </Column>
        <Column field="site_name" header="Site Name" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Site Name</small></span>
                <small>{{ slotProps.data.site_name }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
            </template>
        </Column>
        <Column field="site_area" header="Area" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Area</small></span>
                <small>{{ slotProps.data.site_area }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
            </template>
        </Column>
        <Column field="site_island" header="Island" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Island</small></span>
                <small>{{ slotProps.data.site_island }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
            </template>
        </Column>
        <Column field="scope" header="Scope" headerStyle="width: 20%" :sortable="true" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Scope</small></span>
                <small>{{ slotProps.data.scope }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
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
    </DataTable>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '550px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.site_id }} - {{ product.site_name }}</b
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
    padding: 4px !important; /* Sesuaikan nilai padding sesuai kebutuhan Anda */
}
</style>