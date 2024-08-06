<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosHR } from '../../../service/axios';
import ProductHeader from './Headers.vue';

const toast = useToast();

const local = ref({
    userId: (new URL(window.location.href)).pathname.split('/')[3],
});

const deleteProductDialog = ref(false);


const dt = ref(null);
const filters = ref({});

onBeforeMount(() => {
    initFilters();
});

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
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

// developing start

// setup headers start
const headers = ref(null);
const products = ref(null);
// getting data
onMounted(async () => {
    // product's headers
    const headerData = await axiosHR.get('/development/products/header',{
    params:{
            user_id: local.value.userId,
        }
    });
    headers.value = headerData.data.metadata.result;

    // product's data
    const result = await axiosHR.get('/development/products',{
        params:{
            user_id: local.value.userId,
        }
    })
    products.value = result.data.metadata.products;
});

// formating data
const dateFormatted = (date) => {

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
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};



// setting header
const settingDialog = ref(false);
const openSetting = () => {
    settingDialog.value = true;
};

const hideSettingDialog = () => {
    settingDialog.value = false;
    location.reload();
};

// column reorder
const onColReorder = async (event) => {
    const data = {
        drag_index: event.dragIndex,
        drop_index: event.dropIndex,
        user_id: local.value.userId,
    };
    await axiosHR.put('/development/products/header/drag',data);
};
// setup headers end

// manages product start
const product = ref({});
const productDialog = ref(false);
const submitted = ref(false);

// creating data
const uniqueId = ref(null);
const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
    createId();
};

const createId = async () => {
    const response = await axiosHR.get('/development/products/createid',{
    params:{
            user_id: local.value.userId,
        }
    });
    const autoData = response.data.metadata.unique;
    for(let i=0; i<autoData.length; i++){
        product.value[autoData[i].id] = autoData[i].uniqueId;
    }
};

// editing data
const editProduct = (editProduct) => {
    product.value = { ...editProduct };
    productDialog.value = true;
};

// saving data
const saveProduct = async () => {
    submitted.value = true;
    product.value.user_id =  local.value.userId;
    const payload = product.value;
    const result = await axiosHR.post('/development/products',payload);
    if(result.data.status == 200){
        product.value = result.data.metadata.product;
        products.value.push(product.value);

        productDialog.value = false;
        product.value = {};
    }
    toast.add({ severity: result.data.metadata.message.severity, summary: result.data.metadata.message.summary, detail: result.data.metadata.message.detail, life: 5000 });
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
    uniqueId.value = null;
};

// deleting data
const selectedProducts = ref(null);
const deleteProductsDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};

const deleteSelectedProducts = async () => {
    product.value = products.value.filter((val) => selectedProducts.value.includes(val));
    const data = product.value;
    const result = await axiosHR.delete('/development/products',{data: {data},
        params:{
            user_id: local.value.userId,
        }
    });
    if(result.data.status == 200){
        products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
        deleteProductsDialog.value = false;
        selectedProducts.value = null;
    }   
    toast.add({ severity: result.data.metadata.message.severity, summary: result.data.metadata.message.summary, detail: result.data.metadata.message.detail, life: 5000 });
};

// manages product end

// developing end
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Setting" icon="pi pi-cog" class="p-button-info mr-2" @click="openSetting" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
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
                    scrollable 
                    scrollHeight="820px"
                    resizableColumns 
                    columnResizeMode="fit" 
                    tableStyle="min-width: 50rem"
                    :reorderableColumns="true" 
                    @columnReorder="onColReorder"
                    showGridlines
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <div style="text-align:left">
                                <Button icon="pi pi-trash" class="p-button-danger mr-3" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                                <Button label="New" icon="pi pi-plus" class="p-button-success " @click="openNew" />
                            </div>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 1%"></Column>
                    <Column v-for="(col, index) of headers" :field="col.id" :header="col.title" :key="col.id + '_' + index" headerStyle="width: 10%">
                        <template #body="slotProps">
                            <span class="p-column-title">{{ slotProps.data.title }}</span>
                            <label v-if="col.type == 'auto'"  >{{ slotProps.data[col.id] }}</label>
                            <label v-if="col.type == 'unique'"  >{{ slotProps.data[col.id] }}</label>
                            <label v-if="col.type == 'text'"  >{{ slotProps.data[col.id] }}</label>
                            <label v-if="col.type == 'currency'" >{{ formatCurrency(slotProps.data[col.id]) }}</label>
                            <label v-if="col.type == 'number'"  >{{ slotProps.data[col.id] }}</label>
                            <label v-if="col.type == 'date'"  >{{ dateFormatted(slotProps.data[col.id]) }}</label>
                        </template>
                    </Column>
                    <!-- <Column headerStyle="width:1%;" >
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
                        </template>
                    </Column> -->
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '50vw' }" header="Product Details" :modal="true" maximizable modal class="p-fluid">
                    
                    <div v-for="field in headers" :key="field.id">
                        <div class="field">
                            <label v-if="field.type == 'unique'" :for="field.id">{{ field.title }} <Tag severity="danger" value="Danger" rounded>Unique data</Tag></label>
                            <label v-else :for="field.id">{{ field.title }}</label>
                            <!-- Entry builder start -->
                            <InputText v-if="field.type == 'auto'" :id="field.id" v-model="product[field.id]" :placeholder="field.placeholder" required="true" autofocus :class="{ 'p-invalid': submitted && !product[field.id] }" readonly />
                            <InputText v-if="field.type == 'unique'" :id="field.id" v-model="product[field.id]" :placeholder="field.placeholder" required="true" autofocus :class="{ 'p-invalid': submitted && !product[field.id] }" />
                            <InputText v-if="field.type == 'text'" :id="field.id" v-model="product[field.id]" :placeholder="field.placeholder" required="true" autofocus :class="{ 'p-invalid': submitted && !product[field.id] }" />
                            <InputNumber v-if="field.type == 'currency'" :id="field.id" v-model="product[field.id]" :placeholder="field.placeholder" mode="currency" currency="USD" locale="en-US" :class="{ 'p-invalid': submitted && !product[field.id] }" :required="true" />
                            <InputNumber v-if="field.type == 'number'" :id="field.id" v-model="product[field.id]" :placeholder="field.placeholder" integeronly :class="{ 'p-invalid': submitted && !product[field.id] }" />
                            <Calendar v-if="field.type == 'date'" :id="field.id" v-model="product[field.id]" :placeholder="field.placeholder" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" :class="{ 'p-invalid': submitted && !product[field.id] }" autofocus ></Calendar>
                            <!-- Entry builder end -->
                            <small class="p-invalid" v-if="submitted && !product[field.id]">{{ field.title }} is required.</small>
                        </div>
                    </div>
                    
                    <template #footer>
                        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="settingDialog" :modal="true" maximizable modal header="Header's Setting" :closable="false" :style="{ width: '80vw' }">
                    <ProductHeader />

                    <template #footer>
                        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="hideSettingDialog" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.name }}</b
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
