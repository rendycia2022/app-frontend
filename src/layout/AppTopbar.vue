<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
const toast = useToast();
const confirmPopup = useConfirm();

const { layoutConfig, onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

const personal_info = ref(null);

onMounted(() => {
    bindOutsideClickListener();
});

// personal info
onMounted(async () => {
    const result = await axios.get('/reimbursment/approval/options',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    personal_info.value = result.data.metadata.data;
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
    router.push('/info/user');
};
const confirm = (event) => {
    confirmPopup.require({
        target: event.target,
        message: 'Are you sure you want to sign-out?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            window.localStorage.removeItem('token');
            window.location.reload()
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
        <router-link to="/reimbursement/dashboard/request" class="layout-topbar-logo">
            <span v-if="name">Hi, <b class="">{{ name }}</b></span>
            <span v-if="!name">Hello</span>
        </router-link>

        <button v-if="role <= 1" class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()"> 
            <i class="pi pi-bars"></i>
        </button>

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

<script>
import axios from '../service/axios';

    export default {
        data(){
            return{
                name: '',
                role: '',
            }
        },
        async created(){
            const token = localStorage.getItem('token');
            if(!token){
                this.$router.push({path: '/'})
            }
            await axios.get('/reimbursment/dashboard',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            })
            .then(response => {
                this.name = response.data.metadata.data.name;
            })
            .catch(error => {
                console.log(error)
                this.errored = true
                if(error.response.status == 401){
                    window.localStorage.removeItem('token');
                    this.$router.push({path: '/'})
                }
            })
        },
        async mounted() {
            const result = await axios.get('/reimbursment/role/user',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
            this.role = result.data.metadata.data;
        }
        
    }

</script>

<style lang="scss" scoped></style>
