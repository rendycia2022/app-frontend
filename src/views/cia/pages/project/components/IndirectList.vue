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
    console.log(props.params);
    fetching();
    
});

const products = ref(null);
const fetching = async () =>{
    
}

// formating
const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
};

</script>

<template>
    

</template>

<style lang="scss" scoped>
</style>

