<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { axiosMaintenance } from '../../../service/axios';

const toast = useToast();
const confirmPopup = useConfirm();

const { layoutConfig, onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

const profile = ref({});
const local = ref({
    user_id: localStorage.getItem('user_id'),
    token: localStorage.getItem('token'),
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
    
});

onBeforeMount( async() => {
    const user = await axiosMaintenance.get('/public/users/id/'+local.value.user_id) 
    if(user.data.status == 200){
        profile.value = user.data.metadata;
        localStorage.setItem('role_id', profile.value.role_id)
    }else{
        localStorage.clear();
        router.push('/maintenance');
    }
});

onMounted( async() => {
    bindOutsideClickListener();
});

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
    router.push('/maintenance/public/personal');
};
const confirm = (event) => {
    confirmPopup.require({
        target: event.target,
        message: 'Are you sure you want to sign-out?',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            localStorage.clear();
            router.push('/maintenance');
            
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
        <router-link to="/maintenance/dashboard" class="layout-topbar-logo">
            <span>Hello {{ profile.user_name }}</span>
        </router-link>

        <!-- <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button> -->

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-sign-out"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <!-- <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button> -->
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
