<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosCpSmart } from '../../../../../service/axios';

const toast = useToast();

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

const fileupload = ref();

const upload = () => {
    fileupload.value.upload();
};

const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};

const download = async () => {
    await axiosCpSmart.get('/dashboard/data/template', {
        params:{
                token: local.value.token,
            },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_project.xlsx'); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};

</script>

<template>
    <div class="card">
        <Toast />
        <div class="flex flex-wrap justify-center gap-4 mb-3">
            <Button
                @click="download"
                icon="pi pi-file-excel" 
                severity="success" 
                text raised rounded 
                aria-label="Download"
                v-tooltip="'Download template file'"
            />
            <FileUpload ref="fileupload" 
                mode="basic" 
                name="demo[]" 
                chooseLabel="Browse"
                url="/api/upload" 
                accept=".xlsx,.xls" 
                :maxFileSize="100000000" 
                @upload="onUpload"
            />
            <Button
                @click="upload"
                icon="pi pi-cloud-upload" 
                severity="secondary" 
                text raised rounded 
                aria-label="Upload"
                v-tooltip="'Upload file'"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
</style>

