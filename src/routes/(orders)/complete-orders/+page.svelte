<script lang="ts">
    import OrderItem from "$lib/components/order-item.svelte";
    import { respond401 } from "$lib/helpers";
    import { complete_orders, other_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";

    onMount((): void =>
    {
        fetch("/api/get-complete-orders",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                $complete_orders = new Array(response_obj.complete_orders.length);

                for(let i: number = 0; i < $complete_orders.length; ++i)
                {
                    $complete_orders[i] = response_obj.complete_orders[i].__id;
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
            <th scope="col">Action</th>
        </tr>
    </thead>
    <tbody>
        {#each $complete_orders as id, index}
            <OrderItem index={index} id={id} pending={false} />
        {/each}
    </tbody>
</table>