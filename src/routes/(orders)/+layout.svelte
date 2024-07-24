<script lang="ts">
    import { page } from "$app/stores";

    let orders_type: Map<string, string> = new Map(
    [
        ["/complete-orders", "Complete"],
        ["/pending-orders", "Pending"],
        ["/cancelled-orders", "Cancelled"]
    ]);
</script>

<div class="order-root">
    <div class="order-card card card-body shadow mx-2 my-4">
        <p class="fs-3 fw-semibold mb-2">{orders_type.get($page.url.pathname)} Orders</p>
        <slot></slot>
    </div>
</div>

<style lang="scss">
    .order-root
    {
        display: flex;
        justify-content: center;
    }
    .order-card
    {
        max-width: 60rem;
    }
</style>