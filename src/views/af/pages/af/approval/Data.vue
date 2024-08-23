<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { axiosAf } from '../../../../../service/axios';

//utilities
const router = useRouter();
const toast = useToast();
const display = ref({
    height: '630px',
});
const props = defineProps([
    'menuType',
    'sortList',
    'selectedChart',
    'selectedChartStack',
    'selectedChartStackProject',
    'selectedChartStackPO'
]);
const emit = defineEmits(['dataChart']); 

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

// local data
const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    access_id: localStorage.getItem('access_id'),
    sign_id: localStorage.getItem('sign_id'),
    division_code: localStorage.getItem('division_code'),
});

// create document
const payload = ref({});

// document list
const products = ref(null);
onMounted( () => {
    fetch();
    getApprovalstatus();
});

const originalProducts = ref(null);
const fetch = async() =>{
    const response = await axiosAf.get('/af/approval/'+props.menuType+'/division/'+local.value.division_code,{ 
        params: local.value
    });
    if(response.data.status == 200){
        products.value = response.data.metadata.list;
        originalProducts.value = response.data.metadata.list;
        emit('dataChart', response.data.metadata);
    } 
    // console.log(originalProducts.value)
}

// chart selected
watch(() => props.selectedChart, async (newValue, oldValue) => {
    var newDate = dateFormating(newValue);
    updateDataFromChart(newDate);
});

const DataDummy = ref([]);
const updateDataFromChart = (DateSelected)=>{
    products.value = originalProducts.value;
    DataDummy.value = [];
    for (let i = 0; i < products.value.length; i++) {
        var productDate =dateFormating(products.value[i].date);
        if (productDate === DateSelected) {
            DataDummy.value.push(products.value[i]);
        }
    }
    products.value = DataDummy.value;
    chartTitle.value = DateSelected;
}

// chart stack selected
watch(() => props.selectedChartStack, async (newValue, oldValue) => {
    updateDataFromStackChart(newValue)
},{ deep: true });

const updateDataFromStackChart = (DateSelected)=>{
    var selectedLabel = DateSelected.label;
    var stackIndex = DateSelected.datasetLabel;
    
    products.value = originalProducts.value;
    DataDummy.value = [];

    for (let i = 0; i < products.value.length; i++) {
        var productDate = dateFormating(products.value[i].date);
        if (productDate == selectedLabel) {
            if(stackIndex == 'total'){
                DataDummy.value.push(products.value[i]);
            }else{
                var itemList = products.value[i].item_list;
                for(let j=0; j < itemList.length; j++){
                    if(itemList[j].cost_type_label == stackIndex){
                        DataDummy.value.push(products.value[i]);
                    }
                }
            }
        }
    }
    products.value = DataDummy.value;
}

// chart stack selected project
watch(() => props.selectedChartStackProject, async (newValue, oldValue) => {
    updateDataFromStackChartProject(newValue)
},{ deep: true });

const updateDataFromStackChartProject = (DateSelected)=>{
    // console.log(DateSelected)
    var selectedLabel = DateSelected.label;
    var stackIndex = DateSelected.datasetLabel;
    var title = DateSelected.title;
    
    products.value = originalProducts.value;
    DataDummy.value = [];

    for (let i = 0; i < products.value.length; i++) {
        var productDate = dateFormating(products.value[i].date);
        if (productDate == selectedLabel) {
            var itemList = products.value[i].item_list;
            if(stackIndex == 'total'){
                for(let j=0; j < itemList.length; j++){
                    if(itemList[j].project.name == title){
                        DataDummy.value.push(products.value[i]);
                    }
                }
            }else{
                for(let j=0; j < itemList.length; j++){
                    if(itemList[j].project.name == title){
                        if(itemList[j].cost_type_label == stackIndex){
                            DataDummy.value.push(products.value[i]);
                        }
                    }
                }
            }
        }
    }
    products.value = DataDummy.value;
}

// chart stack selected PO
watch(() => props.selectedChartStackPO, async (newValue, oldValue) => {
    console.log(newValue)
    updateDataFromStackChartPO(newValue);
},{ deep: true });

const updateDataFromStackChartPO = (DateSelected)=> {
    
    var selectedLabel = DateSelected.label;
    var stackIndex = DateSelected.datasetLabel;
    var title = DateSelected.title;
    
    products.value = originalProducts.value;
    DataDummy.value = [];

    for (let i = 0; i < products.value.length; i++) {
        var productDate = dateFormating(products.value[i].date);
        if (productDate == selectedLabel) {
            var itemList = products.value[i].item_list;
            if(stackIndex == 'total'){
                for(let j=0; j < itemList.length; j++){
                    if(itemList[j].project.name == title){
                        DataDummy.value.push(products.value[i]);
                    }
                }
            }else{
                for(let j=0; j < itemList.length; j++){
                    if(itemList[j].project.name == title){
                        if(itemList[j].cost_type_label == stackIndex){
                            DataDummy.value.push(products.value[i]);
                        }
                    }
                }
            }
        }
    }
    products.value = DataDummy.value;
}

// date builder
const dateFormating = (date)=>{
    var newDate = new Date(date);
    var getMonth = newDate.getMonth()+1;
    if(getMonth < 10){
        getMonth = '0'+getMonth;
    }
    var getYear =  newDate.getFullYear();
    var formatedDate = getYear+'-'+getMonth;

    return formatedDate;
}

// delete document
const selectedProduct = ref(null);
const deleteSelectedDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    payload.value = products.value.filter((val) => selectedProduct.value.includes(val));
    const data = payload.value;
    const response = await axiosAf.delete('/af/approval/document/header',{data: {data},
        params: local.value
    });
    fetch();
    payload.value = {};
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
    deleteSelectedDialog.value = false;
};

// edit data
const onCellEditComplete = async (event) => {
    payload.value.token = local.value.token;
    payload.value.user_id = local.value.user_id;
    payload.value.value = event.newData;

    if(payload.value.value.status.id){
        const data = payload.value;
        const response = await axiosAf.put('/af/approval/document/status',data);
        if(response.data.status == 200){
            payload.value = {};
            fetch();
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });
        }
    }
    
};

const approvalStatusList = ref(null);
const getApprovalstatus = async() =>{
    const response = await axiosAf.get('/af/approval/document/status/list',{ 
        params: local.value
    });
    if(response.data.status == 200){
        approvalStatusList.value = response.data.metadata.list;
    } 
}

// download excel
const chartTitle = ref('all');
const downloadToExcel = async(chartTitle) => {
    await axiosAf.get('/af/approval/excel/'+props.menuType+'/division/'+local.value.division_code+'/chart/'+chartTitle, {
        params: local.value,
        responseType: 'blob' // Menentukan tipe respons sebagai blob (binary large object)
    })
    .then(response => {
        // console.log(response.data.metadata)
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        var dateNow = new Date().toISOString().slice(0, 10);
        link.setAttribute('download', 'report_af_'+dateNow+'.xlsx'); // Atur nama file sesuai kebutuhan Anda
        document.body.appendChild(link);
        link.click();
    })
    .catch(error => {
      console.error(error);
    });
};

</script>

<template>
    <Toast />
    
    <div class="card">
        <DataTable 
            v-model:selection="selectedProduct"
            :value="products"
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table" 
            resizableColumns 
            columnResizeMode="fit"
            :paginator="true"
            :rows="25"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[25, 50, 100]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            class="mt-5"
            :filters="filters"
            removableSort
            :sortField="props.sortList" 
            :sortOrder="-1"
            scrollable 
            :scrollHeight="display.height"
            :reorderableColumns="true"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <Button v-if="props.menuType == 1" icon="pi pi-trash" class="p-button-warning p-button-rounded mr-2" @click="confirmDeleteSelected" title="Delete" :disabled="!selectedProduct || !selectedProduct.length" />
                        <Button v-if="local.sign_id == 0 || local.sign_id == 1 || local.sign_id == 3" icon="pi pi-file-excel" class="p-button-success p-button-rounded mr-2" @click="downloadToExcel(chartTitle)" title="Export to excel" />
                    </div>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                </div>
            </template>
            <Column v-if="props.menuType == 1" selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column header="" headerStyle="width:20rem" sortable >
                <template #body="slotProps">
                    <router-link v-if="slotProps.data.active == 2 && props.menuType == 1" :to="'/af/approval/'+slotProps.data.id" class="mr-2">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-info mt-2" title="Edit" />
                    </router-link>
                    <a :href="'http://103.188.175.175:8022/api/af/approval/pdf/'+slotProps.data.id+'?token='+local.token" target="_blank">
                        <Button icon="pi pi-file-pdf"  class="p-button-rounded p-button-danger mr-2" title="Preview" />
                    </a>
                </template>
            </Column>
            <Column field="status.label" header="Approval Status" class="text-center" headerStyle="width:20rem" sortable >
                <template #body="slotProps">
                    <Tag v-if="slotProps.data.status.id" :severity="slotProps.data.status.severity" :value="slotProps.data.status.label"></Tag>
                    <Tag v-else style="background:black" value="Draft"></Tag>
                </template>
                <template v-if = "props.menuType >= 0 && local.sign_id <= 0 || local.sign_id == 4 " #editor="slotProps">
                    <Dropdown v-if="slotProps.data.status.id" v-model="slotProps.data.status" :options="approvalStatusList" optionLabel="label" placeholder="Select approval status" class="w-full md:w-14rem" ></Dropdown>
                </template>
            </Column>
            <Column field="bank_account_name" header="Account Name" headerStyle="width:20rem" sortable >
                <template #body="slotProps">
                    <span>{{ slotProps.data.bank_account_name }}</span>
                </template>
            </Column>
            <Column field="document_number" header="AF No." headerStyle="width:20rem" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.document_number }}
                </template>
            </Column>
            <Column field="total" header="Total Biaya AF" headerStyle="width:20rem" sortable >
                <template #body="slotProps">
                    {{ slotProps.data.total }}
                </template>
            </Column>
            <Column field="item" header="Items Remarks" headerStyle="width:20rem" sortable>
                <template #body="slotProps">
                    <Textarea v-model="slotProps.data.item" rows="1" cols="50" readonly />
                </template>
            </Column>
            <Column field="project" header="Project's name" headerStyle="width:20rem" sortable>
                <template #body="slotProps">
                    <Textarea v-model="slotProps.data.project" rows="1" cols="50" readonly />
                </template>
            </Column>
            <Column field="purchase_order" header="PO No." headerStyle="width:20rem" sortable>
                <template #body="slotProps">
                    <Textarea v-model="slotProps.data.purchase_order" rows="1" cols="50" readonly />
                </template>
            </Column>
            
            <Column field="date" header="AF Date" headerStyle="width:20rem" sortable >
                <template #body="slotProps">
                    {{ slotProps.data.date }}
                </template>
            </Column>
            <Column field="submission_date" header="Submission date" headerStyle="width:20rem" sortable >
                <template #body="slotProps">
                    {{ slotProps.data.submission_date }}
                </template>
            </Column>
            <Column field="document_type_display" header="Document Type" headerStyle="width:20rem" sortable >
                <template #body="slotProps">
                    {{ slotProps.data.document_type_display }}
                </template>
            </Column>
            
        </DataTable>
    </div>

    <!-- Delete selected dialog -->
    <Dialog v-model:visible="deleteSelectedDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="payload">Are you sure you want to delete the selected data?</span>
        </div>
        <template #footer >
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteSelectedDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
        </template>
    </Dialog>
</template>