<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosHR } from '../../../../service/axios';

const toast = useToast();

const products = ref(null);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const dropdownValues= ref(null);


onBeforeMount(() => {
    initFilters();
});

// get plafon data
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/plafon',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    products.value = result.data.metadata.data;
});

// jobs dropdown
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/jobs',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    dropdownValues.value = result.data.metadata.data;
});

const formatCurrency = (value) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const saveProduct = async () => {
    submitted.value = true;
    product.value.token = localStorage.getItem('token');
    if (product.value.job && product.value.item.trim() && product.value.plafon) {
        if (product.value.id) { 
            // update data
            const data = product.value;
            const result = await axiosHR.put('/reimbursment/plafon',data);
            if(result.status == 200){
                products.value[findIndexById(product.value.id)] = product.value;
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Updated', life: 3000 });
            }
        } else {
            // new data
            const data = product.value;
            const result = await axiosHR.post('/reimbursment/plafon',data);
            if(result.status == 200){
                products.value.push(product.value);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Created', life: 3000 });
            }
            
        }
        productDialog.value = false;
        product.value = {};

    }
};

const editProduct = (editProduct) => {
    product.value = { ...editProduct };
    productDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = async () => {
    const data = product.value;
    const result = await axiosHR.delete('/reimbursment/plafon',{data: {data},
        params:{
            token: localStorage.getItem('token'),
        }
    });
    if(result.status == 200){
        products.value = products.value.filter((val) => val.id !== product.value.id);
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'error', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
    }
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = async () => {
    const data = products.value.filter((val) => selectedProducts.value.includes(val));
    const result = await axiosHR.delete('/reimbursment/plafon/burst',{data: {data},
        params:{
            token: localStorage.getItem('token'),
        }
    });
    if(result.status == 200){
        products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'error', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <!--<Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />-->
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="products"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Paid</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="job_level" header="Job_level" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Job Level</span>
                            {{ slotProps.data.job.level }}
                        </template>
                    </Column>
                    <Column field="grade" header="Grade" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Grade</span>
                            {{ slotProps.data.job.grade }}
                        </template>
                    </Column>
                    <Column field="reimbursement" header="Reimbursement" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Reimbursement</span>
                            {{ slotProps.data.item }}
                        </template>
                    </Column>
                    <Column field="plafon" header="Plafon" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Plafon</span>
                            {{ formatCurrency(slotProps.data.plafon) }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Plafon Details" :modal="true" class="p-fluid mb-3">
                    <div class="field" hidden>
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.id" />
                    </div>
                    <div class="field">
                        <label for="job_level">Job Level</label>
                        <Dropdown v-if="product.job" id="job_level" v-model="product.job" :options="dropdownValues" :placeholder="product.job.level+' - '+product.job.grade" :class="{ 'p-invalid': submitted && !product.job }" required="true" optionLabel="name"  />
                        <Dropdown v-else id="job_level" v-model="product.job" :options="dropdownValues" placeholder="Select" :class="{ 'p-invalid': submitted && !product.job }" required="true" optionLabel="name"  />
                        <small class="p-invalid" v-if="submitted && !product.job">Job Level is required.</small>
                    </div>
                    <div class="field">
                        <label for="item">Reimbursement Name</label>
                        <InputText id="item" v-model="product.item" :class="{ 'p-invalid': submitted && !product.item }" required="true" autofocus  />
                        <small class="p-invalid" v-if="submitted && !product.item">Item is required.</small>
                    </div>
                    <div class="field">
                        <label for="plafon">Plafon</label>
                        <InputNumber id="plafon" v-model="product.plafon" :class="{ 'p-invalid': submitted && !product.plafon }" required="true" autofocus></InputNumber>
                        <small class="p-invalid" v-if="submitted && !product.plafon">Plafon is required.</small>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.item }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
