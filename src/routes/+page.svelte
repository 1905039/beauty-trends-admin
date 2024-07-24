<script lang="ts">
    import { login_store, other_error_toast_store, products_store } from "$lib/stores";
    import Login from "$lib/components/login.svelte";
    import HomePage from "$lib/components/home-page.svelte";
    import { onMount } from "svelte";
    import { respond401 } from "$lib/helpers";

    onMount((): void =>
    {
        $products_store = [];

        if($login_store === 0)
        {
            fetch("/api/legit",
            {
                method: "GET",
                headers:
                {
                    "Content-Type": "application/json"
                }
            }).then(async (response: Response): Promise<void> =>
            {
                if(response.status === 200)
                {
                    $login_store = 2;
                }
                else if(response.status === 401)
                {
                    if($login_store === 2)
                    {
                        respond401();
                    }
                    
                    $login_store = 1;
                }
                else
                {
                    $other_error_toast_store?.show();
                }
            });
        }
    });
</script>

{#if $login_store === 1}
    <Login />
{:else if $login_store === 2}
    <HomePage />
{/if}