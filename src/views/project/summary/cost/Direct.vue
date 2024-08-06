<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, defineProps, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../../service/axios';
import DirectDetail from './component/DirectDetail.vue';
import PurchaseDetail from './component/PurchaseDetail.vue';

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
const dataUpdate = ref({});
const updateTodos = (updatedTodo) => {
    dataUpdate.value = updatedTodo
    fetching();
};

const revenue = ref({});
const products = ref(null);
const headers = ref({});
const total = ref({});
const sites = ref(null);

const fetching = async () =>{

    const responseData = await axiosProject.get('/project/summary/direct',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
        }
    });
    products.value = responseData.data.metadata.list;
    total.value = responseData.data.metadata.total;

    // headers
    const responseHeaders = await axiosProject.get('/project/summary/direct/headers',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    headers.value = responseHeaders.data.metadata;
    emit('completeTodo', dataUpdate.value);
};

onMounted(async () => {
    fetching();
});

// management data
const product = ref({});
const selectedSite = ref(null);
const productDialog = ref(false);
const submitted = ref(false);
const created = ref(false);

const filters = ref({});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// create 
const openNew = async () => {
    product.value = {};
    submitted.value = false;
    created.value = true;
    productDialog.value = true;
    selectedSite.value = null;

    // create id
    const createId = await axiosProject.get('project/summary/createid',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    product.value.id = createId.data.metadata;

};

// update
const editProduct = async (editProduct) => {
    product.value = { ...editProduct };
    created.value = false;
    productDialog.value = true;
    // selectedSite.value = null;
};

// store
const saveProduct = async () => {
    submitted.value = true;
    
    if(product.value.id && product.value.vendor && product.value.date && product.value.header){
        if(!product.value.description){
            product.value.description = null;
        }
        if(!product.value.note){
            product.value.note = null;
        }
        product.value.token = local.value.token;
        product.value.user_id = local.value.user_id;
        product.value.project_id = local.value.project_id;
        product.value.date = formatDate(product.value.date);
        // product.value.sites = selectedSite.value;

        const data = product.value;
        if(created.value == true){
            // data direct
            const response = await axiosProject.post('project/summary/direct',data);
            fetching();

            // data sites
            // const responseSites = await axiosProject.post('project/summary/direct/sites',data);
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
            productDialog.value = false;
            submitted.value = false;
        }else{
            const response = await axiosProject.put('project/summary/direct',data);
            fetching();
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });

        }
        
    }
};
const payload = ({});

// vendor's name
const vendorList = ref([]);
const searchVendor = async(event) => {
    payload.value = local.value;
    payload.value.query = event.query;
    const response = await axiosProject.get('/project/summary/direct/vendor',{
        params: payload.value
    });
    if(response.status == 200){
        vendorList.value = response.data.metadata;
        payload.value = {};
    }
}

// delete
const selectedProduct = ref(null);
const deleteSelectedDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    product.value = products.value.filter((val) => selectedProduct.value.includes(val));
    const data = product.value;
    const response = await axiosProject.delete('/project/summary/direct',{data: {data},
        params: local.value
    });
    fetching();
    product.value = {};
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
    deleteSelectedDialog.value = false;
};

// toggle
const expandedRows = ref([]);
const onRowExpand = (event) => {
    
};
const onRowCollapse = (event) => {
    
};
const expandedRowGroups = ref();

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

// download pdf
const downloadPDF = async (editProduct) => {
    product.value = { ...editProduct };
    if(!product.value.no_document){
        fetching();
    }
    await axiosProject.get('/public/files/direct/'+product.value.id+'/pdf', {
        params:{
                token: local.value.token,
                user_id: local.value.user_id,
                project_id: local.value.project_id,
            },
        // responseType: 'blob' // Menentukan tipe respons sebagai blob (binary large object)
    })
    .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Purchasing Request_'+product.value.no_document+'.pdf'); // Atur nama file sesuai kebutuhan Anda
        document.body.appendChild(link);
        link.click();
    })
    .catch(error => {
        console.error(error);
    });
};

// toggle
const op = ref();
const toggle = (event) => {
    op.value.toggle(event);
}

// document
const documentDialog = ref(false);
const documentBuilder = async (dataProduct) => {
    product.value = { ...dataProduct };
    
    // getting purchase id
    const createId = await axiosProject.get('project/summary/createid',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    product.value.purchase_request_id = createId.data.metadata;

    documentDialog.value = true;
};

const closeDocument = async() =>{
    // cleaning data
    const responsePurchase = await axiosProject.get('/project/summary/purchase/fetch',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
            direct_id: product.value.id,
        }
    });

    documentDialog.value = false;
}
const documentSubmitted = ref(false);

const saveDocument = async () => {
    documentSubmitted.value = true;

    if(product.value.purchase_request_id && product.value.purchase_request_date){
        product.value.token = local.value.token;
        product.value.user_id = local.value.user_id;
        product.value.project_id = local.value.project_id;
        product.value.purchase_request_date = formatDate(product.value.purchase_request_date);
        const data = product.value;
        const response = await axiosProject.post('project/summary/purchase/',data);

        if(response.data.status == 200){
            documentDialog.value = false;
            product.value = {};
            documentSubmitted.value = false;
            fetching();
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
        }
    }

}

</script>

<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template v-slot:start>
                <div class="text-xl font-bold">Total: <label class="text-xl font-bold text-blue-400">{{ formatCurrency(total.cost) }}</label></div>
            </template>
            <template v-slot:end>
                <div class="my-2">
                </div>
            </template>
        </Toolbar>

        <DataTable 
            v-model:expandedRows="expandedRows" 
            v-model:selection="selectedProduct"
            v-model:expandedRowGroups="expandedRowGroups"
            :value="products" dataKey="id"
            @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" 
            resizableColumns 
            columnResizeMode="fit"
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            :filters="filters"
            removableSort
            rowGroupMode="subheader" 
            groupRowsBy="header.label" 
            sortMode="single" 
            sortField="header.id" 
            :sortOrder="1"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <Button label="Delete" icon="pi pi-trash" class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" />
                        <Button label="New" icon="pi pi-plus" class="p-button-success " @click="openNew" />
                    </div>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column expander style="width: 5rem" />
            <template #groupheader="slotProps" >
                <label>{{ slotProps.data.header.label }}</label>
            </template>
            <Column field="vendor" header="Vendor" sortable></Column>
            <Column field="total" header="Total Cost" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.total) }}
                </template>
            </Column>
            <Column field="date" header="Date" sortable></Column>
            <Column field="description" header="Description" headerStyle="width: 10%">
                <template #body="slotProps">
                    <label v-if="slotProps.data.description" :title="slotProps.data.description">{{ slotProps.data.description.substr(0,20) }}</label>
                </template>
            </Column>
            <Column headerStyle="width: 5%" header="Action">
                <template #body="slotProps">
                    <a :href="'http://103.188.175.175:8021/api/public/files/direct/'+slotProps.data.id+'/pdf?project_id='+local.project_id+'&user_id='+local.user_id" target="_blank">
                        <Button icon="pi pi-file-pdf" class="p-button-rounded p-button-danger mr-2" title="Download Button" />
                    </a>
                    <Button icon="pi pi-file" class="p-button-rounded p-button mr-2" title="Document Button" @click="documentBuilder(slotProps.data)" />
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success " title="Edit Button" @click="editProduct(slotProps.data)" />
                </template>
            </Column>
            <template #expansion="slotProps">
                <DirectDetail @complete-todo="updateTodos" :directId="slotProps.data.id" :directHeaderId="slotProps.data.header.id"/>
            </template>
        </DataTable>
        <Toast />
    </div>

    <Dialog v-model:visible="documentDialog" :style="{ width: '1080px' }" header="New Purchase Request" :closable="false" :modal="true" maximizable modal class="p-fluid">
        
        <div class="grid">
            <div class="field col-4 sm:col-6 lg:col-4 xl:col-4" hidden>
                <label for="id">ID</label>
                <InputText id="id" v-model="product.id" readonly/>
            </div>
            <div class="field col-4 sm:col-6 lg:col-4 xl:col-4" hidden>
                <label for="purchase_request_id">Purchase Request ID</label>
                <InputText id="purchase_request_id" v-model="product.purchase_request_id" readonly/>
            </div>
            <div class="field col-4 sm:col-6 lg:col-4 xl:col-4">
                <label for="header">Category</label>
                <InputText id="header" v-model="product.header.label" readonly required="true" />
            </div>
            <div class="field col-4 sm:col-6 lg:col-4 xl:col-4">
                <label for="vendor">Vendor</label>
                <InputText id="vendor" v-model="product.vendor" readonly required="true" />
            </div>
            <div class="field col-4 sm:col-6 lg:col-4 xl:col-4">
                <label for="purchase_request_date">Date</label>
                <Calendar id="purchase_request_date" v-model="product.purchase_request_date" :selectOtherMonths="true" :class="{ 'p-invalid': documentSubmitted && !product.purchase_request_date }" required="true" autofocus dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" ></Calendar>
                <small class="p-invalid" v-if="documentSubmitted && !product.purchase_request_date">Date's for purchase request required.</small>
            </div>
            
        </div>
        
        <Divider align="center" type="solid">
            <b>Create PR Document</b>
        </Divider>

        <PurchaseDetail @complete-todo="updateTodos" :purchaseId="product.purchase_request_id" :directId="product.id" :directHeaderId="product.header.id" />
        
        <template #footer >
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDocument" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveDocument" />
        </template>
    </Dialog>

    <Dialog v-model:visible="productDialog" :style="{ width: '50vw' }" header="Order" :modal="true" maximizable modal class="p-fluid">
        <div class="field">
            <label for="id">ID</label>
            <InputText id="id" v-model="product.id" readonly/>
        </div>
        <div class="field">
            <label for="id">No. Document</label>
            <InputText id="id" v-model="product.no_document" readonly/>
        </div>
        <div class="field">
            <label for="header">Category</label>
            <Dropdown id="header" v-model="product.header" :options="headers" optionLabel="label" placeholder="Select a category of cost" :class="{ 'p-invalid': submitted && !product.vendor }" class="w-full" required="true" autofocus />
            <small class="p-invalid" v-if="submitted && !product.header">Category is required.</small>
        </div>
        <div class="field">
            <label for="vendor">Vendor</label>
            <AutoComplete id="vendor" v-model="product.vendor" :suggestions="vendorList" @complete="searchVendor" placeholder="Enter vendor's name" :class="{ 'p-invalid': submitted && !product.vendor }" required="true" autofocus />
            <!-- <InputText id="vendor" v-model="product.vendor" placeholder="Enter vendor's name" :class="{ 'p-invalid': submitted && !product.vendor }" required="true" autofocus  /> -->
            <small class="p-invalid" v-if="submitted && !product.vendor">Vendor is required.</small>
            
        </div>
        <div class="field">
            <label for="date">Date</label>
            <Calendar v-if="!product.no_document" id="date" v-model="product.date" :selectOtherMonths="true" placeholder="Enter date document" :class="{ 'p-invalid': submitted && !product.date }" :manualInput="false" dateFormat="yy-mm-dd" timeZone="Indonesia/Jakarta" :showIcon="true" :showButtonBar="true" required="true" autofocus ></Calendar>
            <Calendar v-else id="date" v-model="product.date" :selectOtherMonths="true" placeholder="Enter date document" :class="{ 'p-invalid': submitted && !product.date }" :manualInput="false" dateFormat="yy-mm-dd" timeZone="Indonesia/Jakarta" :showIcon="true" :showButtonBar="true" required="true" autofocus readonly></Calendar>
            <small class="p-invalid" v-if="submitted && !product.date">Date is required.</small>
        </div>
        <div class="field">
            <label for="description">Description</label>
            <Textarea id="description" v-model="product.description" placeholder="Enter description. e.g: Term & Condition" rows="5" cols="30" />
        </div>
        <div class="field">
            <label for="note">Note</label>
            <Textarea id="note" v-model="product.note" rows="5" cols="30" placeholder="Enter note. e.g: Additional notes" />
        </div>

        <template #footer>
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
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