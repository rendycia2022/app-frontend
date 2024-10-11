<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/cia/composables/layout';
import { axiosManagement, axiosProject } from '../../../../service/axios';

// components
import IndirectList from './components/IndirectList.vue';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

// data
const products = ref(null);
const productsOriginal = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/list',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
    productsOriginal.value = response.data.list;
}
onMounted( () => {
    fetching();
});

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

const selectedStatus = ref();
const status = ref(["Open", "Close"]);
watch(() => selectedStatus.value, async (newValue, oldValue) => {
    if(newValue != null){
        products.value = productsOriginal.value;
        products.value = products.value.filter((val) => val.status.includes(newValue));
    }
});

const clearSelected = () =>{
    products.value = productsOriginal.value;
    selectedStatus.value = null;
}

// grouping
const expandedRowGroups = ref();
const getSeverity = (status) => {
    switch (status) {
         case 'Close':
            return 'success';
        case 'Open':
            return 'warning';

    }
};

const calculateTotalQty = (name) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.cust_init === name) {
                
                total++;

            }
        }
    }

    return total;
};

const calculateTotalQtyStatus = (name, meta) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.cust_init === name) {
                
                if(product.status == meta){
                    total++;
                }
            }
        }
    }

    return total;
};

const calculateTotal = (name, meta) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.cust_init === name) {
                
                total = total + product[meta];

            }
        }
    }

    return total;
};

const calculateTotalCost = (name) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.cust_init === name) {
                let subtotal = product.direct.total + product.indirect;
                total = total + subtotal;

            }
        }
    }

    return total;
};

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
};

// data formulas
const margin = (revenue, cost) =>{
    var percent = 0;

    var totalMargin = revenue - cost;
    if(totalMargin > 0){
        percent = (totalMargin / revenue) * 100;
    }

    return Math.round(percent);
}

// edit data
const onCellEditComplete = async (event) => {
    let { data, newValue, field } = event;
    data[field] = newValue;
    data['token'] = local.value.token;
    data['user_id'] = local.value.user_id;
    const response = await axiosManagement.post('/project/list/remarks', data);
    if(response.data.status == 200){
        fetching();  
    }   
};

const handleEnterKey = (event) =>{
    // Prevents Enter key from submitting the form and instead adds a new line
    event.stopPropagation();
};

// row style conditional
const rowClass = (data) => {
    return [{ 'bg-red-100 ': data.indirect > data.af_total }];
};

const textAreaNewLineCount = (text) =>{
    var lines = text.split(/\r|\r\n|\n/);
    var count = lines.length;

    return count;
}

// dialog
const product = ref({});
const closeDialog = (dialog) =>{
    dialog = false;
    fetching();
    product.value = {};
}

const indirectDialog = ref(false);
const openIndirectDialog = (detail) => {
    product.value = detail;
    indirectDialog.value = true;
    // console.log(product.value) 
};

// export
const dt = ref(null);
const exportCSV = () => {
    dt.value.exportCSV();
};

// openExternalLink
const openLink = (link) =>{
    window.open(link, '_blank').focus();
}

// information
// menu panel
const op2 = ref(null);
const toggleController = (event) => {
    op2.value.toggle(event);
};

</script>

<template>
    <div class="card">
        <DataTable
            v-model:expandedRowGroups="expandedRowGroups" 
            :value="products" 
            tableStyle="min-width: 50rem"
            expandableRowGroups 
            rowGroupMode="subheader" 
            groupRowsBy="representative.cust_init"
            sortMode="single" sortField="representative.cust_init" :sortOrder="1"
            scrollable scrollHeight="720px"
            :filters="filters"
            removableSort
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table"
            :rowClass="rowClass"
            ref="dt"
            csvSeparator=";"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                    <div class="grid">
                        <Dropdown v-model="selectedStatus" :options="status" placeholder="Select status" class="w-100 mr-1"></Dropdown>
                        <Button icon="pi pi-times" aria-label="Clear" v-tooltip="'Clear filter'" size="small" rounded severity="danger" @click="clearSelected" />
                    </div>
                    <div class="grid">
                        <Button v-tooltip="'Information'" @click="toggleController" class="mr-1" severity="secondary" icon="pi pi-question" size="small" rounded />
                        <Button @click="exportCSV($event)" label="Export CSV" severity="info" icon="pi pi-download" size="small" />
                    </div>
                    <OverlayPanel ref="op2" appendTo="body" id="overlay_panel" >
                        <div class="flex flex-wrap gap-2 justify-end">
                            <ul>
                                <li><b class="text-blue-500">BLUE</b> Color Text is LINK to PPS and AF Web Applications</li>
                            </ul>
                        </div>
                        
                    </OverlayPanel>
                </div>
            </template>
            <template #groupheader="slotProps">
                <span class="align-middle ml-2 font-bold leading-normal">
                    <small>{{ slotProps.data.representative.cust_init }}, 
                        Total Nilai PO: {{ formatCurrency(calculateTotal(slotProps.data.representative.cust_init, 'po_value')) }}
                        | Total Invoice: {{ formatCurrency(calculateTotal(slotProps.data.representative.cust_init, 'revenue')) }}
                        | Total Cost: {{ formatCurrency(calculateTotalCost(slotProps.data.representative.cust_init)) }}
                        | Margin: {{ margin(calculateTotal(slotProps.data.representative.cust_init, 'po_value'), calculateTotalCost(slotProps.data.representative.cust_init)) }}%
                        | Total PO: {{ calculateTotalQty(slotProps.data.representative.cust_init) }}
                        | Open: {{ calculateTotalQtyStatus(slotProps.data.representative.cust_init, 'Open') }}
                        | Close: {{ calculateTotalQtyStatus(slotProps.data.representative.cust_init, 'Close') }}
                    </small>
                </span>
            </template>
            <Column field="representative.cust_init" header="Customer" :sortable="true" headerStyle="width:20%; min-width:20rem;">
            </Column>
            <Column field="po_date" header="Date" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Date</small></span>
                    <span>{{ slotProps.data.po_date }}</span>
                </template>
            </Column>
            <Column field="status" header="Status" :sortable="true" headerStyle="width:10%; min-width:8rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Status</small></span>
                    <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <Column field="remarks" header="Remarks" style="min-width: 200px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Remarks</small></span>
                    <Textarea v-model="slotProps.data.remarks" :rows="textAreaNewLineCount(slotProps.data.remarks)" cols="30" readonly />
                </template>
                <template #editor="{ data, field }">
                    <Textarea v-model="data[field]" @keydown.enter="handleEnterKey" rows="5" cols="30" placeholder="Remarks..." />
                </template>
            </Column>
            <Column field="no_document" header="PO Number" :sortable="true" headerStyle="width:20%; min-width:20rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>PO Number</small></span>
                    <Button v-if="slotProps.data.project_link" @click="openLink(slotProps.data.project_link)" :label="slotProps.data.no_document" severity="info" v-tooltip="'See more'" size="small" text />
                    <Button v-else :label="slotProps.data.no_document" severity="secondary" size="small" text />
                </template>
            </Column>
            <Column field="document_po" header="File PO" class="text-center" :sortable="true" headerStyle="width:10%; min-width:8rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small></small></span>
                    <Button v-if="slotProps.data.document_po" @click="openLink(slotProps.data.document_po)" severity="info" v-tooltip="'Open file'" icon="pi pi-file" size="small" rounded />
                </template>
            </Column>
            <Column field="project" header="Project's Name" :sortable="true" headerStyle="width:20%; min-width:15rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Project</small></span>
                    <span>{{ slotProps.data.project }}</span>
                </template>
            </Column>
            <Column field="po_value" header="Nilai PO" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Nilai PO</small></span>
                    <small>{{ formatCurrency(slotProps.data.po_value) }}</small>
                </template>
            </Column>
            <Column field="revenue" header="Invoice" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Invoice</small></span>
                    <small>{{ formatCurrency(slotProps.data.revenue) }}</small>
                </template>
            </Column>
            <Column field="indirect" header="Indirect" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Indirect</small></span>
                    <Button :label="formatCurrency(slotProps.data.indirect).toString()" class="small-padding-button" severity="info" @click="openIndirectDialog(slotProps.data)" rounded text size="small"  />
                </template>
            </Column>
            <Column field="direct.total" header="Direct" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Direct</small></span>
                    <Button v-if="slotProps.data.project_link" @click="openLink(slotProps.data.project_link)" :label="formatCurrency(slotProps.data.direct.total)" severity="info" v-tooltip="'Direct cost detail'" size="small" text />
                    <Button v-else :label="formatCurrency(slotProps.data.direct.total)" severity="secondary" size="small" text />
                </template>
            </Column>
            <Column field="cogs" header="Total Cost / COGS" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Total Cost</small></span>
                    <small>{{ formatCurrency(slotProps.data.indirect + slotProps.data.direct.total) }}</small>
                </template>
            </Column>
            <Column field="margin" header="Margin" :sortable="true" headerStyle="width:20%; min-width:15rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Margin</small></span>
                    <small>{{ formatCurrency(slotProps.data.po_value - (slotProps.data.indirect + slotProps.data.direct.total)) }}</small>
                </template>
            </Column>
            <Column field="margin_percent" header="% Margin" class="text-center" :sortable="true" headerStyle="width:10%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>% Margin</small></span>
                    <small>{{ margin(slotProps.data.po_value, (slotProps.data.indirect + slotProps.data.direct.total)) }}%</small>
                </template>
            </Column>
            <Column field="hpp_subcon" header="HPP Subcon (in %)" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>HPP Subcon (in %)</small></span>
                    <small v-if="slotProps.data.revenue > 0">{{ margin(slotProps.data.po_value, slotProps.data.direct.total) }}%</small>
                </template>
            </Column>
            <Column field="hpp_nonsubcon" header="HPP Non Subcon (in %)" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>HPP Non Subcon (in %)</small></span>
                    <small v-if="slotProps.data.revenue > 0">{{ margin(slotProps.data.po_value, slotProps.data.indirect) }}%</small>
                </template>
            </Column>
            
        </DataTable>
    </div>

    <Dialog 
        v-model:visible="indirectDialog" 
        maximizable modal 
        :header="'List AF for '+product.no_document" 
        :style="{ width: '100rem' }"
        @after-hide="closeDialog(indirectDialog)"
    >
        <IndirectList :params="product" />
    </Dialog>
    
</template>
<style lang="scss" scoped>
.container {
    position: relative;
    overflow: hidden;
    width: 20px;
    height: 22px;
}

.small-padding-button {
    padding: 2px 4px !important; /* Sesuaikan nilai padding sesuai kebutuhan Anda */
}
</style>
