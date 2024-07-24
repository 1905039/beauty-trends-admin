<script lang="ts">
    import { onMount } from "svelte";
    import { login_store, other_error_toast_store } from "$lib/stores";

    let password: string;
    let logging_in: boolean = false;
    let wrong_password: boolean = false;

    async function login(): Promise<void>
    {
        logging_in = true;
        let request_obj: any = {password: password};

        fetch("/api/login",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request_obj)
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    $login_store = 2;
                }
                else if(response_obj.success === -1)
                {
                    password = "";
                    wrong_password = true;
                    logging_in = false;
                }
            }
            else
            {
                $other_error_toast_store?.show();
            }
        });
    }

    onMount(async (): Promise<void> =>
    {
        logging_in = false;
    });
</script>

<div class="login-root mx-auto mt-5">
    <div class="login-card card card-body shadow bg-body-tertiary m-2">
        <p class="fs-3 fw-semibold">Admin Login</p>
        {#if logging_in}
            <div class="d-flex align-items-center">
                <p class="fs-5 flex-fill my-0">Logging In...</p>
                <div class="spinner-border text-primary" role="status" />
            </div>
        {:else}
            <form on:submit={login}>
                <div class="form-floating needs-validation mb-2">
                    <input type="password" class="form-control" id="admin-password" placeholder="Password" minlength="16" bind:value={password} required>
                    <label for="admin-password">Password</label>
                </div>
                {#if wrong_password}
                    <p class="text-danger">Wrong Password</p>
                {/if}
                <div class="d-flex flex-row-reverse invalid">
                    <button type="submit" class="btn btn-primary">Login</button>
                </div>
            </form>
        {/if}
    </div>
</div>

<style lang="scss">
    .login-root
    {
        max-width: 30rem;
    }
    .login-card
    {
        border: 0;
    }
</style>