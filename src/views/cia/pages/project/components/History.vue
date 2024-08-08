<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const products = ref(null);
const fetching = async (day) =>{
    const response = await axiosManagement.get('/project/update/'+day+'/false',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    // console.log(response.data.list);
    products.value = response.data.list;
}
onMounted( () => {
    fetching(3);
});

const selectedProduct = ref();

const onSelectionChange = (event) =>{
    window.open(selectedProduct.value.url);
}

const refreshHandle = () =>{
    fetching(3);
}

// dialog
const dialog = ref(false);
const openDialog = () => {
    dialog.value = true;
    setAll(10);
};
const productAll = ref(null);
const setAll = async (day) =>{
    const response = await axiosManagement.get('/project/update/'+day+'/true',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    productAll.value = response.data.list;
}

</script>

<template>
    <Listbox v-model="selectedProduct" :options="products" optionLabel="body" class="w-full" listStyle="max-height:600px" @change="onSelectionChange" >
        <template #header>
            <div class="grid">
                <div class="flex col-6" >
                    <Button @click="refreshHandle" icon="pi pi-refresh" size="small" severity="info" text rounded aria-label="Refresh" />
                    <h5 class="text-sm">Recent updates</h5>
                </div>
                <div class="flex justify-content-end col-6" >
                    <Button @click="openDialog" label="View All" severity="info" size="small" text />
                </div> 
            </div>
                
        </template>
        <template #option="slotProps" >
            
            <div class="flex justify-content-between px-3 py-2 border-left-2 cursor-pointer mx-1 border-round-md surface-50 hover:surface-card hover:border-pink-500 transition-duration-300 transition-all" :class="slotProps.option.border">
                <div class="flex justify-content-between gap-3">
                    <div class="flex flex-column justify-content-center gap-2">
                        <span v-if="slotProps.option.title.length >= 60" class="font-medium text-base text-color text-sm" :title="slotProps.option.title" >{{ slotProps.option.title.substring(0, 59) }}...</span>
                        <span v-else class="font-medium text-base text-color text-sm" :title="slotProps.option.subtitle" >{{ slotProps.option.title }}</span>

                        <span v-if="slotProps.option.body.length >= 60" class="text-color-secondary text-xs" :title="slotProps.option.body" >
                            {{ slotProps.option.body.substring(0, 59) }}...
                        </span>
                        <span v-else class="text-color-secondary text-xs" :title="slotProps.option.body" >
                            {{ slotProps.option.body }}
                        </span>
                        <span class="flex align-items-center font-medium gap-1 text-color-secondary text-xs">
                            <i class="pi pi-clock"></i>{{ slotProps.option.created_at }}
                        </span>
                    </div>
                </div>
                <div class="flex align-items-center">
                    <span class="text-color-secondary">{{ slotProps.option.label }}</span>
                </div>
            </div>
            
        </template>
    </Listbox>

    <Dialog 
        v-model:visible="dialog" 
        maximizable 
        :modal="true" 
        header="View All" 
        :style="{ width: '50rem' }" 
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <Listbox v-model="selectedProduct" :options="productAll" optionLabel="detail" class="w-full" filter @change="onSelectionChange" >
            
            <template #option="slotProps" >
                
                <div class="flex justify-content-between px-3 py-2 border-left-2 cursor-pointer mx-1 border-round-md surface-50 hover:surface-card hover:border-pink-500 transition-duration-300 transition-all" :class="slotProps.option.border">
                    <div class="flex justify-content-between gap-3">
                        <div class="flex flex-column justify-content-center gap-2">
                            <span v-if="slotProps.option.title.length >= 60" class="font-medium text-base text-color text-sm" :title="slotProps.option.title" >{{ slotProps.option.title.substring(0, 59) }}...</span>
                            <span v-else class="font-medium text-base text-color text-sm" :title="slotProps.option.subtitle" >{{ slotProps.option.title }}</span>
                            
                            <span v-if="slotProps.option.body.length >= 60" class="text-color-secondary text-xs" :title="slotProps.option.body" >
                                {{ slotProps.option.body.substring(0, 59) }}...
                            </span>
                            <span v-else class="text-color-secondary text-xs" :title="slotProps.option.body" >
                                {{ slotProps.option.body }}
                            </span>
                            <span class="flex align-items-center font-medium gap-1 text-color-secondary text-xs">
                                <i class="pi pi-clock"></i>{{ slotProps.option.created_at }}
                            </span>
                        </div>
                    </div>
                    <div class="flex align-items-center">
                        <span class="text-color-secondary">{{ slotProps.option.label }}</span>
                    </div>
                </div>
                
            </template>
        </Listbox>
    </Dialog>
</template>