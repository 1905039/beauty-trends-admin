<script lang="ts">
    import OrderItem from "$lib/components/order-item.svelte";
    import { respond401 } from "$lib/helpers";
import { other_error_toast_store, pending_orders as pending_orders_store } from "$lib/stores";
    import { onMount } from "svelte";

    onMount((): void =>
    {
        fetch("/api/get-pending-orders",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                $pending_orders_store = new Array(response_obj.pending_orders.length);

                for(let i: number = 0; i < $pending_orders_store.length; ++i)
                {
                    $pending_orders_store[i] = response_obj.pending_orders[i].__id;
                }
            }
            else if(response.status === 401)
            {
                respond401();
            }
            else
            {
                $other_error_toast_store?.show();
            }
        });
    });
</script>

<table class="table">
    <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">Order ID</th>
            <th scope="col">Issued On</th>
            <th scope="col">Paid</th>
            <th scope="col">Verified</th>
            <th colspan="4" scope="col">Action</th>
        </tr>
    </thead>
    <tbody>
        {#each $pending_orders_store as id, index}
            <OrderItem index={index} id={id} />
        {/each}
    </tbody>
</table>