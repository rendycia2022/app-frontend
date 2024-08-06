<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, defineProps, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const toast = useToast();
onBeforeMount(() => {
    initFilters();
});

const products = ref(null);
const product = ref({});
const fetching = async () =>{

    const response = await axiosProject.get('/project/summary/purchasing',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.metadata;
};

onMounted(async () => {
    fetching();
});

watch(() => product.value.purchasing, async (newValue, oldValue) => {
    fetching();
});

// management data
const productDialog = ref(false);


const filters = ref({});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
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
        responseType: 'blob' // Menentukan tipe respons sebagai blob (binary large object)
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

// management data
const openDialog = async (editProduct) =>{
    submitted.value = false;
    if(product.value.pr_total == 0){
        toast.add({ severity: "error", summary: "Failed", detail: "Purchase request have no value", life: 6000 });
    }else{
        // fetching on purchase_order_file
        const responseFetch = await axiosProject.get('/project/summary/purchasing/fetch',{ 
            params:{
                token: local.value.token,
                user_id: local.value.user_id,
            }
        });
        console.log(responseFetch.data.metadata);

        product.value = { ...editProduct };
        const response = await axiosProject.get('/project/summary/createid',{ 
            params:{
                token: local.value.token,
                user_id: local.value.user_id,
            }
        });
        product.value.id = response.data.metadata;
        productDialog.value = true;
    }
}

const submitted = ref(false);
const saveProduct = async () => {
    submitted.value = true;
    
    if(product.value.po_no_document && product.value.po_total && product.value.id && product.value.po_date){
        product.value.token = local.value.token;
        product.value.user_id = local.value.user_id;
        product.value.po_date = formatDate(product.value.po_date);
        const data = product.value;
        const response = await axiosProject.post('/project/summary/purchasing',data);
        if(response.data.status == 200){
            fetching();
            product.value = {};
            productDialog.value = false;
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });

        }
    }   
};

// deleteing data
const deleteProductDialog = ref(false);
const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};
const deleteProduct = async () => {
    const data = product.value;
    const response = await axiosProject.delete('/project/summary/purchasing',{data: {data},
        params: local.value
    });
    if(response.data.status == 200){
        product.value = {};
        fetching();
        deleteProductDialog.value = false;
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });

    }

};

const cancelProduct = async () => {
    const data = product.value;
    const response = await axiosProject.delete('/project/summary/purchasing/cancel',{data: {data},
        params: local.value
    });
    if(response.data.status == 200){
        fetching();
        product.value = {};
        productDialog.value = false;
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });

    }
    
};

const removeUploadedFile = (removeUploadedFileCallback, index) =>{
    removeUploadedFileCallback(index)
    
}

// upload file
const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);

const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
};

const onClearTemplatingUpload = (clear) => {
    clear();
    totalSize.value = 0;
    totalSizePercent.value = 0;
};

const onSelectedFiles = (event) => {
    files.value = event.files;
    files.value.forEach((file) => {
        totalSize.value += parseInt(formatSize(file.size));
    });
};

const uploadEvent = (callback) => {
    totalSizePercent.value = totalSize.value / 10;
    callback();
};

const onTemplatedUpload = async () => {
    fetching();
    toast.add({ severity: "success", summary: "Completed", detail: "File Uploaded", life: 3000 });
};

const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const display = ref({
    height: (screen.height*0.9)+'px',
});

</script>

<template>
    <div class="card">
        <DataTable 
            v-model:expandedRows="expandedRows" 
            :value="products" dataKey="direct_id"
            @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" 
            resizableColumns 
            columnResizeMode="fit"
            :filters="filters"
            removableSort
            sortField="purchase_order.po_updated_at" 
            :sortOrder="1"
            scrollable 
            :scrollHeight="display.height"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <div class="text-xl font-bold">Purchase Order</div>
                    </div>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                </div>
            </template>
            <!-- <Column expander style="width: 5rem" /> -->
            <Column header="#" headerStyle="width:3rem">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>
            <Column field="purchase_order.po_no_document" header="PO No." sortable></Column>
            <Column field="" header="PO Document" >
                <template #body="slotProps">
                    <Button v-if="!slotProps.data.purchase_order.po_filename && slotProps.data.pr_total != 0" icon="pi pi-plus" class="p-button-rounded p-button-success mr-2" title="Create Button" @click="openDialog(slotProps.data)" />
                    <a v-if="slotProps.data.purchase_order.po_filename" :href="slotProps.data.purchase_order.po_public_path+slotProps.data.purchase_order.po_filename" target="_blank">
                        <Button  icon="pi pi-file-pdf" class="p-button-rounded p-button-danger mr-2" title="Preview Button" />
                    </a>
                    <div v-if="slotProps.data.purchase_order.po_filename" class="mt-1">
                        <object :data="slotProps.data.purchase_order.po_public_path+slotProps.data.purchase_order.po_filename" alt="Document's purchasing" style="max-width: 228px" ></object>
                    </div>
                </template>
            </Column>
            <Column field="purchase_order.po_total" header="PO total" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.purchase_order.po_total) }}
                </template>
            </Column>
            <Column field="purchase_order.po_updated_by" header="PO Updated by" sortable></Column>
            <Column field="purchase_order.po_updated_at" header="PO Updated at" sortable></Column>

            <Column field="pr_no_document" header="PR No." sortable></Column>
            <Column field="pr_total" header="PR Total" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.pr_total) }}
                </template>
            </Column>
            <Column headerStyle="" header="PR Document">
                <template #body="slotProps">
                    <a :href="'http://103.188.175.175:8021/api/public/files/direct/'+slotProps.data.direct_cost_id+'/purchase/'+slotProps.data.purchase_request_id+'/pdf?project_id='+slotProps.data.project_id+'&user_id='+local.user_id" target="_blank">
                        <Button icon="pi pi-file-pdf"  class="p-button-rounded p-button-info mr-2" title="Pdf Button" />
                    </a>
                </template>
            </Column>
            <Column field="pr_updated_by" header="PR Updated by" sortable></Column>
            <Column field="pr_updated_at" header="PR Updated at" sortable></Column>
            <Column field="project_name" header="Project" sortable></Column>
            <Column field="" header="Actions" >
                <template #body="slotProps">
                    <Button v-if="slotProps.data.purchase_order.purchase_order_id" icon="pi pi-replay" class="p-button-rounded p-button-danger mr-2" title="Cancel Button" @click="confirmDeleteProduct(slotProps.data)" />
                </template>
            </Column>
            
            <template #expansion="slotProps">
                
            </template>
        </DataTable>
        <Toast />
    </div>

    <Dialog v-model:visible="productDialog" :style="{ width: '1080px' }" header="Purchasing Order" :closable="false" :modal="true" maximizable modal >
        
        <div class="mb-3">
            <div class="p-fluid">
                <div class="grid">
                    <div class="field col-6 sm:col-12 lg:col-6 xl:col-6" hidden>
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.id" readonly/>
                    </div>
                    <div class="field col-6 sm:col-12 lg:col-6 xl:col-6" hidden>
                        <label for="purchase_request_id">Purchase Request ID</label>
                        <InputText id="purchase_request_id" v-model="product.purchase_request_id" readonly/>
                    </div>
                    <div class="field col-6 sm:col-12 lg:col-6 xl:col-6">
                        <label for="purchase_request_id">Purchase Request No.</label>
                        <InputText id="purchase_request_id" v-model="product.pr_no_document" readonly/>
                    </div>
                    <div class="field col-6 sm:col-12 lg:col-6 xl:col-6">
                        <label for="purchase_request_id">Purchase Request total</label>
                        <InputNumber id="po_total" v-model="product.pr_total" mode="currency" currency="IDR" locale="id-ID" readonly />
                    </div>
                    <div class="field col-4 sm:col-12 lg:col-4 xl:col-4 md:col-6">
                        <label for="po_no_document">Purchase Order's No.</label>
                        <InputText id="po_no_document" v-model="product.po_no_document" placeholder="Enter Purchase order number" :class="{ 'p-invalid': submitted && !product.po_no_document }" required="true" autofocus  />
                        <small class="p-invalid" v-if="submitted && !product.po_no_document">Purchase order number required.</small>
                    </div>
                    <div class="field col-4 sm:col-12 lg:col-4 xl:col-4 md:col-6">
                        <label for="po_date">Purchase Order's Date</label>
                        <Calendar id="po_date" v-model="product.po_date" :selectOtherMonths="true" :class="{ 'p-invalid': submitted && !product.po_date }" required="true" autofocus dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" ></Calendar>
                        <small class="p-invalid" v-if="submitted && !product.po_date">Purchase order's date required.</small>
                    </div>
                    <div class="field col-4 sm:col-12 lg:col-4 xl:col-4 md:col-6">
                        <label for="po_total">Purchase Order's total</label>
                        <InputNumber id="po_total" v-model="product.po_total" mode="currency" currency="IDR" locale="id-ID" placeholder="Enter total purchase order" :class="{ 'p-invalid': submitted && !product.po_total }" required="true" autofocus />
                        <small class="p-invalid" v-if="submitted && !product.po_total">Purchase order's total required.</small>
                    </div>
                    
                </div>
            </div>
            <div class="field">
                <label>Upload File</label>
                <FileUpload name="files" :url="'http://103.188.175.175:8021/api/public/purchaseorderid/'+product.id+'/user/'+local.user_id+'/purchaseorder/upload'" :auto="true" @upload="onTemplatedUpload($event)" accept="image/*,.pdf" :maxFileSize="1000000000" @select="onSelectedFiles" >
                    <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
                        <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                            <div class="flex gap-2">
                                <Button @click="chooseCallback()" icon="pi pi-images" rounded outlined></Button>
                                <!-- <Button @click="clearImport(clearCallback)" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button> -->
                            </div>
                            <ProgressBar :value="totalSizePercent" :showValue="false" :class="['md:w-20rem h-1rem w-full md:ml-auto', { 'exceeded-progress-bar': totalSizePercent > 100 }]"
                                ><span class="white-space-nowrap">{{ totalSize }}B / 1Mb</span></ProgressBar
                            >
                        </div>
                    </template>
                    <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                        <div v-if="files.length > 0">
                            <h5>Pending</h5>
                            <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                                <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                                    <span class="font-semibold">{{ file.name }}</span>
                                    <div>{{ formatSize(file.size) }}</div>
                                    <Badge value="Pending" severity="warning" />
                                </div>
                            </div>
                        </div>

                        <div v-if="uploadedFiles.length > 0">
                            <h5>Completed</h5>
                            <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                                <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                                    <span class="font-semibold">{{ file.name }}</span>
                                    <div>{{ formatSize(file.size) }}</div>
                                    <Badge value="Completed" class="mt-3" severity="success" />
                                    <Button icon="pi pi-times" @click="removeUploadedFile(removeUploadedFileCallback, index)" outlined rounded  severity="danger" />
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <div class="flex align-items-center justify-content-center flex-column">
                            <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                            <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
                        </div>
                    </template>
                    <template #footer>

                    </template>
                </FileUpload>
            </div>
            <!-- <div v-if="product.purchasing.id">
                <object :data="product.purchasing.path+product.purchasing.filename" alt="Document's purchasing" ></object>
                <a :href="product.purchasing.path+product.purchasing.filename" target="_blank"><Button label="Preview" class="p-button-text" /></a>
            </div> -->
            
        </div>
        
        <template #footer >
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelProduct" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
        </template>
    </Dialog>

    <!-- Delete dialog  -->
    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" :closable="false" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product.purchase_order"
                >Are you sure you want to cancel <b>{{ product.purchase_order.po_no_document }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
        </template>
    </Dialog>
    
</template>