<script setup>
import { ref, onMounted } from 'vue';

// data start
import { axiosAf } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const products = ref(null);
onMounted( () => {
    fetch();
});

const originalProducts = ref(null);
const fetch = async() =>{
    const response = await axiosAf.get('/af/report/items',{ 
        params: local.value
    });
    if(response.data.status == 200){
        products.value = getDataDate(response.data.response.list);
        originalProducts.value = getDataDate(response.data.response.list);
        projectOptions.value = getOptions(products.value, projectOptions.value, 'project');
    } 
}

const getDataDate = (data) => {
    return [...(data || [])].map((d) => {
        d.af_date = new Date(d.af_date);

        return d;
    });
};

const projectOptions = ref([]);
const getOptions = (list, variableOptions, item) =>{
    for (let i = 0; i < list.length; i++) {
        variableOptions[list[i][item]] = list[i][item];
    }
    
    return Object.values(variableOptions);
}

// data end

// filtering start
import { FilterMatchMode, FilterOperator } from 'primevue/api';
const filters = ref();

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        project: { value: null, matchMode: FilterMatchMode.IN },
        remarks: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        cost_type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },

        price: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        qty: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        total_price: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },

        company: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        person: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        purchase_order: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },

        af_date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },

        document_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        document_type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        
    };
};

initFilters();

const clearFilter = () => {
    initFilters();
};

// filtering end

// export start
const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};

// export end

// formating start
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const formatNumber = (value) => {
    return value?.toLocaleString('id-ID');
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
// formating end

</script>

<template>
    <Toast />
    
    <div class="card">
        <DataTable 
            :value="products" 
            
            v-model:filters="filters"
            dataKey="id" 
            filterDisplay="menu"
            :globalFilterFields="['project', 'remarks', 'cost_type', 'price', 'qty','total_price', 'company', 'person','purchase_order', 'af_date', 'document_number', 'document_type']"
            
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"

            responsiveLayout="scroll"
            size="small"
            resizableColumns 
            columnResizeMode="fit"

            ref="dt"
            csvSeparator=";"
            exportFilename="Report"
            
        >   
            <template #header>
                <div class="flex justify-content-between">
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                    <Button icon="pi pi-external-link" severity="success" label="Export" @click="exportCSV($event)" />
                </div>
            </template>
            <template #empty> No Items found. </template>
            <Column header="#" headerStyle="width:3rem">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>
            <Column header="Project" filterField="project" :showFilterMatchModes="false" sortable >
                <template #body="{ data }">
                    <small>{{ data.project }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <MultiSelect v-model="filterModel.value" :options="projectOptions" placeholder="Any" class="p-column-filter">
                        <template #option="slotProps">
                            <div class="flex align-items-center gap-2">
                                <span>{{ slotProps.option }}</span>
                            </div>
                        </template>
                    </MultiSelect>
                </template>
            </Column>
            <Column field="remarks" header="Remarks" sortable >
                <template #body="{ data }">
                    <small>{{ data.remarks }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by Remarks" />
                </template>
            </Column>
            <Column field="cost_type" header="Overhead" sortable >
                <template #body="{ data }">
                    <small>{{ data.cost_type }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by Overhead" />
                </template>
            </Column>

            <Column field="price" header="price" sortable filterField="price" dataType="numeric" >
                <template #body="{ data }">
                    <small>{{ formatCurrency(data.price) }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="IDR" locale="id-ID" />
                </template>
            </Column>
            <Column field="qty" header="Qty" sortable filterField="qty" dataType="numeric" >
                <template #body="{ data }">
                    <small>{{ formatNumber(data.qty) }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="number" locale="id-ID" />
                </template>
            </Column>
            <Column field="total_price" header="Total Price" sortable filterField="total_price" dataType="numeric" >
                <template #body="{ data }">
                    <small>{{ formatCurrency(data.total_price) }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" mode="currency" currency="IDR" locale="id-ID" />
                </template>
            </Column>

            <Column field="company" header="Company" sortable >
                <template #body="{ data }">
                    <small>{{ data.company }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by Company" />
                </template>
            </Column>
            <Column field="person" header="Person" sortable >
                <template #body="{ data }">
                    <small>{{ data.person }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by Person" />
                </template>
            </Column>
            <Column field="purchase_order" header="PO Number" sortable >
                <template #body="{ data }">
                    <small>{{ data.purchase_order }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by PO Number" />
                </template>
            </Column>

            <Column field="af_date" header="AF Date" sortable filterField="af_date" dataType="date" >
                <template #body="{ data }">
                    <small>{{ format_date(data.af_date) }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <Calendar v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-mm-dd" mask="9999-99-99" :selectOtherMonths="true" timeZone="Indonesia/Jakarta" />
                </template>
            </Column>

            <Column field="document_number" header="AF No." sortable >
                <template #body="{ data }">
                    <small>{{ data.document_number }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by AF No." />
                </template>
            </Column>
            <Column field="document_type" header="Document Type" sortable >
                <template #body="{ data }">
                    <small>{{ data.document_type }}</small>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by Document Type" />
                </template>
            </Column>
            
        </DataTable>
    </div>

</template>