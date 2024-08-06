<script setup>
import { ref, onMounted, onBeforeMount,  defineProps, watch } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

import { axiosManagement } from '../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

onMounted( () => {
    fetching();
});
const fetching = async () =>{
    const response = await axiosManagement.get('/project/sites/menus',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    model.value = response.data.response;
}

const model = ref(null);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
