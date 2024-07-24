<script lang="ts">
    import { Toast } from "bootstrap";
    import { onMount } from "svelte";
    import { add_photo_toast_store, other_error_toast_store, selected_category, selected_category_toast_store } from "$lib/stores";
    import { CategoryObj, UploadImage } from "$lib/containers";
    import CategorySelect from "./category-select.svelte";
    import { respond401 } from "$lib/helpers";

    let product_title: string = "";
    let product_description: string = "";
    let product_price: number = 0;
    let product_discount: number = 0.0;
    let product_weight_kg: number = 0;
    let product_weight_gm: number = 0;
    let product_adding: boolean = false;
    let product_form: HTMLFormElement;
    let category_adding: boolean = false;
    let success_toast_elem: HTMLDivElement;
    let error_toast_elem: HTMLDivElement;
    let success_toast: Toast;
    let upload_images: UploadImage[] = [];
    let upload_image_count: number;
    let current_parent: number = 0;
    let parent_stack: number[] = [];
    let current_categories: CategoryObj[] = [];
    let new_category_name: string;

    $: upload_image_count = upload_images.length;
    $:
    {
        get_parent_category(current_parent);
    }

    function get_parent_category(parent: number): void
    {
        fetch("/api/get-parent-categories",
        {
            method: "POST",
            body: JSON.stringify(
            {
                id: current_parent
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.success === 0)
                {
                    current_categories = new Array(response_obj.categories.length);

                    for(let i: number = 0; i < current_categories.length; ++i)
                    {
                        current_categories[i] = new CategoryObj();
                        current_categories[i].id = response_obj.categories[i].__id;
                        current_categories[i].title = response_obj.categories[i].__title;
                        current_categories[i].parent = response_obj.categories[i].__parent;
                    }
                }
                else
                {
                    $other_error_toast_store?.show();
                    console.error("Error", "get-parent-categories");
                }
            }
            else
            {
                $other_error_toast_store?.show();
            }
        });
    }

    function add_image(): void
    {
        let input_elem: HTMLInputElement = document.createElement("input");
        input_elem.type = "file";
        input_elem.accept = "image/*";
        input_elem.onchange = (): void =>
        {
            let file: File | null | undefined = input_elem.files?.item(0);

            if(file === undefined || file === null)
            {
                return;
            }

            let new_image: UploadImage = new UploadImage();
            new_image.file = file;
            new_image.url = URL.createObjectURL(file);

            upload_images.push(new_image);

            upload_images = Array.from(upload_images);
        }

        input_elem.click();
    }

    function clear_images(): void
    {
        upload_images = [];
    }

    async function product_submit(): Promise<void>
    {
        if(upload_image_count === 0)
        {
            $add_photo_toast_store?.show();

            return;
        }

        if($selected_category === 0)
        {
            $selected_category_toast_store?.show();

            return;
        }

        product_adding = true;
        let temp_description: string | null = product_description;

        if(temp_description === undefined || temp_description === null)
        {
            temp_description = "";
        }

        let request_obj: any =
        {
            title: product_title,
            description: temp_description,
            price: product_price,
            discount: product_discount / 100.0,
            weight: product_weight_kg + product_weight_gm / 1000.0,
            category: $selected_category
        };

        let form_data: FormData = new FormData();
        form_data.append("data", JSON.stringify(request_obj));
        form_data.append("count", upload_image_count.toString());

        for(let i: number = 0; i < upload_image_count; ++i)
        {
            form_data.append("file-" + i, upload_images[i].file as File);
        }

        fetch("/api/add-product",
        {
            method: "POST",
            body: form_data
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                success_toast.show();
                product_form.reset();
                clear_images();

                product_adding = false;
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

    async function add_category(): Promise<void>
    {
        category_adding = true;
        let request_obj: any =
        {
            title: new_category_name,
            parent: current_parent
        };

        fetch("/api/add-category",
        {
            method: "POST",
            body: JSON.stringify(request_obj)
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                success_toast.show();

                new_category_name = "";
                parent_stack = [];
                current_parent = 0;
                category_adding = false;
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

    function category_select(new_parent: number): void
    {
        parent_stack.push(current_parent);

        current_parent = new_parent;
    }

    function category_back(): void
    {
        current_parent = parent_stack[parent_stack.length - 1];

        parent_stack.pop();
    }

    onMount(async (): Promise<void> =>
    {
        success_toast = new Toast(success_toast_elem, {delay:  3000});
        product_adding = false;
        category_adding = false;
        $selected_category = 0;
    });
</script>

<div class="admin-root my-5 mx-auto">
    <form on:submit={product_submit} bind:this={product_form} class="card card-body shadow-sm bg-body-white m-2">
        <p class="fs-4 fw-semibold">Add Product</p>
        <div class="mb-2">
            <label for="add-product-title" class="form-label">Title</label>
            <input bind:value={product_title} type="text" class="form-control" id="add-product-title" placeholder="Product Name..." autocomplete="off" required>
        </div>
         <div class="mb-2">
            <label for="add-product-description" class="form-label">Description</label>
            <textarea bind:value={product_description} class="form-control" id="add-product-description" rows="3" maxlength="300" placeholder="Product Description..." autocomplete="off"></textarea>
        </div>
        <div class="container p-0 mb-2">
            <div class="row">
                <div class="col">
                    <label for="add-product-price" class="form-label">Price (৳)</label>
                    <input bind:value={product_price} type="number" class="form-control" id="add-product-price" min="0" autocomplete="off" required>
                </div>
                <div class="col">
                    <label for="add-product-discount" class="form-label">Discount (%)</label>
                    <input bind:value={product_discount} type="number" class="form-control" id="add-product-discount" min="0" max="100" autocomplete="off" required>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="add-product-weight" class="form-label">Weight (Kg)</label>
                    <input bind:value={product_weight_kg} type="number" class="form-control" id="add-product-weight-kg" min="0" step="1" autocomplete="off" required>
                </div>
                <div class="col">
                    <label for="add-product-weight" class="form-label">Weight (gm)</label>
                    <input bind:value={product_weight_gm} type="number" class="form-control" id="add-product-weight-gm" min="0" max="999" step="1" autocomplete="off" required>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <label for="add-product-image" class="form-label">Product Images</label>
            <div id="add-product-image">
                {#if upload_image_count > 0}
                    {#each upload_images as image}
                        <img src={image.url} class="rounded mx-1" alt="upload-img" style="width: 64px; aspect-ratio: 1;"/>
                    {/each}
                {:else}
                    <div class="alert alert-secondary" role="alert">
                        No Files Added
                    </div>
                {/if}
                <div class="d-flex justify-content-end">
                    {#if upload_image_count > 0}
                        <button on:click={clear_images} type="button" class="btn btn-danger">Clear</button>
                    {/if}
                    <button on:click={add_image} type="button" class="btn btn-success ms-1">Add</button>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <label for="select-product-category" class="form-label">Product Category</label>
            <div id="select-product-category" class="d-flex align-items-center">
                <div class="dropdown me-2">
                    <CategorySelect />
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-end align-items-center">
            <a href="/products-list" class="link-underline link-underline-opacity-0 me-2">Show Products</a>
            <button class="btn btn-success" type="submit" disabled={product_adding}>Confirm</button>
        </div>
    </form>
    <div class="d-flex justify-content-end m-2">
        <a href="/student-applications" type="button" class="btn btn-primary me-2">Student Applications</a>
        <a href="/complete-orders" type="button" class="btn btn-success me-2">Complete Orders</a>
        <a href="/pending-orders" type="button" class="btn btn-primary me-2">Pending Orders</a>
        <a href="/cancelled-orders" type="button" class="btn btn-danger">Cancelled Orders</a>
    </div>
    <div class="card card-body shadow-sm bg-body-white m-2">
        <p class="fs-4 fw-semibold">Categories</p>
        {#if current_categories.length > 0}
            <ul class="list-group list-group-flush">
                {#each current_categories as category}
                    <li class="list-group-item d-flex justify-content-between">
                        <button on:click={() => {category_select(category.id)}} class="btn">{category.title}</button>
                    </li>
                {/each}
            </ul>
        {:else}
            <div class="alert alert-secondary" role="alert">
                No child category
            </div>
        {/if}
        <div class="d-flex flex-row-reverse justify-content-between mt-2">
            <form on:submit={add_category} class="d-flex" action="javascript:">
                <input bind:value={new_category_name} class="form-control me-2" type="text" required />
                <button type="submit" class="btn btn-success" disabled={category_adding}>Add</button>
            </form>
            {#if current_parent !== 0}
                <button on:click={category_back} type="button" class="btn btn-link link-underline link-underline-opacity-0">Back</button>
            {/if}
        </div>
    </div>
</div>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div bind:this={success_toast_elem} class="toast fade align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Successfully Added
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    <div bind:this={error_toast_elem} class="toast fade align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                Successfully Added
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
</div>

<style lang="scss">
    .admin-root
    {
        max-width: 60rem;
    }
</style>