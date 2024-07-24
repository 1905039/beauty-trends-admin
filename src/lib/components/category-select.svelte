<script lang="ts">
    import type { CategoryObj } from "$lib/containers";
    import { categories_store, selected_category, category_drop_store, category_chain } from "$lib/stores";
    import { onMount } from "svelte";
    import CategoryChild from "./category-child.svelte";
    import { Dropdown } from "bootstrap";
    import { setup_category_chain } from "$lib/helpers";

    let category_drop_elem: HTMLButtonElement;
    let root_categories: CategoryObj[] = [];

    $:
    {
        root_categories = [];

        $categories_store.forEach((value: CategoryObj): void =>
        {
            if(value.parent !== 0)
            {
                return;
            }

            root_categories.push(value);
        });
    }

    $: setup_category_chain($selected_category);

    onMount((): void =>
    {
        $selected_category = 0;
        $category_drop_store = new Dropdown(category_drop_elem);
    });
</script>

<div class="dropdown">
    <button bind:this={category_drop_elem} class="btn btn-primary dropdown-toggle" data-bs-auto-close="outside" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        Select Category
    </button>
    <ul class="dropdown-menu">
        {#each root_categories as category}
            <li>
                {#if category.children.length === 0}
                    <button on:click={() => {$selected_category = category.id; $category_drop_store?.hide();}} class="dropdown-item" type="button">{category.title}</button>
                {:else}
                    <CategoryChild title={category.title} children={category.children} />
                {/if}
            </li>
        {/each}
    </ul>
</div>

<nav aria-label="breadcrumb">
    <ol class="breadcrumb">
        {#each $category_chain as category}
            <li class="breadcrumb-item">{category}</li>
        {/each}
    </ol>
</nav>