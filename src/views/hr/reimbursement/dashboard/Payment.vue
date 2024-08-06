<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosHR } from '../../../../service/axios';

const toast = useToast();

const products = ref(null);
const productDialog = ref(false);
const acceptProductDialog = ref(false);
const deleteProductDialog = ref(false);
const acceptProductsDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const transaction = ref({});
const transactionDetail = ref({});
const totalAmount = ref({});
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);


onBeforeMount(() => {
    initFilters();
});

// get plafon data
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/data/payment',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    products.value = result.data.metadata.data;
});

const formatCurrency = (value) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// action set start
const confirmAcceptProduct = (editProduct) => {
    product.value = editProduct;
    acceptProductDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const saveProduct = async () => {
    product.value.token = localStorage.getItem('token');
    const data = product.value;
    const result = await axiosHR.put('/reimbursment/data/payment/'+product.value.transaction_id,data);
    if(result.status == 200){
        product.value = result.data.metadata.data;
        products.value[findIndexById(product.value.id)] = product.value;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Data approved', life: 9000 });
        acceptProductDialog.value = false;
        
    }
    product.value = {};
};
// action set end

// detail product start
const detailProduct = async (editProduct) => {
    product.value = { ...editProduct };
    //transaction start
    const transactionResult = await axiosHR.get('/reimbursment/data/transaction/id/'+product.value.transaction_id,{
    params:{
            token: localStorage.getItem('token'),
        }
    });
    if(transactionResult.status == 200){
        transaction.value = transactionResult.data.metadata.data;
    }
    //transaction end
    //transaction detail start
    const transactionDetailResult = await axiosHR.get('/reimbursment/data/transaction_detail/'+product.value.transaction_id,{
    params:{
            token: localStorage.getItem('token'),
        }
    });
    if(transactionDetailResult.status == 200){
        transactionDetail.value = transactionDetailResult.data.metadata.data;
        totalAmount.value = transactionDetailResult.data.metadata.total_amount;
    }
    //transaction detail end
    productDialog.value = true;
};

const hideDialog = async () => {
    productDialog.value = false;
    submitted.value = false;
};

//detail product end

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

// const confirmDeleteSelected = (value) => {
//     if(value){
//         acceptProductsDialog.value = true;
//     }else{
//         deleteProductsDialog.value = true;
//     }
    
    
// };
// const deleteSelectedProducts = async (value) => {
//     const data = products.value.filter((val) => selectedProducts.value.includes(val));
//     if(value){
//         // accept button
//         const result = await axiosHR.delete('/reimbursment/plafon/burst',{data: {data},
//             params:{
//                 token: localStorage.getItem('token'),
//             }
//         });
//         if(result.status == 200){
//             products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
//             deleteProductsDialog.value = false;
//             selectedProducts.value = null;
//             toast.add({ severity: 'error', summary: 'Successful', detail: 'Products Deleted', life: 30000 });
//         }
//     }else{
//         // decline button
//         const result = await axiosHR.delete('/reimbursment/plafon/burst',{data: {data},
//             params:{
//                 token: localStorage.getItem('token'),
//             }
//         });
//         if(result.status == 200){
//             products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
//             deleteProductsDialog.value = false;
//             selectedProducts.value = null;
//             toast.add({ severity: 'error', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
//         }
//     }
    
// };

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// download pdf
const downloadPDF = async (transaction) =>{
    const data = transaction.id
    window.open("http://103.188.175.175:8000/api/reimbursment/data/payment/pdf/"+data+'?token='+localStorage.getItem('token'));
}

// summary
const selectedProducts = ref();
const summaryProductsDialog = ref(false);
const confirmSummarySelected = () => {
    summaryProductsDialog.value = true;
};
const payload = ref({});
const summarySelectedProduct = async () =>{
    payload.value.data = selectedProducts.value;
    payload.value.token = localStorage.getItem('token');
    const data = payload.value;
    await axiosHR.post('/reimbursment/data/payment/summary',data,{
        responseType: 'blob'
    }).then(response => {
        selectedProducts.value = null;
        summaryProductsDialog.value = false;

        // console.log(response.data);
        
        const now = new Date();
        const formatedNow = formatDate(now);
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'Medical Claim Report '+formatedNow+'.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('Error opening PDF:', error);
    });

}

// formating
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


</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />

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
                            <Button v-tooltip="'Build summary from selected data'" icon="pi pi-file-pdf" class="p-button-danger" rounded @click="confirmSummarySelected" :disabled="!selectedProducts || !selectedProducts.length" />
                            <h5 class="m-0">Payment</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="request_id" header="Transaction Id" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Transaction Id</span>
                            {{ slotProps.data.request_id }}
                        </template>
                    </Column>
                    <Column field="detail" header="Detail" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Detail</span>
                            <Button icon="pi pi-desktop" class="p-button-rounded p-button-secondary mr-2" @click="detailProduct(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="status" header="Status" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <Tag v-if="slotProps.data.status_id == 4" class="mr-2" :severity="slotProps.data.status_severity" :value="slotProps.data.status_label" :rounded="true"></Tag>
                            <Button v-if="slotProps.data.status_id == 2" :severity="slotProps.data.status_severity" size="small" icon="pi pi-file-pdf" :label="slotProps.data.status_label" class="p-button-rounded mr-2" @click="downloadPDF(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="action" header="Action" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps" >
                            <div v-if="slotProps.data.status_id == 2" >
                                <Button icon="pi pi-dollar" class="p-button-rounded p-button-success mr-2" @click="confirmAcceptProduct(slotProps.data)" />
                                <!-- <Button icon="pi pi-times" class="p-button-rounded p-button-danger mt-2" @click="confirmDeleteProduct(slotProps.data)" /> -->
                            </div>
                        </template>
                    </Column>
                    <Column field="name" header="Request Name" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Request name</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="amount" header="Amount" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Amount</span>
                            {{ formatCurrency(slotProps.data.amount) }}
                        </template>
                    </Column>
                    <Column field="created_at" header="Created at" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Created at</span>
                            {{ slotProps.data.created_at }}
                        </template>
                    </Column>
                </DataTable>

                <!-- detail start -->
                <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Detail Reimbursement" :modal="true"  :closable="false" class="p-fluid mb-3">
                    <div class="field" >
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.transaction_id" readonly />
                    </div>
                    <div class="col-12 grid">
                        <div class="field md:col-6" >
                            <label for="request_id">Request Id</label>
                            <InputText id="request_id" v-model="transaction.request_id" readonly />
                        </div>
                        <div class="field md:col-6" >
                            <label for="employee_name">Request By</label>
                            <InputText id="employee_name" v-model="transaction.employee_name" readonly />
                        </div>
                    </div>

                    <div class="col-12 grid">
                        <div class="field md:col-6" >
                            <label for="level">Level</label>
                            <InputText id="level" v-model="transaction.level" readonly />
                        </div>
                        <div class="field md:col-6" >
                            <label for="grade">Grade</label>
                            <InputText id="grade" v-model="transaction.grade" readonly />
                        </div>
                    </div>

                    <div class="col-12 grid">
                        <div class="field md:col-6" >
                            <label for="plafon_item">Plafon Item</label>
                            <InputText id="plafon_item" v-model="transaction.plafon_item" readonly />
                        </div>
                        <div class="field md:col-6" >
                            <label for="plafon_amount">Plafon Amount (Rp.)</label>
                            <InputNumber id="plafon_amount" v-model="transaction.plafon_amount" readonly />
                        </div>
                    </div>
                    <div class="col-12 grid">
                        <div class="field md:col-4" >
                            <label for="plafon_limit">Plafon Limit (Rp.)</label>
                            <InputNumber id="plafon_limit" v-model="transaction.plafon_limit" readonly />
                        </div>
                        <div class="field md:col-4" >
                            <label for="totalAmount">Total Amount (Rp.)</label>
                            <InputNumber id="totalAmount" v-model="totalAmount" readonly />
                        </div>
                        <div class="field md:col-4" >
                            <label for="totalAmount">Plafon Limit - Total Amount (Rp.)</label>
                            <InputNumber id="totalAmount" v-model="totalAmount" readonly />
                        </div>
                    </div>
                    
                    <div>
                        <DataTable
                            ref="dt"
                            :value="transactionDetail"
                            dataKey="id"
                            :paginator="true"
                            :rows="10"
                            :filters="filters"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            :rowsPerPageOptions="[5, 10, 25]"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                            responsiveLayout="scroll"
                        >
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
                        </DataTable>
                    </div>
                    <template #footer>
                        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                    </template>
                </Dialog>

                <!-- detail end -->

                <!-- summary confirm dialog -->
                <Dialog v-model:visible="summaryProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to accept this selected data?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="summaryProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" severity="success" text @click="summarySelectedProduct" />
                    </template>
                </Dialog>

                <!-- status in row start -->
                <Dialog v-model:visible="acceptProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to accept <b>{{ product.request_id }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="acceptProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" severity="success" text @click="saveProduct" />
                    </template>
                </Dialog>
                <!-- status in row end -->

                <Dialog v-model:visible="acceptProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-verified mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to accept the selected items?</span>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="acceptProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" severity="success" text @click="deleteSelectedProducts(true)" />
                    </template>
                </Dialog>
                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to decline the selected items?</span>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" severity="danger" text @click="deleteSelectedProducts(true)" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
