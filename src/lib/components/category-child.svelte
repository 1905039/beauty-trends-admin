<script lang="ts">
    import CategoryChild from "$lib/components/category-child.svelte";
    import type { CategoryObj } from "$lib/containers";
    import { categories_store, category_drop_store, selected_category } from "$lib/stores";
    import { onMount } from "svelte";

    export let title: string;
    export let children: number[];
    let categories: CategoryObj[] = [];

    onMount((): void =>
    {
        categories = [];

        for(let i: number = 0; i < children.length; ++i)
        {
            let new_category: CategoryObj | undefined = $categories_store.get(children[i]);

            if(new_category === undefined)
            {
                continue;
            }

            categories.push(new_category);
        }
    });
</script>

<div class="dropend">
    <button class="dropdown-item btn btn-primary dropdown-toggle" data-bs-auto-close="outside" type="button" data-bs-toggle="dropdown" aria-expanded="false">{title}</button>
    <ul class="dropdown-menu">
        {#each categories as category}
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