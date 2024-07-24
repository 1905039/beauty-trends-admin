<script lang="ts">
    import "$lib/style.scss";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { login_store, add_photo_toast_store, selected_category_toast_store, product_unavailable_toast_store, logged_out_toast_store, other_error_toast_store } from "$lib/stores";
    import { Toast } from "bootstrap";
    import { get_categories } from "$lib/helpers";

    let add_photo_toast_elem: HTMLDivElement;
    let select_category_toast_elem: HTMLDivElement;
    let product_unavailable_toast_elem: HTMLDivElement;
    let logged_out_toast_elem: HTMLDivElement;
    let other_error_toast_elem: HTMLDivElement;

    function logout(): void
    {
        fetch("/api/logout",
        {
            method: "DELETE",
            headers:
            {
                "Content-Type": "application/json"
            }
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                $login_store = 1;

                goto("/");
            }
            else
            {
                $other_error_toast_store?.show();
            }
        });
    }

    onMount((): void =>
    {
        $add_photo_toast_store = new Toast(add_photo_toast_elem);
        $selected_category_toast_store = new Toast(select_category_toast_elem);
        $product_unavailable_toast_store = new Toast(product_unavailable_toast_elem);
        $logged_out_toast_store = new Toast(logged_out_toast_elem);
        $other_error_toast_store = new Toast(other_error_toast_elem);

        get_categories();
    });
</script>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
        <a class="navbar-brand" href="/">BeautyTrends Admin</a>
        {#if $login_store === 2}
            <button on:click={logout} type="button" class="btn btn-primary">Logout</button>
        {/if}
    </div>
</nav>

<slot></slot>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div bind:this={add_photo_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
        <div class="toast-body">
            Atleast add one image
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={select_category_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
        <div class="toast-body">
            Select a category
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={product_unavailable_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
        <div class="toast-body">
            Product Unavailable
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={logged_out_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
        <div class="toast-body">
            Logged Out
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={other_error_toast_elem} class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
        <div class="toast-body">
            Error
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
</div>