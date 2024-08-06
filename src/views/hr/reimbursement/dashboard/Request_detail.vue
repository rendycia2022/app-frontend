<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, defineProps, watch } from 'vue';
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
const plafon = ref({});
const files = ref({});
const plafonLimit = ref({});
const status_id = ref(null);

//setting start
const category = ref('General');
const unlocked_date = ref(false);


//setting end

const handleFileUpload = (event) => {
    const list_file = event.files;
    const file = [];
    for (let i = 0; i < list_file.length; i++) {
        file[i] = list_file[i].name;
    }
    files.value = file;
      
};

const onFileCancel = (event) => {
    const file = event.files;
      console.log("File dibatalkan:", file.name);
      
};

const props = defineProps({
    request_id: {
        type: String,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    status_id: {
        type: String,
    },
});

//calender section validation start
const subtractDays = (date, days) => {
  date.setDate(date.getDate() - days);

  return date;
}

let today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let prev30Day = subtractDays(today, 30);
let prevDay = prev30Day.getDate();
let prevMonth = prev30Day.getMonth();
let prevYear = prev30Day.getFullYear();

const minDate = ref(new Date());
const maxDate = ref(new Date());

minDate.value.setDate(prevDay);
minDate.value.setMonth(prevMonth);
minDate.value.setFullYear(prevYear);
maxDate.value.setMonth(month);
maxDate.value.setFullYear(year);
//calender section validation end

onBeforeMount(() => {
    initFilters();
});

// get data
onMounted(async () => {
    //date transaction 
    const setting = await axiosHR.get('/setting/general',{
                params:{
                    token: localStorage.getItem('token'),
                    category: category.value,
                }
            });
    if(setting.data.metadata.data.unlocked_date.value == 1){
        unlocked_date.value = true
    }
    // get status for new detail
    const status_list = await axiosHR.get('/reimbursment/data/getByTransaction/'+props.request_id,{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    status_id.value = status_list.data.metadata.status;

    //get plafon start
    const plafonLimitResult = await axiosHR.get('/reimbursment/transaction_detail/'+props.request_id+'/'+props.item,{
    params:{
            token: localStorage.getItem('token'),
            id: localStorage.getItem('id'),
        }
    });
    if(plafonLimitResult.status == 200){
        plafonLimit.value = plafonLimitResult.data.metadata.data;
    }
   //get plafon end
    const result = await axiosHR.get('/reimbursment/transaction_detail/plafon_id',{
                params:{
                    token: localStorage.getItem('token'),
                    item: props.item,
                }
            });
    plafon.value = result.data.metadata.data;
    // get detail transaction start
    const result_detail = await axiosHR.get('/reimbursment/transaction_detail',{
                params:{
                    token: localStorage.getItem('token'),
                    request_id: props.request_id,
                    plafon_id: plafon.value.id,
                }
            });
    products.value = result_detail.data.metadata.data;
    // get detail transaction end
});

watch(() => props.item, async (newValue, oldValue) => {
    // get status for new detail
    const status_list = await axiosHR.get('/reimbursment/data/getByTransaction/'+props.request_id,{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    status_id.value = status_list.data.metadata.status;
    //get plafon start
    const plafonLimitResult = await axiosHR.get('/reimbursment/transaction_detail/'+props.request_id+'/'+newValue,{
    params:{
            token: localStorage.getItem('token'),
            id: localStorage.getItem('id'),
        }
    });
    if(plafonLimitResult.status == 200){
        plafonLimit.value = plafonLimitResult.data.metadata.data;
    }
   //get plafon end
    const result = await axiosHR.get('/reimbursment/transaction_detail/plafon_id',{
                params:{
                    token: localStorage.getItem('token'),
                    item: newValue,
                }
            });
    plafon.value = result.data.metadata.data;
    // get detail transaction start
    const result_detail = await axiosHR.get('/reimbursment/transaction_detail',{
                params:{
                    token: localStorage.getItem('token'),
                    request_id: props.request_id,
                    plafon_id: plafon.value.id,
                }
            });
    products.value = result_detail.data.metadata.data;
    // get detail transaction end
});

const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const openNew = async () => {
    const result = await axiosHR.get('/reimbursment/transaction_detail/getid',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    product.value = {};
    product.value = result.data.metadata.data;
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

function format_date(date) {
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

const saveProduct = async () => {
    submitted.value = true;
    product.value.token = localStorage.getItem('token');
    product.value.user_local = localStorage.getItem('id');
    product.value.request_id =  props.request_id;
    product.value.plafon_id =  plafon.value.id;
    product.value.effective_date = format_date(product.value.effective_date);
    product.value.files = files.value;
    if (product.value.description && product.value.request_id && product.value.amount && product.value.plafon_id) {
        // store data
        const data = product.value;
        const result = await axiosHR.post('/reimbursment/transaction_detail',data);
        if(result.data.status == 200){
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data stored', life: 3000 });
            product.value = result.data.metadata.data;
            products.value.push(product.value);
            productDialog.value = false;
            const plafonLimitResult = await axiosHR.get('/reimbursment/transaction_detail/'+props.request_id+'/'+product.value.plafon_id,{
            params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
            if(plafonLimitResult.status == 200){
                plafonLimit.value = plafonLimitResult.data.metadata.data;
            }
            product.value = {};
            files.value = {};
        }
        if(result.data.status == 400){
            toast.add({ severity: 'error', summary: 'Attentions', detail: 'Request greater than plafon', life: 30000 });
        }
        

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
    const result = await axiosHR.delete('/reimbursment/transaction_detail',{data: {data},
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
                            Limit: {{ formatCurrency(plafonLimit) }}
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
                        <div v-if="status_id == 0" class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <div class="my-2">
                                <Button label="Add Item" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            </div>
                        </div>
                    </template>
                    <Column field="files" header="Files" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Files</span>
                            <div class="grid">
                                <Image v-for="(item, i) in slotProps.data.files" :key="item" :src="item" :alt="item" class="mr-2" width="25" height="25" preview />
                            </div>
                        </template>
                    </Column>
                    <Column field="description" header="Description" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Description</span>
                            {{ slotProps.data.description }}
                        </template>
                    </Column>
                    <Column field="treatment" header="Treatment Place" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Treatment Place</span>
                            {{ slotProps.data.treatment }}
                        </template>
                    </Column>
                    <Column field="amount" header="Amount" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Amount</span>
                            {{ formatCurrency(slotProps.data.amount) }}
                        </template>
                    </Column>
                    <Column field="effective_date" header="Effective date" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Effective date</span>
                            {{ slotProps.data.effective_date }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-times" type="button" class="p-button-text p-button-danger" @click="confirmDeleteProduct(slotProps.data)"></Button>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '1080px' }" header="New Request Reimbursement" :modal="true" class="p-fluid mb-3">
                    <div class="field" >
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.id" readonly />
                    </div>
                    <div class="col-12 grid">
                        <div class="field md:col-6">
                            <label for="description">Description</label>
                            <InputText id="description" v-model="product.description" />
                        </div>
                        <div class="field md:col-6">
                            <label for="treatment">Treatment Place</label>
                            <InputText id="treatment" v-model="product.treatment" />
                        </div>
                        <div class="field md:col-6">
                            <label for="amount">Amount</label>
                            <InputNumber id="amount" v-model="product.amount" :class="{ 'p-invalid': submitted && !product.amount }" required="true" autofocus></InputNumber>
                            <small class="p-invalid" v-if="submitted && !product.amount">Amount is required.</small>
                        </div>
                        <div class="field md:col-6">
                            <label for="effective_date">Effective Date</label>
                            <Calendar v-if="unlocked_date == true" id="effective_date" :showIcon="true" :selectOtherMonths="true" :showButtonBar="true" v-model="product.effective_date" :maxDate="maxDate" :manualInput="false" dateFormat="yy-mm-dd" timeZone="Indonesia/Jakarta" autofocus ></Calendar>
                            <Calendar v-else id="effective_date" :showIcon="true" :showButtonBar="true" :selectOtherMonths="true" v-model="product.effective_date" :minDate="minDate" :maxDate="maxDate" :manualInput="false" dateFormat="yy-mm-dd" timeZone="Indonesia/Jakarta" autofocus ></Calendar>
                        </div>
                    </div>
                    <FileUpload name="files[]" @upload="handleFileUpload" @cancel="onFileCancel" :url="'http://103.188.175.175:8000/api/files/upload/'+product.id" :auto="true" :multiple="true" accept="image/*" :maxFileSize="1000000" :showUploadButton="false" >
                        <template #empty>
                            <p>Drag and drop files to here to upload.</p>
                        </template>
                    </FileUpload>
                    
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete description "<b>{{ product.description }}</b
                            > - <b>{{ formatCurrency(product.amount) }}</b>"?</span
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
