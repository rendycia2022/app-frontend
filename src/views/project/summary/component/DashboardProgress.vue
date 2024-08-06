<script setup>
import { ref, onMounted, defineProps, watch } from "vue";
import { axiosProject } from '../../../../service/axios';

const local = ref({
    project_id: (new URL(window.location.href)).pathname.split('/')[3],
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// props
const props = defineProps(['todos']);
watch(() => props.todos, async (newValue, oldValue) => {
    fetching();  
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const fetching = async () =>{
    const response = await axiosProject.get('project/summary/project',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            project_id: local.value.project_id,
        }
    });
    
    products.value = response.data.metadata;
}

const products = ref();
onMounted( async() => {
    fetching();
});

const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};
// management data end

const layout = ref('grid');

// Profit
// Loss
// Break Even Point

</script>

<template>
    <div class="card">
        <Toast />
        <DataView :value="products" :layout="layout">
            <template #grid="slotProps">
                <div class="p-4 border-1 surface-border surface-card border-round  col-12 sm:col-12 md:col-12 lg:col-12 xl:col-12">
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <div class="flex align-items-center gap-2">
                            <span class="font-semibold">Progress Budget</span>
                        </div>
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <!-- <Button icon="pi pi-refresh" rounded raised @click="refreshToggle"  /> -->
                        </div>
                    </div>
                    <div class="flex flex-column gap-1 py-1">
                        <div>
                            <table class="text-left">
                                <tr>
                                    <th>PO Number:</th>
                                    <th><label class="text-1xl font-bold">{{ slotProps.data.project.document }}</label></th>
                                </tr>
                                <tr>
                                    <th>Project's Name:</th>
                                    <th><router-link class="text-xl text-blue-400 font-bold" :to="'/project/summary/'+slotProps.data.project.id+'/detail'">{{ formatCurrency(slotProps.data.project.name) }}</router-link></th>
                                </tr>
                                <tr>
                                    <th>Project's Type:</th>
                                    <th><label class="text-1xl font-bold">{{ slotProps.data.project.type }}</label></th>
                                </tr>
                                <tr>
                                    <th>Customer:</th>
                                    <th><label class="text-1xl font-bold">{{ slotProps.data.project.customer }}</label></th>
                                </tr>
                                <tr>
                                    <th>Assignment References:</th>
                                    <th><label class="text-1xl font-bold">{{ slotProps.data.project.references }}</label></th>
                                </tr>
                                <tr>
                                    <th>Assignment Date:</th>
                                    <th><label class="text-1xl font-bold">{{ slotProps.data.project.date }}</label></th>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <div class="flex flex-column gap-3 py-2">
                                <div class="text-xl font-bold">Progress Budget <label class="text-yellow-400">{{ formatCurrency(slotProps.data.progress.budget.total) }}</label></div>
                            </div>
                            <div class="flex flex-column gap-3 py-1">
                                <div class="text-1xl font-bold">Indirect Cost <label class="text-yellow-400">{{ formatCurrency(slotProps.data.progress.indirect.total) }}</label></div>
                            </div>
                            <table class="py-2">
                                <tr>
                                    <td>
                                        Resources:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.indirect.subtotal.resources) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Overhead:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.indirect.subtotal.overhead) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Tax 3%:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.indirect.subtotal.tax) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Cost of Fund:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.indirect.subtotal.cost_of_fund) }}
                                    </td>
                                </tr>
                            </table>
                            <div class="flex flex-column gap-3 py-1">
                                <div class="text-1xl font-bold">Direct Cost <label class="text-yellow-400">{{ formatCurrency(slotProps.data.progress.direct.total_progress) }}</label></div>
                            </div>
                            <table class="py-2">
                                <tr>
                                    <td>
                                        Consultants:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.direct.subtotal_progress.consultants) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Material Purchasing:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.direct.subtotal_progress.material) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Sub-Contracting:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.direct.subtotal_progress.subcontracting) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Other:
                                    </td>
                                    <td>
                                        {{ formatCurrency(slotProps.data.progress.direct.subtotal_progress.other) }}
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <div class="flex flex-column gap-3 py-3">
                                <div class="text-xl font-bold">Progress Revenue: <label class="text-blue-400" >{{ formatCurrency(slotProps.data.progress.revenue.total) }} / {{ slotProps.data.progress.revenue.qty }} Sites</label></div>
                            </div>
                            <div class="text-xl font-bold">Progress Margin: 
                                <label v-if="slotProps.data.progress.margin.percent <= 0" class="text-red-400">{{ formatCurrency(slotProps.data.progress.margin.total) }} | {{ slotProps.data.progress.margin.percent }}%</label>
                                <label v-else-if="slotProps.data.progress.margin.percent <= 30" class="text-orange-400">{{ formatCurrency(slotProps.data.progress.margin.total) }} | {{ slotProps.data.progress.margin.percent }}%</label>
                                <label v-else class="text-green-400">{{ formatCurrency(slotProps.data.progress.margin.total) }} | {{ slotProps.data.progress.margin.percent }}%</label>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <div class="flex align-items-center gap-2">
                            <!-- <span class="text-1xl font-semibold">Inv: 0 / PO: 0</span> -->
                        </div>
                        <!-- <span class="text-1xl font-semibold">Total Site: 0/<router-link class="text-blue-400" :to="'/project/summary/'+slotProps.data.project.id+'/cost/direct'">{{ slotProps.data.revenue.total.qty }}</router-link></span> -->
                    </div>
                    
                </div>
                
            </template>
        </DataView>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
