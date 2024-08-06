<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";

import { axiosCpSmart } from '../../../../../service/axios';

// components
import Import from './Import.vue';
import Timeline from './Timeline.vue';
import Actual from './Actual.vue';

const confirm = useConfirm();
const toast = useToast();
const router = useRouter();
const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

onMounted(() => {
    fetching();
});

const products = ref(null);
const segment = ref(null);
const milestones = ref(null);
const now = ref({});
const fetching = async () =>{
    const response = await axiosCpSmart.get('/dashboard/data',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
    segment.value = response.data.segment;
    link.value = response.data.link;

    // console.log(products.value)
    // console.log(segment.value)

    // get week
    // monday first day
    const currentDate = new Date();
    now.value.date = formatDate(currentDate);
    now.value.week = getWeek(currentDate);

    // milestone
    const responseMilestone = await axiosCpSmart.get('/dashboard/milestone',{
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    milestones.value = responseMilestone.data.list;
}

// selected data
const selectedProduct = ref(null);
const onRowSelect = (event) => {
};

// edit data
const payload = ref({});
const onCellEditComplete = async (event) => {
    let { data, newValue, field } = event;
    if(field == 'start_project'){
        const date = formatDate(newValue);
        data[field] = date;

        data['local'] = local.value;

        if(date == "NaN-NaN-NaN"){
            // console.log("NaN-NaN-NaN");
            data[field] = null;
        }else{
            const response = await axiosCpSmart.post('/dashboard/management/'+field, data);
            fetching();

            // console.log(response.data);
        }
    }else if(field == 'cable_length'){
        if(newValue){
            data[field] = {
                value: newValue,
                type: 'Int',
            }
            data['local'] = local.value;
            const response = await axiosCpSmart.post('/dashboard/management/value/'+field, data);
            if(response.data.status == 200){
                data[field] = newValue;
            }
            fetching();
        }
        
    }    
    
};

// dialog
const product = ref(null);
const timelineDialog = ref(false);
const openTimelineDialog = (detailProduct) => {
    product.value = detailProduct;
    timelineDialog.value = true;
    // console.log(product.value)
};

// filter
const filters = ref({});

onBeforeMount(() => {
    initFilters();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
};

// export
const dt = ref(null);
const exportCSV = () => {
    dt.value.exportCSV();
};

// menu
const menu = ref();
const items = ref([
    // {
    //     label: 'Import Data',
    //     icon: 'pi pi-cloud-upload',
    //     command: () => {
    //         importDialog.value = true;
    //     }
    // },
    {
        label: 'Milestone',
        icon: 'pi pi-table',
        command: () => {
            router.push('/cp/dashboard/milestone');
        }
    },
]);

const toggle = (event) => {
    menu.value.toggle(event);
};

// import dialog
const importDialog = ref(false);

// actual date
const actualDialog = ref(false);
const openActualDialog = (data, milestone) =>{
    payload.value.data = data;
    payload.value.milestone = milestone;
    actualDialog.value = true;
}

const closeDialog = (dialog) =>{
    dialog = false;
    fetching();
    payload.value = {};
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

const getWeek = (date) =>{
    if(date === undefined){
        return null;
    }
    const currentDate = 
        (typeof date === 'object') ? date : new Date(date);
    const januaryFirst = 
        new Date(currentDate.getFullYear(), 0, 1);
    const daysToNextMonday = 
        (januaryFirst.getDay() === 1) ? 0 : 
        (7 - januaryFirst.getDay()) % 7;
    const nextMonday = 
        new Date(currentDate.getFullYear(), 0, 
        januaryFirst.getDate() + daysToNextMonday);
 
    return (currentDate < nextMonday) ? 52 : 
    (currentDate > nextMonday ? Math.ceil(
    (currentDate - nextMonday) / (24 * 3600 * 1000) / 7) : 1);
}

const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
};

// utilities
const link = ref({});
const seeMore = (detail) =>{
    const target = link.value+'/fo/schedule/'+detail.schedule_id;
    window.open(target, '_blank').focus();
}

</script>

<template>
    <Toast/>
    <div class="card" >
        <DataTable
            ref="dt"
            csvSeparator=";"
            v-model:selection="selectedProduct"
            :value="products"
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table"
            removableSort
            :paginator="true"
            :rows="25"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[25, 50, 100]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
            size="small"
            :filters="filters"
            scrollable scrollHeight="450px"
            dataKey="ringspan_id" :metaKeySelection="true"
            class="small-padding-table text-center"
            rowGroupMode="subheader" groupRowsBy="project_name"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <h5 
                        class="m-0" 
                        v-tooltip="'Nomor minggu ini berdasarkan hari senin sebagai awal minggu'"
                    >
                        <small>Data {{ now.date }}, Week ke {{ now.week }}</small>
                    </h5>
                    
                    <div class="flex items-center gap-2">
                        <span class="block mt-2 md:mt-0 p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Search" type="text" class="w-32 sm:w-auto" style="border-radius: 3rem" />
                        </span>
                    </div>
                    <Button type="button" icon="pi pi-ellipsis-v" @click="toggle" rounded text severity="secondary" aria-haspopup="true" aria-controls="overlay_menu" />
                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                </div>
            </template>
            <Column header="#" style="min-width: 10px">
                <template #body="slotProps">
                    <small>{{ slotProps.index + 1 }}</small>
                </template>
            </Column>
            <Column field="project_name" header="Project" style="min-width: 200px" sortable >
                <template #body="slotProps">
                    <span><small>{{ slotProps.data.project_name }}</small></span>
                </template>
            </Column>
            <Column field="ringspan_name" header="Segment" style="min-width: 250px" frozen sortable >
                <template #body="slotProps">
                    <span>
                        <Button :style="{ color: '#6c757d' }" :label="slotProps.data.ringspan_name" class="small-padding-button" @click="seeMore(slotProps.data)" rounded text size="small" />
                    </span>
                </template>
            </Column>
            <Column field="progress.result" header="Progress" style="min-width: 100px" class="text-center" sortable >
                <template #body="slotProps">
                    <span v-if="slotProps.data.progress.result <= 0" class="text-black-500 ml-3 font-medium"><small>{{ slotProps.data.progress.result }}%</small></span>
                    <span v-else-if="slotProps.data.progress.result < 100" class="text-orange-500 ml-3 font-medium"><small>{{ slotProps.data.progress.result }}%</small></span>
                    <span v-else class="text-green-500 ml-3 font-medium"><small>100%</small></span>
                </template>
            </Column>
            <Column field="start_project" header="Project Start" style="min-width: 180px" class="text-center" sortable >
                <template #body="slotProps">
                    <span v-tooltip="'Start at: '+slotProps.data.start_project">
                        <small>{{ slotProps.data.start_project }}</small>
                    </span>
                    <i class="pi pi-pencil ml-2" style="font-size: 0.8rem" :style="{color: 'green'}"></i>
                </template>
                <template #editor="{ data, field }">
                    <Calendar v-model="data[field]" :selectOtherMonths="true" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" class="w-full" ></Calendar>
                </template>
            </Column>
            <Column field="ExpectedEndDate" header="Expected Project End" style="min-width: 150px" class="text-center" sortable >
                <template #body="slotProps">
                    <span v-if="now.week == getWeek(slotProps.data.ExpectedEndDate)" :style="{ color: '#1fdbd2' }" v-tooltip="'Deadline: '+getWeek(slotProps.data.ExpectedEndDate)">
                        <small>{{ slotProps.data.ExpectedEndDate }}</small>
                    </span>
                    <span v-else-if="slotProps.data.ExpectedEndDate == null">
                    </span>
                    <span v-else v-tooltip="'Deadline: Week '+getWeek(slotProps.data.ExpectedEndDate)">
                        <small>{{ slotProps.data.ExpectedEndDate }}</small>
                    </span>
                </template>
            </Column>
            <Column field="cable_length" header="Total Cable length" style="min-width: 150px" class="text-center" sortable >
                <template #body="slotProps">
                    <span>
                        <small>{{ formatNumber(slotProps.data.cable_length) }} M</small>
                    </span>
                    <i class="pi pi-pencil ml-2" style="font-size: 0.8rem" :style="{color: 'green'}"></i>
                </template>
                <template #editor="{ data, field }">
                    <InputNumber id="cable_length" v-model="data[field]" integeronly placeholder="(In Meter)" />
                </template>
            </Column>
            <Column v-for="col of segment" :key="col.code" :field="col.code" :header="col.title" style="min-width: 150px" class="text-center" sortable >
                <template v-if="col.code == 'cable'" #body="slotProps">
                    <Button :style="{ color: '#1fdbd2' }" :label="formatNumber(slotProps.data[col.code]).toString()+' M'" class="small-padding-button" @click="openTimelineDialog(slotProps.data)" rounded text size="small"  />
                </template>
            </Column>
            <Column v-for="col of milestones" :key="col.id" :field="col.code" :header="col.title" class="text-center" style="min-width: 150px" sortable>
                <template #body="slotProps">
                    <tr>
                        <span v-if="now.week == getWeek(slotProps.data[col.code])" :style="{ color: '#1fdbd2' }" v-tooltip="'Deadline: '+getWeek(slotProps.data[col.code])" class="ml-5">
                            <small>{{ slotProps.data[col.code] }}</small>
                        </span>
                        <span v-else-if="slotProps.data[col.code] == null" class="ml-5">
                        </span>
                        <span v-else v-tooltip="'Deadline: Week '+getWeek(slotProps.data[col.code])" class="ml-5">
                            <small>{{ slotProps.data[col.code] }}</small>
                        </span>
                    </tr>
                    <hr/>
                    <tr>
                        <small v-if="col.code == 'PenarikanKabel'">
                            <Button v-if="slotProps.data[col.code+'_actual']?.value <= slotProps.data[col.code]" @click="openTimelineDialog(slotProps.data)" :label="slotProps.data[col.code+'_actual']?.value" severity="success" text size="small" class="small-padding-button ml-4" :style="{ margin: '1px' }"  />
                            <Button v-else-if="slotProps.data[col.code+'_actual']?.value > slotProps.data[col.code]" @click="openTimelineDialog(slotProps.data)" :label="slotProps.data[col.code+'_actual']?.value" severity="danger" text size="small" class="small-padding-button ml-4" :style="{ margin: '1px' }"  />
                            <Button v-else label="Waiting progress..." severity="warning" text size="small" class="small-padding-button ml-1" :style="{ margin: '1px' }" disabled />
                        </small>
                        <small v-else >
                            <Button v-if="slotProps.data[col.code+'_actual']?.value <= slotProps.data[col.code]" severity="success" :label="slotProps.data[col.code+'_actual']?.value" @click="openActualDialog(slotProps.data, col)" text size="small" class="small-padding-button ml-4" :style="{ margin: '1px' }"  />
                            <Button v-else-if="slotProps.data[col.code+'_actual']?.value > slotProps.data[col.code]" severity="danger" :label="slotProps.data[col.code+'_actual']?.value" @click="openActualDialog(slotProps.data, col)" text size="small" class="small-padding-button ml-4" :style="{ margin: '1px' }"  />
                            <Button v-else label="Set Actual" @click="openActualDialog(slotProps.data, col)" text size="small" class="small-padding-button ml-5" :style="{ margin: '1px' }"  />
                        </small>
                    </tr>
                </template>
            </Column>
            <template #groupheader="slotProps">
                <div class="flex items-center gap-2">
                    <span>Project: <b>{{ slotProps.data.project_name }}</b></span>
                </div>
            </template>
            <template #groupfooter="slotProps">
                <div class="flex justify-end font-bold w-full"></div>
            </template>
        </DataTable>
    </div>

    <Dialog 
        v-model:visible="timelineDialog" 
        maximizable modal 
        :header="'Project: '+product?.project_name+', Segment - '+product?.ringspan_name" 
        :style="{ width: '50rem' }"
        @after-hide="closeDialog(timelineDialog)"
    >
        <Timeline :params="product" />
    </Dialog>

    <Dialog 
        v-model:visible="actualDialog" 
        maximizable modal 
        :header="'Project: '+payload.data?.project_name+', Segment - '+payload.data?.ringspan_name" 
        :style="{ width: '50rem' }"
        @after-hide="closeDialog(actualDialog)"
    >
        <Actual :params="payload" />
    </Dialog>

    <Dialog 
        v-model:visible="importDialog" 
        maximizable modal 
        header="Import" 
        :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <Import />
    </Dialog>
</template>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
    ::v-deep(.customized-timeline) {
        .p-timeline-event:nth-child(even) {
            flex-direction: row;

            .p-timeline-event-content {
                text-align: left;
            }
        }

        .p-timeline-event-opposite {
            flex: 0;
        }
    }
}
.small-padding-button {
    padding: 2px 4px !important; /* Sesuaikan nilai padding sesuai kebutuhan Anda */
}

table, th, td {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>

