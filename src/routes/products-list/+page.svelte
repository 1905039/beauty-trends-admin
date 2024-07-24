<script lang="ts">
    import { goto } from "$app/navigation";
    import { login_store, other_error_toast_store, products_store } from "$lib/stores";
    import { onMount } from "svelte";
    import Product from "$lib/components/product.svelte";
    import { respond401 } from "$lib/helpers";

    function init(): void
    {
        fetch("/api/get-all-products", {method: "GET"}).then(
        async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                $products_store = new Array(response_obj.product_ids.length);

                for(let i: number = 0; i < $products_store.length; ++i)
                {
                    $products_store[i] = response_obj.product_ids[i].__id;
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
    }

    onMount((): void =>
    {
        $products_store = [];
        
        init();
    });
</script>

<div class="products-root">
    <!-- <div class="card card-body shadow bg-body-white align-self-start mx-2 mt-4">
        <p class="fs-4 fw-semibold mt-0 mb-2">Filters</p>
        <p class="fs-5 mb-1">Price</p>
        <div class="container px-0 mx-0 mb-2">
            <div class="row">
                <div class="col pe-1 my-0">
                    <label for="price-from" class="form-label">From</label>
                    <input type="number" class="form-control" id="price-from">
                </div>
                <div class="col pe-2 my-0">
                    <label for="price-to" class="form-label">To</label>
                    <input type="number" class="form-control" id="price-to">
                </div>
            </div>
        </div>
        <p class="fs-5 mb-1">Rate</p>
        <div class="container px-0 mx-0 mb-2">
            <div class="row">
                <div class="col pe-1 my-0">
                <label for="price-from" class="form-label">From</label>
                <input type="number" class="form-control" id="price-from">
            </div>
            <div class="col pe-2 my-0">
                <label for="price-to" class="form-label">To</label>
                <input type="number" class="form-control" id="price-to">
            </div>
            </div>
        </div>
        <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-primary">Apply</button>
        </div>
    </div> -->
    <div class="products-list-container flex-fill mx-2 my-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <p class="fs-3 fw-semibold">Products</p>
            <!-- <button type="button" class="btn btn-primary dropdown-toggle">Name (Asc)</button> -->
        </div>
        <ul class="p-0" style="list-style-type: none;">
            {#each $products_store as product, index}
                <li>
                    <Product index={index} id={product} />
                </li>
            {/each}
        </ul>
    </div>
</div>

<style lang="scss">
    .products-root
    {
        max-width: 60rem;
        margin: 1.5rem auto 1.5rem;
    }
</style>