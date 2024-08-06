<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { axiosHR } from '../../../../service/axios';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const products = ref(null);
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const params = ref({});

onBeforeMount(() => {
    initFilters();
});
onMounted( async() => {
    const result = await axiosHR.get('/reimbursment/data/transaction/report',{
        params:{
            token: localStorage.getItem('token'),
        }
    })
    .then(response => {
        products.value = response.data.metadata.report;
        console.log(products.value[1])
    })
    .catch(error => {
        console.log(error)
    })
});

const formatCurrency = (value) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const handleSearchData = async () => {
    
    await axiosHR.get('/reimbursment/data/transaction/report',{
        params:{
            token: localStorage.getItem('token'),
            start_date: params.value.start_date,
            end_date: params.value.end_date,
        }
    })
    .then(response => {
        if(response.data.metadata.report === ''){
            products.value = null
        }else{
            products.value = response.data.metadata.report;
        }
        if(params.value.start_date === undefined){
            params.value.start_date = null
        }else{
            params.value.start_date = format_date(params.value.start_date);
        }
        if(params.value.end_date === undefined){
            params.value.end_date = null
        }else{
            params.value.end_date = format_date(params.value.end_date);
        }
    })
    .catch(error => {
        console.log(error)
    })
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

const exportCSV = () => {
    dt.value.exportCSV();
};

const exportExcel = async () => {
    params.value.token = localStorage.getItem('token');
    const data = params.value;
    await axiosHR.get('/reimbursment/data/transaction/report/download', {
        params:{
                token: localStorage.getItem('token'),
                start_date: params.value.start_date,
                end_date: params.value.end_date,
            },
        responseType: 'blob' // Menentukan tipe respons sebagai blob (binary large object)
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report_summary_reimbursement.xlsx'); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
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
                            <!-- filter area-->
                            <div>
                                <Calendar :showIcon="true" :showButtonBar="true" v-model="params.start_date" class="mr-2" placeholder="Pick date start" :manualInput="false" dateFormat="yy-mm-dd" timeZone="Indonesia/Jakarta" autofocus ></Calendar>
                                <i class="pi pi-minus mr-2" style="font-size: 1rem"></i>
                                <Calendar :showIcon="true" :showButtonBar="true" v-model="params.end_date" class="mr-2" placeholder="Pick date end" :manualInput="false" dateFormat="yy-mm-dd" timeZone="Indonesia/Jakarta" autofocus ></Calendar>
                                <Button icon="pi pi-search" class="p-button-info mr-2" @click="handleSearchData()" />
                                <!-- <Button label="Export Excel" icon="pi pi-download" class="p-button-success mr-2" @click="exportExcel()" /> -->
                            </div> 
                        </div>
                    </template>

                    <template v-slot:end>
                        
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    csvSeparator=";"
                    :value="products"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 100]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                    size="small"
                    scrollable scrollHeight="540px" tableStyle="min-width: 50rem"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Report Reimbursement</h5>
                            <div class="grid block mt-2 md:mt-0">
                                <span class=" p-input-icon-left mr-2">
                                    <i class="pi pi-search" />
                                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                                </span>
                                <Button label="Export CSV" icon="pi pi-download" class="p-button-help" @click="exportCSV($event)" />
                            </div>
                        </div>
                    </template>
                    <Column field="B" header="Request ID" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Request ID</span>
                            <small>{{ slotProps.data.B }}</small>
                        </template>
                    </Column>
                    <Column field="C" header="Invoice Date" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Invoice Date</span>
                            <small>{{ slotProps.data.C }}</small>
                        </template>
                    </Column>
                    <Column field="D" header="Submit Date" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Submit Date</span>
                            <small>{{ slotProps.data.D }}</small>
                        </template>
                    </Column>
                    <Column field="E" header="NIK" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">NIK</span>
                            <small>{{ slotProps.data.E }}</small>
                        </template>
                    </Column>
                    <Column field="F" header="Employee" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Employee</span>
                            <small>{{ slotProps.data.F }}</small>
                        </template>
                    </Column>
                    <Column field="G" header="Company" :sortable="true" headerStyle="width:18%; min-width:14rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Company</span>
                            <small>{{ slotProps.data.G }}</small>
                        </template>
                    </Column>
                    <Column field="H" header="Division" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Division</span>
                            <small>{{ slotProps.data.H }}</small>
                        </template>
                    </Column>
                    <Column field="I" header="Types of Health Claims" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Types of Health Claims</span>
                            <small>{{ slotProps.data.I }}</small>
                        </template>
                    </Column>
                    <Column field="J" header="Type of disease" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Type of disease</span>
                            <small>{{ slotProps.data.J }}</small>
                        </template>
                    </Column>
                    <Column field="K" header="Treatment Place" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Treatment Place</span>
                            <small>{{ slotProps.data.K }}</small>
                        </template>
                    </Column>
                    <Column field="L" header="Base Plafon" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Base Plafon</span>
                            <small>{{ formatCurrency(slotProps.data.L) }}</small>
                        </template>
                    </Column>
                    <Column field="M" header="Usage" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Usage</span>
                            <small>{{ formatCurrency(slotProps.data.M) }}</small>
                        </template>
                    </Column>
                    <Column field="N" header="Total Amount" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Total Amount</span>
                            <small>{{ formatCurrency(slotProps.data.N) }}</small>
                        </template>
                    </Column>
                    <Column field="O" header="Balance" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Balance</span>
                            <small>{{ formatCurrency(slotProps.data.O) }}</small>
                        </template>
                    </Column>
                    <Column field="P" header="Status" :sortable="true" headerStyle="width:18%; min-width:18rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <small>{{ slotProps.data.P }}</small>
                        </template>
                    </Column>
                </DataTable>

                <!-- Dialog start -->
                <!-- Dialog end -->
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
