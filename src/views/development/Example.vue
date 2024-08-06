<template>
    <div class="card flex flex-column gap-3">

        <Timeline :value="events" layout="horizontal" align="alternate">
            <template #opposite> &nbsp; </template>
            <template #content="slotProps">
                {{ slotProps.item.plan }} - {{ slotProps.item.year }}
            </template>
        </Timeline>
    </div>
</template>

<script setup>
import { ref } from "vue";

const events = ref([
    {year:'2024-01-23',plan:'Target Installation'},
    {year:'2024-01-24',plan:'Plan Installation'},
    {year:'2024-01-25',plan:'Plan Itegrasi'},
    {year:'2024-01-28',plan:'P ATP'},
]);
</script>