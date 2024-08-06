<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosCpSmart } from '../../../../../service/axios';

const toast = useToast();

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

onMounted(() => {
    fetching();
});

// data
const products = ref(null);
const durationParams = ref({});
const fetching = async () =>{
    const response = await axiosCpSmart.get('/dashboard/milestone',{
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    durationParams.value.display = 'Duration (in '+response.data.params+')';
    durationParams.value.raw = response.data.params;
    products.value = response.data.list;
}

// selected data
const product = ref({});
const productDialog = ref(false);
const submitted = ref(false);
const entry = ref('create');
const openNew = () => {
    product.value = {};
    payload.value = {};
    submitted.value = false;
    entry.value = 'create';
    getOptionsRef();
    productDialog.value = true;
};

const editProduct = (detailProduct) => {
    product.value = detailProduct;
    payload.value = {};
    submitted.value = false;
    entry.value = 'update';
    getOptionsRef();
    productDialog.value = true;
};

const references = ref(null);
const getOptionsRef = async () =>{
    const response = await axiosCpSmart.get('/dashboard/milestone/select',{
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    references.value = response.data.list;
}

const payload = ref({});
const saveProduct = async () => {
    submitted.value = true;
    if(entry.value == 'create'){
        if (product.value.title && product.value.title.trim() && product.value.duration ) {
            payload.value.data = product.value;
            payload.value.local = local.value;
            const data = payload.value;
            const response = await axiosCpSmart.post('/dashboard/milestone', data);
            if(response.data.status == 200){
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Created.', life: 5000 });
                productDialog.value = false;
                product.value = {};
                fetching();
            }else{
                console.log(response.data);
                toast.add({ severity: 'error', summary: 'Attention!', detail: 'Creating data failed.', life: 5000 });
            }
        }
    }else if(entry.value == 'update'){
        if (product.value.title && product.value.title.trim() && product.value.duration ) {
            payload.value.data = product.value;
            payload.value.local = local.value;
            const data = payload.value;
            const response = await axiosCpSmart.put('/dashboard/milestone/'+product.value.id, data);
            if(response.data.status == 200){
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Updated.', life: 5000 });
                productDialog.value = false;
                product.value = {};
                fetching();
            }else{
                console.log(response.data);
                toast.add({ severity: 'error', summary: 'Attention!', detail: 'Creating data failed.', life: 5000 });
            }
        }
    }else{
        console.log(product.value);
    }
    
};

// color management
const handleColorChange = async (editProduct) =>{
    product.value = { ...editProduct };
    payload.value.data = product.value;

    payload.value.local = local.value;

    const response = await axiosCpSmart.put('/dashboard/milestone/color/'+product.value.id, payload.value);
    if(response.data.status == 200){
        fetching();
        product.value = {};
    }else{
        console.log(response.data);
        toast.add({ severity: 'error', summary: 'Attention!', detail: 'Creating data failed.', life: 5000 });
    }
}

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

// delete
const deleteProductDialog = ref(false);
const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    payload.value = {};
    deleteProductDialog.value = true;
};
const deleteProduct = async () => {
    payload.value.local = local.value;
    const data = payload.value;
    const response = await axiosCpSmart.delete('/dashboard/milestone/'+product.value.id, {data: data});
    if(response.data.status == 200){
        deleteProductDialog.value = false;
        toast.add({ severity: 'error', summary: 'Attention!', detail: 'Data Deleted', life: 5000 });
        product.value = {};
        fetching();
    }else{
        console.log(response.data);
        toast.add({ severity: 'error', summary: 'Attention!', detail: 'Creating data failed.', life: 5000 });
    }
    
};

// recreating percent
const buildConfirmDialog = ref(false);
const openBuildConfirmDialog = () =>{
    buildConfirmDialog.value = true;
}
const buildPercentProcess = async () =>{
    payload.value.local = local.value;
    const data = payload.value;
    const response = await axiosCpSmart.post('/dashboard/milestone/percent', data);
    if(response.data.status == 200){
        fetching();
    }
    buildConfirmDialog.value = false;
}

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-1">
                            <Button icon="pi pi-percentage" severity="info" v-tooltip="'Calculate milestone`s percent '" outlined rounded aria-label="Recreating" @click="openBuildConfirmDialog" class="mr-2" />
                            <Button icon="pi pi-plus" severity="success" v-tooltip="'Create'" outlined rounded aria-label="New" @click="openNew" />
                        </div>
                    </template>

                    <template #center>
                        <h5 class="m-0">Milestone</h5>
                    </template>

                    <template v-slot:end>
                        <span class="block mt-2 md:mt-0 p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </span>
                    </template>
                </Toolbar>

                <DataTable
                    :value="products"
                    dataKey="id"
                    removableSort
                    :paginator="true"
                    :rows="25"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[25, 50, 100]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                    scrollable scrollHeight="500px"
                    size="small"
                >
                    <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
                    <Column header="#" headerStyle="width:2%; min-width:2rem;">
                        <template #body="slotProps">
                            <small>{{ slotProps.index + 1 }}</small>
                        </template>
                    </Column>
                    <Column field="percent" header="Percent" :sortable="true" headerStyle="width:5%; min-width:5rem;">
                        <template #body="slotProps">
                            <small v-if="slotProps.data.percent">{{ slotProps.data.percent }}%</small>
                        </template>
                    </Column>
                    <Column field="title" header="Title" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <small>{{ slotProps.data.title }}</small>
                        </template>
                    </Column>
                    <Column field="duration" :header="durationParams.display" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <small>{{ slotProps.data.duration }}</small>
                        </template>
                    </Column>
                    <Column field="reference" header="Reference" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <small>{{ slotProps.data.reference.title }}</small>
                            <small v-if="slotProps.data.emerge != null"> After <b>{{ slotProps.data.emerge }} {{ durationParams.raw }}</b></small>
                        </template>
                    </Column>
                    <Column field="color" header="Color" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <ColorPicker id="color" v-model="slotProps.data.color" @hide="handleColorChange(slotProps.data)" />
                        </template>
                    </Column>
                    <!-- <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" size="small" class="p-button-rounded p-button-warning mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" size="small" class="p-button-rounded p-button-danger mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column> -->
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Details" :modal="true" class="p-fluid">
                    <div class="field my-5">
                        <span class="p-float-label">
                            <InputText type="text" id="title" v-model.trim="product.title" required="true" :class="{ 'p-invalid': submitted && !product.title }" />
                            <label for="title">Title</label>
                        </span>
                        <small class="p-invalid" v-if="submitted && !product.title">Title is required.</small>
                    </div>
                    <div class="formgrid grid my-5">
                        <div class="field col">
                            <span class="p-float-label">
                                <InputNumber id="duration" v-model="product.duration" integeronly required="true" :class="{ 'p-invalid': submitted && !product.duration }" />
                                <label for="duration">{{ durationParams.display }}</label>
                            </span>
                            <small class="p-invalid" v-if="submitted && !product.duration">Duration is required.</small>
                        </div>
                        <div class="field col">
                            <label for="color" class="mr-2">Color:</label>
                            <ColorPicker id="color" v-model="product.color" required="true" />
                        </div>
                    </div>
                    <Panel header="Emerge After">
                        <div class="formgrid grid my-5">
                            <div class="field col">
                                <Dropdown id="reference" 
                                    v-model="product.reference" 
                                    :options="references"
                                    optionLabel="title" 
                                    placeholder="Select after emerge title"
                                >
                                </Dropdown>
                            </div>
                            <div class="field col">
                                <span class="p-float-label">
                                    <InputNumber id="emerge" v-model="product.emerge" integeronly  />
                                    <label for="emerge">Emerge After {{ durationParams.display }}</label>
                                </span>
                            </div>
                        </div>
                    </Panel>
                    
                    <template #footer>
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.title }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
            <Button label="Yes" severity="danger" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
        </template>
    </Dialog>

    <Dialog v-model:visible="buildConfirmDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Are you sure you want to calculating percent?</span>
        </div>
        <template #footer>
            <Button label="Cancel" severity="danger" icon="pi pi-times" class="p-button-text" @click="buildConfirmDialog = false" />
            <Button label="Process" severity="info" icon="pi pi-check" class="p-button-text" @click="buildPercentProcess" />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped>
</style>

