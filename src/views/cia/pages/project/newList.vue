<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement, axiosProject } from '../../../../service/axios';

// components
import AFList from './components/AFList.vue';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const handleEnterKey = (event) =>{
    // Prevents Enter key from submitting the form and instead adds a new line
    event.stopPropagation();
};

// data
const products = ref(null);
const productsOriginal = ref(null);
const product = ref({});
const fetching = async () =>{
    const response = await axiosManagement.get('/project/new/list',{ 
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

// grouping
const expandedRowGroups = ref([]);
const onRowGroupExpand = (event) => {
};
const onRowGroupCollapse = (event) => {
};
const expandAll = () => {
    for (let i = 0; i < products.value.length; i++) {
        expandedRowGroups.value.push(products.value[i].project.code);
    }
};
const collapseAll = () => {
    expandedRowGroups.value = [];
};

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
};

// editing
// edit data
const onCellEditComplete = async (event) => {
    let { data, newValue, field } = event;
    data[field] = newValue;
    data['token'] = local.value.token;
    data['user_id'] = local.value.user_id;
    const response = await axiosManagement.post('/project/new/list/remarks', data);
    if(response.data.status == 200){
        fetching();  
    }   
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

// row style conditional
const rowClass = (data) => {
    let totalCost = data.indirect.total + data.direct.total;
    return [{ 'bg-red-100 ': totalCost > data.invoice.total }];
};

const textAreaNewLineCount = (text) =>{
    var lines = text.split(/\r|\r\n|\n/);
    var count = lines.length;

    return count;
}

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

// dialog
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

// menu panel
const op2 = ref(null);
const toggleController = (event) => {
    op2.value.toggle(event);
};

// calculating
const calculateTotalQty = (name) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.project.code === name) {
                
                total++;

            }
        }
    }

    return total;
};

const calculateTotal = (name, meta) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.project.code === name) {
                
                total = total + product[meta]['total'];

            }
        }
    }

    return total;
};

const calculateTotalCost = (name) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.project.code === name) {
                let subtotal = product.direct.total + product.indirect.total;
                total = total + subtotal;

            }
        }
    }

    return total;
};

</script>

<template>
    
    <div class="card">
        <DataTable
            :value="products" 
            tableStyle="min-width: 50rem"
            scrollable scrollHeight="720px"
            :filters="filters"
            ref="dt"
            csvSeparator=";"
            v-model:expandedRowGroups="expandedRowGroups"
            expandableRowGroups 
            rowGroupMode="subheader" 
            groupRowsBy="project.code"
            sortMode="single" sortField="project.code" :sortOrder="-1"
            removableSort
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table"
            :rowClass="rowClass"
            @rowgroup-expand="onRowGroupExpand" @rowgroup-collapse="onRowGroupCollapse"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                    <div style="text-align:center">
                        <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" size="small" class="mr-2 mb-2" />
                        <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" size="small" class="mb-2" />
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
                    <small>{{ slotProps.data.project.code }},
                        Total Expected Revenue: {{ formatCurrency(calculateTotal(slotProps.data.project.code, 'revenue')) }}
                        | Total Invoice: {{ formatCurrency(calculateTotal(slotProps.data.project.code, 'invoice')) }}
                        | Total Cost: {{ formatCurrency(calculateTotalCost(slotProps.data.project.code)) }}
                        | Total Margin: {{ margin(calculateTotal(slotProps.data.project.code, 'revenue'), calculateTotalCost(slotProps.data.project.code)) }}%
                        | Total PO: {{ formatNumber(calculateTotalQty(slotProps.data.project.code)) }}
                    </small>
                </span>
            </template>
            <Column field="project.code" header="Customer" :sortable="true" headerStyle="width:20%; min-width:20rem;">
            </Column>
            <Column field="date" header="Date" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Date</small></span>
                    <span>{{ slotProps.data.date }}</span>
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
            <Column field="po_number" header="PO Number" :sortable="true" headerStyle="width:20%; min-width:20rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>PO Number</small></span>
                    <Button @click="openLink(slotProps.data.project_link)" :label="slotProps.data.po_number" severity="info" v-tooltip="'See more'" size="small" text />
                </template>
            </Column>
            <Column field="file_document" header="File PO" class="text-center" :sortable="true" headerStyle="width:10%; min-width:8rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small></small></span>
                    <Button v-if="slotProps.data.file_document" @click="openLink(slotProps.data.file_document)" severity="info" v-tooltip="'Open file'" icon="pi pi-file" size="small" rounded />
                </template>
            </Column>
            <Column field="name" header="Project's Name" :sortable="true" headerStyle="width:20%; min-width:15rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Project</small></span>
                    <span>{{ slotProps.data.name }}</span>
                </template>
            </Column>
            <Column field="revenue.total" header="Expected Revenue" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Expected Revenue</small></span>
                    <small>{{ formatCurrency(slotProps.data.revenue.total) }}</small>
                </template>
            </Column>
            <Column field="invoice.total" header="Invoice" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Invoice</small></span>
                    <small>{{ formatCurrency(slotProps.data.invoice.total) }}</small>
                </template>
            </Column>
            <Column field="indirect.total" header="Indirect" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Indirect</small></span>
                    <Button :label="formatCurrency(slotProps.data.indirect.total)" class="small-padding-button" severity="info" @click="openIndirectDialog(slotProps.data)" rounded text size="small"  />
                </template>
            </Column>
            <Column field="direct.total" header="Direct" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Direct</small></span>
                    <Button @click="openLink(slotProps.data.project_link)" :label="formatCurrency(slotProps.data.direct.total)" severity="info" v-tooltip="'Direct cost detail'" size="small" text />
                </template>
            </Column>
            <Column field="cogs" header="Total Cost / COGS" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Total Cost / COGS</small></span>
                    <small>{{ formatCurrency(slotProps.data.indirect.total + slotProps.data.direct.total) }}</small>
                </template>
            </Column>
            <Column field="margin" header="Margin" :sortable="true" headerStyle="width:20%; min-width:15rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Margin</small></span>
                    <small>{{ formatCurrency(slotProps.data.revenue.total - (slotProps.data.indirect.total + slotProps.data.direct.total)) }}</small>
                </template>
            </Column>
            <Column field="margin_percent" header="% Margin" class="text-center" :sortable="true" headerStyle="width:10%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>% Margin</small></span>
                    <small>{{ margin(slotProps.data.revenue.total, (slotProps.data.indirect.total + slotProps.data.direct.total)) }}%</small>
                </template>
            </Column>
            <Column field="hpp_subcon" header="HPP Subcon (in %)" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>HPP Subcon (in %)</small></span>
                    <small v-if="slotProps.data.invoice.total > 0">{{ margin(slotProps.data.invoice.total, slotProps.data.direct.total) }}%</small>
                </template>
            </Column>
            <Column field="hpp_nonsubcon" header="HPP Non Subcon (in %)" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>HPP Non Subcon (in %)</small></span>
                    <small v-if="slotProps.data.invoice.total > 0">{{ margin(slotProps.data.invoice.total, slotProps.data.indirect.total) }}%</small>
                </template>
            </Column>
        </DataTable>
    </div>
    
    <Dialog 
        v-model:visible="indirectDialog" 
        maximizable modal 
        :header="'List AF for '+product.po_number" 
        :style="{ width: '100rem' }"
        @after-hide="closeDialog(indirectDialog)"
    >
        <AFList :params="product" />
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
