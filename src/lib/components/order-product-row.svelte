<script lang="ts">
    import { respond401 } from "$lib/helpers";
    import { order_products_store, other_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";

    export let index: number;
    export let id: number;
    let product_id: number;
    let name: string;
    let unit_price: number;
    let quantity: number;
    let price: number;

    $: price = unit_price * quantity;

    onMount((): void =>
    {
        fetch("/api/get-order-product-data",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                let data: any = response_obj.data;
                product_id = data.__product_id;
                name = data.__title;
                quantity = data.__quantity;
                unit_price = data.__price;
                $order_products_store[index].total_price = unit_price * quantity;
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
    })
</script>

<tr>
    <td>{index + 1}</td>
    <td><a href="/edit-product/{id}">{id}</a></td>
    <td>{name}</td>
    <td>{quantity}</td>
    <td>৳{unit_price}</td>
    <td>৳{price}</td>
</tr>