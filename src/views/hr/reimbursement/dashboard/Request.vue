<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosHR, axiosAf } from '../../../../service/axios';
import RequestDetail from './Request_detail.vue'

const toast = useToast();

const products = ref(null);
const productDialog = ref(false);
const approvalDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({}); 
const selectedProducts = ref();
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const employee = ref(null);
const items = ref(null);
const approval = ref({});
const downloaded = ref(false);


onBeforeMount(() => {
    initFilters();
});

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const fetching = async () =>{
    const result_transaction = await axiosHR.get('/reimbursment/transactions',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    products.value = result_transaction.data.metadata.data;
    product.value.baseURL = result_transaction.config.baseURL;

    // console.log(products.value)

    const result_employee = await axiosHR.get('/reimbursment/dashboard',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    employee.value = result_employee.data.metadata.data; 
}

// get plafon data
onMounted(async () => {
    fetching();
});

const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const openNew = async () => {
    const result = await axiosHR.get('/reimbursment/transactions/getid',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    product.value = {};
    product.value = result.data.metadata.data;
    const result_items = await axiosHR.get('/reimbursment/plafon/user',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                } 
            });
    items.value = result_items.data.metadata.data;
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = async () => {
    const result = await axiosHR.delete('/reimbursment/transactions/clear',{
                params:{
                    token: localStorage.getItem('token'),
                    transaction_id: product.value.id,
                }
            });
    downloaded.value = false;
    productDialog.value = false;
    submitted.value = false;
};

const saveProduct = async () => {
    submitted.value = true;
    product.value.token = localStorage.getItem('token');
    product.value.user_local = localStorage.getItem('id');
    if (product.value.items && product.value.request_id) {
        // store data
        product.value.bank = bank.value;
        const data = product.value;
        const result = await axiosHR.post('/reimbursment/transactions',data);
        if(result.data.status == 200){
            if(result.data.metadata.stored == 'updated'){
                product.value = result.data.metadata.data;
                products.value[findIndexById(product.value.id)] = product.value;
            }
            if(result.data.stored == 'created'){
                product.value = result.data.metadata.data;
                products.value.push(product.value);
            }

            payload.value.bank = bank.value;
            payload.value.token = local.value.token;
            payload.value.user_id = local.value.user_id;
            const responseBank = await axiosAf.post('/af/banks/search', payload.value);
            bank.value = {};
            payload.value = {};
            
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data '+result.data.metadata.stored, life: 9000 });
            productDialog.value = false;
            product.value = {};
            fetching();
        }
        else if(result.data.status == 404){
            toast.add({ severity: 'error', summary: 'Failed', detail: 'Approval not exist', life: 9000 });
        }
        else if(result.data.status == 400){
            toast.add({ severity: 'error', summary: 'Failed', detail: 'Total amount greater than plafon', life: 9000 });
        }
        else{
            toast.add({ severity: 'error', summary: 'Failed', detail: 'Please contact your Administrator', life: 9000 });
        }
        

    }
};

const editProduct = (editProduct) => {
    product.value = { ...editProduct };
    bank.value = product.value.bank;
    downloaded.value = true;
    productDialog.value = true;
};

const approvalProduct = async (editProduct) => {
    product.value = { ...editProduct };
    const result = await axiosHR.get('/reimbursment/approval/id',{
                params:{
                    token: localStorage.getItem('token'),
                    id: product.value.id,
                }
            });
    approval.value = {};
    approval.value = result.data.metadata.data;
    approvalDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = async () => {
    const data = product.value;
    const result = await axiosHR.delete('/reimbursment/transactions',{data: {data},
        params:{
            token: localStorage.getItem('token'),
        }
    });
    if(result.status == 200){
        const result = await axiosHR.get('/reimbursment/transactions',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
        products.value = result.data.metadata.data;
        deleteProductDialog.value = false;
        toast.add({ severity: 'error', summary: 'Successful', detail: 'Data Canceled', life: 3000 });
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
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'error', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// bank account
const payload = ref({});
const bank = ref({});
const bankAccounts = ref([]);
const searchBankAccount = async(event) => {
    payload.value = local.value;
    payload.value.query = event.query.trim();
    const response = await axiosAf.get('/af/banks/search',{
        params: payload.value
    });
    if(response.status == 200){
        bankAccounts.value = response.data.metadata.list;
        payload.value = {};
    }
}
const handleBanksSelected = async (item) => {
    bank.value = item.value;
    bank.value.display = "";
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New Request" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
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
                    sortField="created_at" 
                    :sortOrder="-1"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Request</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>
                    <Column field="request_id" header="Request Id" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Request Id</span>
                            {{ slotProps.data.request_id }}
                        </template>
                    </Column>
                    <Column field="item_name" header="Reimbursement" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Reimbursement</span>
                            {{ slotProps.data.item_name }}
                        </template>
                    </Column>
                    <Column field="created_at" header="Created date" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Created date</span>
                            {{ slotProps.data.created_at }}
                        </template>
                    </Column>
                    <Column field="detail" header="Detail" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Detail</span>
                            <Button icon="pi pi-desktop" class="p-button-rounded p-button-secondary mr-2" @click="editProduct(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="amount" header="Total" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Total</span>
                            {{ formatCurrency(slotProps.data.amount) }}
                        </template>
                    </Column>
                    <Column field="status" header="Status" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <Tag v-if="slotProps.data.status" class="mr-2" :severity="slotProps.data.status.severity" :value="slotProps.data.status.label" :rounded="true"></Tag>
                            <Tag v-else class="mr-2" severity="warning" value="Pending" :rounded="true"></Tag>
                        </template>
                    </Column>
                    <Column field="approval" header="Approval" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Approval</span>
                            <Button icon="pi pi-info" class="p-button-rounded p-button-secondary mr-2" @click="approvalProduct(slotProps.data)" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button v-if="!slotProps.data.status" label="Cancel" class="p-button-rounded p-button-danger mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                            <Button v-else-if="slotProps.data.status.id == 0" label="Cancel" class="p-button-rounded p-button-danger mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Request Reimbursement" :modal="true"  :closable="false" class="p-fluid mb-3">
                    <div class="field" >
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.id" readonly />
                    </div>
                    <div class="col-12 grid">
                        <div class="field md:col-6">
                            <label for="request_id">Request ID</label>
                            <InputText id="request_id" v-model="product.request_id" readonly />
                        </div>
                        <div class="field md:col-6">
                            <label for="employee">Employee Name</label>
                            <InputText id="employee" readonly  v-model="employee.name" />
                        </div>
                    </div>
                    <Fieldset legend="Bank" class="mt-2">
                        <div>
                            <div class="p-fluid">
                                <span class="p-float-label">
                                    <AutoComplete 
                                        id="bank_display" 
                                        v-model.trim="bank.display" 
                                        @item-select="handleBanksSelected" 
                                        optionLabel="display" 
                                        :suggestions="bankAccounts"
                                        @complete="searchBankAccount" 
                                        class="w-full"
                                        style="max-width: 30rem;"  
                                    />
                                    <label for="bank_display">Searching...</label>
                                </span>
                            </div>
                        </div>
                        <div class="field mt-5">
                            <label for="bank_account" >Account Name:</label>
                            <InputText id="bank_account" v-model="bank.account" class="w-full" :style="{ textTransform: 'uppercase' }" />
                        </div>
                        <div class="field mt-5">
                            <label for="bank_rekening" >No. Rekening:</label>
                            <InputText id="bank_rekening" v-model="bank.rekening" class="w-full" />
                        </div>
                        <div class="field mt-5">
                            <label for="bank_name" >Bank Name</label>
                            <InputText id="bank_name" v-model="bank.name" class="w-full" />
                        </div>
                    </Fieldset>
                    
                    <div class="field">
                        <label for="item">Reimbursement Item</label>
                        <Dropdown v-if="product.items" id="item" v-model="product.items" :options="items" :placeholder="product.items.name" :class="{ 'p-invalid': submitted && !product.items }" required="true" optionLabel="name" />
                        <Dropdown v-else id="item" v-model="product.items" :options="items" placeholder="Select" :class="{ 'p-invalid': submitted && !product.items }" required="true" optionLabel="name"  />
                        <small class="p-invalid" v-if="submitted && !product.items">Item reimbursement is required.</small>
                    </div>
                    <div>
                        <RequestDetail v-if="product.items" :request_id = "product.id" :item="product.items.code" :status_id="product.status?.id" />
                    </div>
                    <template #footer>
                        <router-link v-if="downloaded && product.status?.id == 2" :to="'/reimbursement/transaction/'+product.id+'/print'" target="_blank">
                            <Button label="Download/Print" icon="pi pi-cloud-download" text class="p-button-info" />
                        </router-link>
                        <!-- cancel button-->
                        <Button v-if="product.status?.id" label="Close" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button v-else label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />

                        <!-- submit button-->
                        <Button v-if="!product.status" label="Submit" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="approvalDialog" :style="{ width: '720px' }" header="Approval Detail" :modal="true" class="p-fluid mb-3">
                    <div class="field" hidden>
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.id" readonly />
                    </div>
                    <div class="field">
                        <DataTable :value="approval" dataKey="id" :rows="5" :paginator="true" responsiveLayout="scroll"> 
                            <Column field="sort" header="No." :sortable="true" style="width: 10%"></Column>
                            <Column field="name" header="PIC" :sortable="true" style="width: 35%"></Column>
                            <Column field="updated_at" header="Update Date" :sortable="true" style="width: 35%"></Column>
                            <Column style="width: 15%">
                                <template #header> Status</template>
                                <template #body="slotPropsApproval">
                                    <Tag class="mr-2" :severity="slotPropsApproval.data.severity" :value="slotPropsApproval.data.label" :rounded="true"></Tag>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to cancel <b>{{ product.request_id }}</b
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
