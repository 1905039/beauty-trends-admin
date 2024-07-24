<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import CategorySelect from "$lib/components/category-select.svelte";
    import { UploadImage } from "$lib/containers";
    import { respond401 } from "$lib/helpers";
    import { add_photo_toast_store, other_error_toast_store, product_image_bucket, product_unavailable_toast_store, selected_category, selected_category_toast_store } from "$lib/stores";
    import { onMount } from "svelte";

    let id: number;
    let title: string;
    let price: number;
    let discount: number;
    let weight_kg: number;
    let weight_gm: number;
    let description: string;
    let upload_images: UploadImage[] = [];
    let upload_image_count: number;
    let quantity: number;
    let editing: boolean = false;
    let deleting: boolean = false;
    let refilling: boolean = false;

    $: upload_image_count = upload_images.length;

    function add_image(): void
    {
        let input_elem: HTMLInputElement = document.createElement("input");
        input_elem.type = "file";
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

    function remove(): void
    {
        deleting = true;

        fetch("/api/delete-product",
        {
            method: "DELETE",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
            {
                id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                goto("/");
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

    function edit(): void
    {
        if(upload_image_count === 0)
        {
            $add_photo_toast_store?.show();

            return;
        }

        if($selected_category === 0)
        {
            $selected_category_toast_store?.show();
        }

        let temp_description: string | null | undefined = description;

        if(temp_description === null || temp_description === undefined)
        {
            temp_description = "";
        }

        let data: any =
        {
            id: id,
            title: title,
            price: price,
            discount: discount / 100.0,
            weight: weight_kg + weight_gm / 1000.0,
            description: temp_description,
            type_id: $selected_category
        };

        let form_data: FormData = new FormData();

        form_data.append("data", JSON.stringify(data));
        form_data.append("count", upload_image_count.toString());

        for(let i: number = 0; i < upload_image_count; ++i)
        {
            form_data.append("file-" + i, upload_images[i].file as File);
        }

        editing = true;

        fetch("/api/edit-product",
        {
            method: "POST",
            body: form_data
        }).then((response: Response): void =>
        {
            if(response.status === 200)
            {
                editing = false;
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

    function refill(): void
    {
        refilling = true;

        fetch("/api/refill",
        {
            method: "POST",
            body: JSON.stringify(
            {
                id: id,
                quantity: quantity
            })
        }).then((response: Response): void =>
        {
            if(response.status === 200)
            {
                refilling = false;
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

    function init(): void
    {
        fetch("/api/get-product-data",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
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

                if(data === undefined)
                {
                    $product_unavailable_toast_store?.show();
                    goto("/");

                    return;
                }

                title = data.__title;
                price = data.__price;
                discount = data.__discount * 100.0;
                weight_kg = Math.floor(data.__weight);
                weight_gm = Math.floor(data.__weight * 1000) % 1000;
                quantity = data.__quantity;
                $selected_category = data.__cat_id;
                description = data.__description;
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

        fetch("/api/get-product-images",
        {
            method: "POST",
            body: JSON.stringify(
            {
                id: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();

                if(response_obj.images === undefined)
                {
                    return;
                }

                upload_images = new Array(response_obj.images.length);

                for(let i: number = 0; i < upload_images.length; ++i)
                {
                    upload_images[i] = new UploadImage();
                }

                for(let i: number = 0; i < upload_images.length; ++i)
                {
                    let response: Response = await fetch(product_image_bucket + id + "-" + response_obj.images[i].__id + ".webp",
                    {
                        method: "GET",
                        headers:
                        {
                            "cache-control": "no-cache"
                        }
                    });

                    if(response.status === 200)
                    {
                        let blob: Blob = await response.blob();
                        upload_images[i].url = URL.createObjectURL(blob);
                        upload_images[i].file = blob;
                    }
                    else
                    {
                        $other_error_toast_store?.show();
                    }
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
        id = parseInt($page.params.id);

        init();
    });
</script>

<div class="edit-card card card-body shadow my-2">
    <p class="fs-4 fw-bold">Edit Product</p>
    <form on:submit={edit} action="javascript:">
        <div class="mb-2">
            <label for="product-name" class="form-label">Name</label>
            <input bind:value={title} type="text" class="form-control" id="product-name" autocomplete="off" required>
        </div>
        <div class="container">
            <div class="row mb-2">
                <div class="col ps-0">
                    <label for="product-price" class="form-label">Price (৳)</label>
                    <input bind:value={price} type="number" class="form-control" id="product-price" autocomplete="off" min="0" required>
                </div>
                <div class="col pe-0">
                    <label for="product-discount" class="form-label">Discount (%)</label>
                    <input bind:value={discount} type="number" class="form-control" id="product-discount" autocomplete="off" min="0" max="100" required>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col ps-0">
                    <label for="product-weight" class="form-label">Weight (Kg)</label>
                    <input bind:value={weight_kg} type="number" class="form-control" id="product-weight-kg" autocomplete="off" min="0" step="1" required>
                </div>
                <div class="col pe-0">
                    <label for="product-weight" class="form-label">Weight (gm)</label>
                    <input bind:value={weight_gm} type="number" class="form-control" id="product-weight-gm" autocomplete="off" min="0" max="999" step="1" required>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <label for="product-description" class="form-label">Description</label>
            <textarea bind:value={description} class="form-control" id="product-description" rows="3"></textarea>
        </div>
        <div class="mb-2">
            <label for="edit-product-image" class="form-label">Product Images</label>
            <div id="edit-product-image">
                {#if upload_image_count > 0}
                    {#each upload_images as image}
                        <img src={image.url} class="rounded mx-1" alt="upload-img"  style="width: 64px; aspect-ratio: 1;"/>
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
            <div class="select-product-category">
                <CategorySelect />
            </div>
        </div>
        <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-success" disabled={editing}>Save</button>
            <button on:click={remove} type="button" class="btn btn-danger ms-2" disabled={deleting}>Delete</button>
        </div>
    </form>
</div>

<form on:submit={refill} action="javascript:" class="edit-card card card-body shadow d-flex flex-row align-items-center my-2">
    <p class="fs-5 my-0 me-2">Quantity</p>
    <input bind:value={quantity} type="number" class="form-control" autocomplete="off" min="0" disabled={refilling} required>
    <button type="submit" class="btn btn-primary ms-2">Refill</button>
</form>

<style lang="scss">
    .edit-card
    {
        max-width: 60rem;
        margin-left: auto;
        margin-right: auto;
    }
</style>