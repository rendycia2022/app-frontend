<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosProject } from '../../../../service/axios';

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const props = defineProps({
    revenueId: {
        type: String,
        required: true
    },
});

const toast = useToast();

const products = ref(null);
const product = ref({});

// filter
onBeforeMount(() => {
    initFilters();
});
const filters = ref({});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const fetching = async()=>{
    local.value.revenue_id = props.revenueId;
    const response = await axiosProject.get('/project/summary/sites',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            revenue_id: local.value.revenue_id,
        }
    });
    products.value = response.data.metadata.list;
}

// getting data
onMounted(async () => {
    fetching();
});

// formating data
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

const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// Data manipulate
// create data
const createNew = async () => {
    const payload = local.value;
    const response = await axiosProject.post('/project/summary/sites',payload);
    fetching();
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data created', life: 5000 });
};

// edit data
const onCellEditComplete = async (event) => {
    product.value = event.newData;

    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;
    product.value.revenue_id = local.value.revenue_id;

    const data = product.value;
    const response = await axiosProject.put('/project/summary/sites',data);
    fetching();
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
};

// import data
const sites = ref(null);
const importDialog = ref(false);

const fetchingSites = async () =>{
    const response = await axiosProject.get('/project/summary/sites/import',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
            revenue_id: local.value.revenue_id,
        }
    });
    sites.value = response.data.metadata;
}

const importData = async () => {
    fetchingSites();
    importDialog.value = true;
};

const saveImport = async () => {
    const payload = local.value;
    const response = await axiosProject.post('/project/summary/sites/import',payload);
    importDialog.value = false;
    fetching();
};

const cancelImport = async () => {
    await axiosProject.delete('/project/summary/sites/import',{
        params: local.value
    });
    importDialog.value = false;
};

const clearImport = async () => {
    await axiosProject.delete('/project/summary/sites/import',{
        params: local.value
    });
    fetchingSites();
    toast.add({ severity: "error", summary: "Attention", detail: "Data cleared", life: 6000 });
};

const templateDocument = async () => {
    await axiosProject.get('/project/summary/sites/template/download', {
        params:{
                token: local.value.token,
            },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'import_sites_template.xlsx'); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};

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
    fetchingSites();
    toast.add({ severity: "success", summary: "Completed", detail: "File Uploaded", life: 3000 });
};

const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
    const response = await axiosProject.delete('/project/summary/sites',{data: {data},
        params: local.value
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
    <div class="card">
        <DataTable 
            :value="products"
            v-model:selection="selectedProduct" 
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table" 
            resizableColumns 
            columnResizeMode="fit"
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            :filters="filters"
            removableSort
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div class="my-2">
                        <Button icon="pi pi-trash" rounded class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length" />
                        <Button icon="pi pi-plus" rounded class="p-button-success mr-2" @click="createNew" />
                        <Button icon="pi pi-cloud-upload" rounded class="p-button-primary mr-2" @click="importData" />
                        <Button icon="pi pi-file-excel" rounded outlined class="p-button-success" @click="templateDocument()" ></Button>
                    </div>
                    <div class="my-2">
                        <span class="block mt-2 md:mt-0 p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </span>
                    </div>
                    
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column field="counter" header="No." sortable ></Column>
            <Column field="site_id" header="Id" sortable >
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" placeholder="Enter site Id..." />
                </template>
            </Column>
            <Column field="site_name" header="Name" sortable >
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" placeholder="Enter site name..." />
                </template>
            </Column>
            <Column field="site_area" header="Area" sortable >
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" placeholder="Enter site area..." />
                </template>
            </Column>
        </DataTable>
    </div>

    <!-- Sites -->
    <Dialog v-model:visible="importDialog" :style="{ width: '1080px' }" header="Import Sites" :modal="true" :closable="false" maximizable modal >
        <div class="mb-3">
            <FileUpload name="files" :url="'http://103.188.175.175:8021/api/public/project/'+local.project_id+'/user/'+local.user_id+'/files/'+local.revenue_id+'/import'" :auto="true" @upload="onTemplatedUpload($event)" accept=".xlsx,.xls" :maxFileSize="1000000000" @select="onSelectedFiles" >
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
                                <!-- <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" outlined rounded  severity="danger" /> -->
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
        
        <DataTable 
            :value="sites"
            v-model:selection="selectedProduct" 
            resizableColumns 
            columnResizeMode="fit"
        >
            <Column field="counter" header="No." ></Column>
            <Column field="site_id" header="Id" sortable></Column>
            <Column field="site_name" header="Name" sortable></Column>
            <Column field="site_area" header="Area" sortable></Column>

        </DataTable>
        <template #footer >
            <Button label="Clear" icon="pi pi-replay" class="p-button-text" @click="clearImport" />
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelImport" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveImport" />
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