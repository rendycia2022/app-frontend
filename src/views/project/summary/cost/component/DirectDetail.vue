<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, defineProps, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../../../service/axios';

import DirectSite from './DirectSites.vue';
import DirectSelectedSite from './DirectSelectedSites.vue';

const props = defineProps({
    directHeaderId:{
        type: String,
        required: true
    },
    directId: {
        type: String,
        required: true
    },
});

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const toast = useToast();
onBeforeMount(() => {
    initFilters();
});

// emit
const emit = defineEmits(['completeTodo']);

const products = ref(null);
const total = ref({});
const titleHeader = ref({});
const titleVendor = ref({});
const items = ref({});
const qty = ref({});

const fetching = async () =>{
    const responseDirectCost = await axiosProject.get('/project/summary/direct/id',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            direct_id: local.value.direct_id,
        }
    });
    titleHeader.value = responseDirectCost.data.metadata.header.header.label;
    titleVendor.value = responseDirectCost.data.metadata.header.vendor;
    
    const response = await axiosProject.get('/project/summary/direct/detail',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            direct_id: local.value.direct_id,
        }
    });
    products.value = response.data.metadata.list;
    total.value = response.data.metadata.total;

    const responseItems = await axiosProject.get('/project/summary/direct/detail/item',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            direct_id: local.value.direct_id,
        }
    });
    items.value = responseItems.data.metadata;

    emit('completeTodo', total.value);
}

onMounted(async () => {
    local.value.direct_id = props.directId;
    local.value.direct_header_id = props.directHeaderId;
    fetching();
});
watch(() => props.directId, async (newValue, oldValue) => {
    local.value.direct_id = newValue;
    fetching();
});
watch(() => props.directHeaderId, async (newValue, oldValue) => {
    local.value.direct_header_id = newValue;
    fetching();
});

// management data
const product = ref({});
const filters = ref({});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// create data
const createNew = async () => {
    const payload = local.value;
    const response = await axiosProject.post('/project/summary/direct/detail',payload);
    fetching();
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data created', life: 5000 });
};

// edit data
const onCellEditComplete = async (event) => {
    product.value = event.newData;

    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    const data = product.value;
    const response = await axiosProject.put('/project/summary/direct/detail',data);
    fetching();
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
};

// delete
const selectedProduct = ref(null);
const deleteSelectedDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    product.value = products.value.filter((val) => selectedProduct.value.includes(val));
    const data = product.value;
    const response = await axiosProject.delete('/project/summary/direct/detail',{data: {data},
        params: local.value
    });
    fetching();
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
    deleteSelectedDialog.value = false;
};

// sites
const productDialog = ref(false);
const openProduct = async (editProduct) => {
    product.value = { ...editProduct };
    productDialog.value = true;
};

const closeProductDialog = async () => {
    fetching();
    productDialog.value = false;
};

// qty
const qtyDialog = ref(false);
const openQty = async (editProduct) => {
    product.value = { ...editProduct };
    qtyDialog.value = true;
};
const closeQtyDialog = async () => {
    fetching();
    qtyDialog.value = false;
};

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

function formatDate(date) {
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

</script>

<template>
    <div class="p-2 mb-5">
        <Toolbar class="mb-2">
            <template v-slot:start>
                <Button icon="pi pi-trash" class="p-button-danger mr-2" rounded @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" />
                <Button icon="pi pi-plus" class="p-button-success mr-2" rounded @click="createNew" />
                <div class="text-1xl font-bold">{{ titleVendor }}</div>
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
            removableSort
        >
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column field="no" header="No." sortable headerStyle="width: 5%"></Column>
            <Column field="item" :header="titleHeader" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.item.label }}
                </template>
                <template #editor="{ data, field }">
                    <Dropdown v-model="data[field]" :options="items" optionLabel="label" placeholder="Select a item of cost" class="w-full md:w-14rem" />
                </template>
            </Column>
            <Column header="Sites" headerStyle="width: 5%">
                <template #body="slotProps">
                    <Button icon="pi pi-map-marker" text rounded class="p-button-rounded p-button-danger mr-2" @click="openProduct(slotProps.data)" />
                </template>
            </Column>
            <Column field="" header="Qty" sortable>
                <template #body="slotProps">
                    <Button text rounded aria-label="Selected Sites" @click="openQty(slotProps.data)"><label>{{ slotProps.data.qty }}</label></Button>
                </template>
            </Column>
            <Column field="unit" header="Unit" sortable>
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" placeholder="Enter unit..." />
                </template>
            </Column>
            <Column field="cost" header="Unit Cost" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.cost) }}
                </template>
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" placeholder="Enter cost..." />
                </template>
            </Column>
            <Column field="total" header="Total Cost" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.total) }}
                </template>
            </Column>
        </DataTable>
    </div>

    <!-- Sites -->
    <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Available Sites" :modal="true" :closable="false" maximizable modal class="p-fluid">

        <DirectSite v-if="product.item.id" :directHeaderId="local.direct_header_id" :directDetailId="product.id" :itemId="product.item.id"  />
        <template #footer >
            <Button label="Close" icon="pi pi-times" class="p-button-text" @click="closeProductDialog" />
        </template>
    </Dialog>

    <!-- Qty -->
    <Dialog v-model:visible="qtyDialog" :style="{ width: '720px' }" header="Selected Sites" :modal="true" :closable="false" maximizable modal class="p-fluid">

        <DirectSelectedSite v-if="product.item.id" :directHeaderId="local.direct_header_id" :directDetailId="product.id" :itemId="product.item.id"  />
        <template #footer >
            <Button label="Close" icon="pi pi-times" class="p-button-text" @click="closeQtyDialog" />
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