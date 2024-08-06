
<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount,  defineProps, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../service/axios';

const toast = useToast();

// filtering
onBeforeMount(() => {
    initFilters();
});
const filters = ref({});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// getting data
const products = ref(null);
const product = ref({});

const fetching = async () =>{
    const response = await axiosProject.get('/bast/wctr/list/',{});
    products.value = response.data.metadata;
}

onMounted( () => {
    fetching();
});

// manage data
const productDialog = ref(false);
const createProduct = async () =>{
    productDialog.value = true;
    const responseCreateId = await axiosProject.get('/bast/wctr/list/createid',{});
    product.value.id = responseCreateId.data.metadata;
}

const saveProduct = async () =>{
    
    if(product.value.id){
        const data = product.value;
        const response = await axiosProject.post('/bast/wctr/list', data);
        if(response.data.status == 200){
            productDialog.value = false;
            product.value = {};
            fetching();
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
        }
    }else{
        toast.add({ severity: "warn", summary: "Attention!.", detail: "Id not found. Please contact your Administrator.", life: 5000 });
    }
    
}

const cancelProduct = async() =>{
    const response = await axiosProject.get('/bast/wctr/list/batch/clear',{
        params:{
            id: product.value.id,
        }
    });
    if(response.data.status == 200){
        productDialog.value = false;
        product.value = {};
        batch.value = null;
        fetching();
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
    }
}

const templateDownload = async () => {
    await axiosProject.get('/bast/wctr/list/template/download', {
        params:{
                
            },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_wctr.xlsx'); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};

// upload data
const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);

const batch = ref(null);
const fetchingBatch = async (id) =>{
    const response = await axiosProject.get('/bast/wctr/list/batch',{
        params:{
            id: id,
        }
    });
    batch.value = response.data.metadata;
}

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
    fetchingBatch(product.value.id);
    toast.add({ severity: "success", summary: "Completed.", detail: "File Uploaded", life: 5000 });
};

const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// report download 
const wctr = async (editProduct) => {
    product.value = { ...editProduct };
    const filename = 'WCTR '+product.value.tower_id+' '+product.value.site_name+' '+product.value.ring_id+' '+product.value.scope_of_work+' '+product.value.completion_date+'.docx';
    await axiosProject.get('/bast/wctr/list/download/wctr', {
        params:{
            id: product.value.id,
        },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};


const wcc = async (editProduct) => {
    product.value = { ...editProduct };
    const filename = 'WCC '+product.value.tower_id+' '+product.value.site_name+' '+product.value.ring_id+' '+product.value.scope_of_work+' '+product.value.completion_date+'.xlsx';
    await axiosProject.get('/bast/wctr/list/download/wcc', {
        params:{
            id: product.value.id,
        },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};
// delete data
const selectedProduct = ref(null);
const deleteSelectedDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    product.value = products.value.filter((val) => selectedProduct.value.includes(val));
    const data = product.value;
    const response = await axiosProject.delete('/bast/wctr/list',{data: {data},
        // params: local.value
    });
    if(response.data.status == 200){
        fetching();
        deleteSelectedDialog.value = false;
        selectedProduct.value = null;
    }   
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
};

</script>

<template>
    <Toast />
    <Toolbar class="mt-3 mb-2">
        <template v-slot:start>
            <div class="text-xl font-bold mr-2">Work Completion Time Report</div>
        </template>
        <template v-slot:end>
        </template>
    </Toolbar>
    <DataTable 
        :value="products"
        v-model:selection="selectedProduct"
        tableStyle="min-width: 50rem"
        resizableColumns 
        columnResizeMode="fit"
        :paginator="true"
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 100, 200]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        :filters="filters"
        removableSort
        sortField="updated_at" 
        :sortOrder="-1"
    >
        <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                <div style="text-align:left">
                    <Button icon="pi pi-trash" severity="danger" rounded class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" />
                    <Button icon="pi pi-plus" severity="success" rounded class="p-button-success mr-2" @click="createProduct()" title="Import new data" /> 
                    <Button icon="pi pi-file-excel" rounded outlined class="p-button-success" @click="templateDownload()" title="Download import template file" ></Button>
                </div>
                <span class="block mt-2 md:mt-0 p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </span>
            </div>
        </template>
        <Column header="#" headerStyle="width:3rem">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>
        <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
        <Column field="" header="" >
            <template #body="slotProps">
                <Button label="WCTR" class="p-button p-button-info mr-2" title="download file Work Completion Time Report" @click="wctr(slotProps.data)" />
                <Button label="WCC" class="p-button p-button-warning mr-2" title="download file Work Completion Time Report" @click="wcc(slotProps.data)" />
            </template>
        </Column>
        <Column field="project_manager" header="Project Manager" sortable></Column>
        <Column field="scope_of_work" header="Scope of work" sortable></Column>
        <Column field="work_description" header="Work description" sortable></Column>
        <Column field="tower_id" header="Tower id" sortable></Column>
        <Column field="site_name" header="Site name" sortable></Column>
        <Column field="ring_id" header="Ring id" sortable></Column>
        <Column field="po_number" header="PO number" sortable></Column>
        <Column field="on_this_day" header="on this day" sortable></Column>
        <Column field="date_issued" header="Date issued" sortable></Column>
        <Column field="approver_1" header="Approver 1" sortable></Column>
        <Column field="approver_2" header="Approver 2" sortable></Column>
        <Column field="approver_3" header="Approver 3" sortable></Column>
        <Column field="tssr" header="tssr" sortable></Column>
        <Column field="start_date" header="Start date" sortable></Column>
        <Column field="completion_date" header="Completion date" sortable></Column>
        <Column field="remaining_material" header="Remaining material" sortable></Column>
        <Column field="remarks" header="Remarks" sortable></Column>
        <Column field="remarks_1" header="Remarks 1" sortable></Column>
        <Column field="customer" header="Customer" sortable></Column>
    </DataTable>

    <Dialog v-model:visible="productDialog" :style="{ width: '1080px' }" header="Upload data" :closable="false" :modal="true" maximizable modal >
        
        <div class="mb-3">
            <div class="p-fluid">
                <div class="grid">
                    <div class="field col-6 sm:col-12 lg:col-6 xl:col-6">
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.id" readonly/>
                    </div>
                    
                </div>
            </div>
            <div class="field">
                <label>Upload File</label>
                <FileUpload name="files" :url="'http://103.188.175.175:8021/api/bast/wctr/list/batch/'+product.id+'/import'" :auto="true" @upload="onTemplatedUpload($event)" accept=".xlsx,.xls" :maxFileSize="1000000000" @select="onSelectedFiles" >
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
            <div>
                <DataTable 
                    :value="batch" 
                    resizableColumns 
                    columnResizeMode="fit"
                >
                    <Column header="#" headerStyle="width:3rem">
                        <template #body="slotProps">
                            {{ slotProps.index + 1 }}
                        </template>
                    </Column>
                    <Column field="project_manager" header="Project Manager" sortable></Column>
                    <Column field="scope_of_work" header="Scope of work" sortable></Column>
                    <Column field="work_description" header="Work description" sortable></Column>
                    <Column field="tower_id" header="Tower id" sortable></Column>
                    <Column field="site_name" header="Site name" sortable></Column>
                    <Column field="ring_id" header="Ring id" sortable></Column>
                    <Column field="po_number" header="PO number" sortable></Column>
                    <Column field="on_this_day" header="on this day" sortable></Column>
                    <Column field="date_issued" header="Date issued" sortable></Column>
                    <Column field="approver_1" header="Approver 1" sortable></Column>
                    <Column field="approver_2" header="Approver 2" sortable></Column>
                    <Column field="approver_3" header="Approver 3" sortable></Column>
                    <Column field="tssr" header="tssr" sortable></Column>
                    <Column field="start_date" header="Start date" sortable></Column>
                    <Column field="completion_date" header="Completion date" sortable></Column>
                    <Column field="remaining_material" header="Remaining material" sortable></Column>
                    <Column field="remarks" header="Remarks" sortable></Column>
                    <Column field="remarks_1" header="Remarks 1" sortable></Column>
                    <Column field="customer" header="Customer" sortable></Column>

                </DataTable>
            </div>
        </div>
        
        <template #footer >
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelProduct" />
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

<style lang="scss" scoped>
::v-deep(.editable-cells-table td.p-cell-editing) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>