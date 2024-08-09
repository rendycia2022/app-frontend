<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount, defineProps } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosCpSmart, axiosHR } from '../../../../../service/axios';

const toast = useToast();

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// props
const props = defineProps(['params']);
onMounted(() => {
    // console.log(props.params);
    fetching();
    
});

const products = ref(null);
const link = ref();
const detail = ref({});
const fetching = async () =>{
    const response = await axiosCpSmart.get('/dashboard/cable/'+props.params.ringspan_id+'/'+props.params.ringspan_name+'/'+props.params.schedule_id,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    // console.log(response.data)
    products.value = response.data.list.new_cable;
    link.value = response.data.link;

    const responseLock = await axiosCpSmart.get('/dashboard/cable/key/'+props.params.ringspan_id+'/'+props.params.ringspan_name+'/'+props.params.schedule_id,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    if(responseLock.data.status == 200){
        // console.log(responseLock.data)
        detail.value.locked = responseLock.data.actual.locked;
        detail.value.created_at = responseLock.data.detail.created_at;
        key.value = responseLock.data.key;
        const created_by = responseLock.data.detail.created_by;
        const user = await axiosHR.get('/public/user/'+created_by,{
                    params:{
                        token: localStorage.getItem('token'),
                        user_id: localStorage.getItem('id'),
                    }
                });
        // console.log(user.data)
        if(user.data.message.name){
            detail.value.created_by = user.data.message.name;
        }
    }
}

const openLink = () =>{
    window.open(link.value, '_blank').focus();
}

// formating
const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
};

// done cable data
const payload = ref({});
const key = ref(false);
watch(() => key.value, async (newValue, oldValue) => {
    payload.value.newValue = newValue;
    fetching();
});
const checkedConfirmDialog = ref(false);
const openCheckedConfirmDialog = () =>{
    checkedConfirmDialog.value = true;
}
const checkedConfirm = async () =>{
    payload.value.local = local.value;
    const data = payload.value;
    const response = await axiosCpSmart.put('/dashboard/cable/key/'+props.params.ringspan_id+'/'+props.params.ringspan_name+'/'+props.params.schedule_id, data);
    if(response.data.status == 200){
        fetching();
    }
    checkedConfirmDialog.value = false;
}

</script>

<template>
    <div class="mt-2 flex justify-center">
        <ToggleButton v-model="key" onLabel="Locked" offLabel="Unlocked" onIcon="pi pi-lock" 
            offIcon="pi pi-lock-open" class="w-36" aria-label="Do you confirm" @change="openCheckedConfirmDialog" 
            v-tooltip="detail.locked"
        />
    </div>
    <small v-if="detail.created_by" class="text-surface-500 dark:text-surface-400">
        Updated By {{ detail.created_by }} at {{ detail.created_at }}
    </small>

    <Timeline :value="products">
        <template #opposite="slotProps">
            <div>
                <small><b>{{ slotProps.item.opposite?.date }}</b></small>
            </div>
            <div>
                <small class="text-surface-500 dark:text-surface-400">{{ slotProps.item.opposite?.title }}</small>
            </div>
        </template>
        <template #content="slotProps">
            <div>
                <small><b>{{ slotProps.item.content?.date }}</b></small>
            </div>
            <div>
                <small v-if="slotProps.item.content?.total" :style="{ color: '#1fdbd2' }" >Total: {{ slotProps.item.content?.title }}</small>
                <small v-else class="text-surface-500 dark:text-surface-400" >{{ slotProps.item.content?.title }}</small>
            </div>
            
        </template>
    </Timeline>
    

    <div class="grid">
        <div class="flex justify-content-end col-12" >
            <Button label="See more" severity="info" @click="openLink" text size="small" />
        </div> 
    </div>

    <Dialog v-model:visible="checkedConfirmDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="!payload.oldValue">Are you sure you want to locked progress?</span>
            <span v-if="payload.oldValue">Are you sure you want to unlocked progress?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="checkedConfirmDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="checkedConfirm" />
        </template>
    </Dialog>

</template>

<style lang="scss" scoped>
</style>

