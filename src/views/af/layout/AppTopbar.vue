<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { axiosHR, axiosProject, axiosAf } from '../../../service/axios';

const toast = useToast();
const confirmPopup = useConfirm();

const { layoutConfig, onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

const profile = ref({});
const local = ref({
    id: localStorage.getItem('id'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
    
});

onBeforeMount( async() => {
    getAuth()
});

// get auth
const getAuth = async ()=>{
    const token = localStorage.getItem('token');
    if(!token){
        router.push({path: '/af'})
    }
    const auth = await axiosAf.get('/auth/token',{ 
                params:{
                    token: local.value.token,
                    user_id: local.value.userId,
                }
            })
    if(auth.data.status == 200){
        //profile
        const dataUser = await axiosHR.get('/public/user',{
                    params:{
                            token: local.value.token,
                            user_id: local.value.userId,
                        }
                    });
        profile.value = dataUser.data.metadata;
    }else{
        router.push({path: '/af'})
    }
}

// getting collaboration information
const getCollaboration = async () => {
    const response = await axiosAf.get('/af/collaboration/user',{
        params: local.value
    })

    const division_code = response.data.metadata.division_code;
    localStorage.setItem('division_code', division_code);
    local.value.division_code = localStorage.getItem('division_code');

    const access_id = response.data.metadata.access.id;
    localStorage.setItem('access_id', access_id);
    local.value.access_id = localStorage.getItem('access_id');

    const sign_id = response.data.metadata.sign.id;
    localStorage.setItem('sign_id', sign_id);
    local.value.sign_id = localStorage.getItem('sign_id');

    if(access_id == null || sign_id == null){
        router.push({path: '/af'})
    }
}


onMounted( async() => {
    bindOutsideClickListener();
    getCollaboration();
});

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};
const confirm = (event) => {
    confirmPopup.require({
        target: event.target,
        message: 'Are you sure you want to sign-out?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            window.localStorage.removeItem('token');
            router.push('/af');
            window.location.reload();
        },
        reject: () => {
            toast.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    });
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/af/dashboard" class="layout-topbar-logo">
            <span>Hello {{ profile.name }}</span>
        </router-link>

        <!-- <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button> -->

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button>
            <ConfirmPopup></ConfirmPopup>
            <Toast />
            <button ref="popup" @click="confirm($event)" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Sign-out</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
