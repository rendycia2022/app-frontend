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

const menus = ref([
    {
        label: 'Dashboard',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-desktop', to: '/cia/dashboard' }]
    },
    {
        label: 'Project',
        items: [
            { label: 'List', icon: 'pi pi-fw pi-list', to: '/cia/project/list',},
        ]
    },
]);

const model = ref(null);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(menu, i) in menus" :key="menu">
            <app-menu-item v-if="!menu.separator" :item="menu" :index="i"></app-menu-item>
            <li v-if="menu.separator" class="menu-separator"></li>
        </template>
        
        <!-- project menu -->
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
