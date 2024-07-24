<script lang="ts">
    import { categories_store, other_error_toast_store, product_image_bucket, products_store } from "$lib/stores";
    import { CategoryObj, ImageData } from "$lib/containers";
    import { goto } from "$app/navigation";
    import { respond401 } from "$lib/helpers";

    export let index: number;
    export let id: number;
    let title: string = "";
    let price: number = 0;
    let discount: number = 0;
    let weight: number = 0.0;
    let quantity: number = 0;
    let sales: number = 0;
    let category_id: number = 0;
    let category: string = "";
    let description: string = "";
    let deleting: boolean = false;
    let description_present: boolean;
    let images_data: ImageData[] = [];
    let current_image_idx: number = 0;
    let refilling: boolean = false;

    $: description_present = (description.length > 0) ? true : false;
    $: init(id);
    $: setup_category(category_id);

    function setup_category(current_id: number): void
    {
        category = "";

        while(current_id !== 0)
        {
            let category_obj: CategoryObj | undefined = $categories_store.get(current_id);

            if(category_obj)
            {
                if(category.length === 0)
                {
                    category = category_obj.title;
                }
                else
                {
                    category = category_obj.title + " / " + category;
                }

                current_id = category_obj.parent;
            }
            else
            {
                current_id = 0;
            }
        }
    }

    function init(id: number): void
    {
        deleting = false;

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
                title = data.__title;
                price = data.__price;
                discount = data.__discount;
                quantity = data.__quantity;
                sales = data.__sales;
                weight = data.__weight;
                category_id = data.__cat_id;
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
                images_data = new Array(response_obj.images.length);

                for(let i: number = 0; i < images_data.length; ++i)
                {
                    images_data[i] = new ImageData();
                    images_data[i].id = response_obj.images[i].__id;
                    let response: Response = await fetch(product_image_bucket + id + "-" + images_data[i].id + ".webp",
                    {
                        method: "GET",
                        headers:
                        {
                            "cache-control": "no-cache"
                        }
                    });

                    let blob: Blob = await response.blob();
                    images_data[i].data = URL.createObjectURL(blob);
                }
            }
            else
            {
                $other_error_toast_store?.show();
            }
        });
    }

    function delete_product(): void
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
                let temp_products: number[] = [];

                for(let i: number = 0; i < $products_store.length; ++i)
                {
                    if(index !== i)
                    {
                        temp_products.push($products_store[i]);
                    }
                }

                $products_store = Array.from(temp_products);
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

    function previous_image(): void
    {
        if(images_data.length === 0)
        {
            return;
        }

        --current_image_idx;

        if(current_image_idx < 0)
        {
            current_image_idx = images_data.length - 1;
        }
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

    function next_image(): void
    {
        if(images_data.length === 0)
        {
            return;
        }

        ++current_image_idx;

        if(current_image_idx >= images_data.length)
        {
            current_image_idx = 0;
        }
    }
</script>

<div class="card card-body shadow bg-body-white d-flex justify-content-start flex-row mb-3">
    <div class="d-flex align-items-center">
        <button on:click={previous_image} class="btn btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
            </svg>
        </button>
        {#if images_data[current_image_idx] !== undefined}
            <img src={images_data[current_image_idx].data} class="align-self-start img-fluid rounded" alt="img" style="width: 200px; aspect-ratio: 1">
        {/if}
        <button on:click={next_image} class="btn btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
            </svg>
        </button>
    </div>
    <div class="flex-fill d-flex flex-column justify-content-between ms-5">
        <div>
            <p class="fs-2 fw-semibold m-0">{title}</p>
            <div class="container">
                <div class="row">
                    <p class="col fs-5 ps-0 m-0">Price: {price}</p>
                    <p class="col fs-5 pe-0 m-0">Discount: {discount * 100}%</p>
                </div>
            </div>
            <div class="container">
                <div class="row">
                    <p class="col fs-5 ps-0 m-0">Sales: {sales}</p>
                    <p class="col fs-5 pe-0 m-0">Category: {category}</p>
                </div>
            </div>
            <p class="fs-5 m-0">Weight: {weight} Kg</p>
            {#if description_present}
                <a class="fs-5 link-underline link-underline-opacity-0" data-bs-toggle="collapse" href={"#description-collapse-" + id} role="button" aria-expanded="false" aria-controls="description-collapse">
                    Description
                </a>
                <br>
                <div class="collapse" id={"description-collapse-" + id}>
                    <div class="card card-body">
                        {description}
                    </div>
                </div>
            {/if}
        </div>
        <div class="d-flex align-items-center justify-content-end mt-2">
            <p class="fs-5 my-0 me-2">Quantity</p>
            <form on:submit={refill} action="javascript:" class="d-flex align-items-center">
                <input bind:value={quantity} type="number" class="form-control me-2" min="0" autocomplete="off" style="max-width: 7em;" required>
                <button type="submit" class="btn btn-primary me-2" disabled={refilling}>Refill</button>
            </form>
            <button on:click={() => {goto("/edit-product/" + id)}} type="button" class="btn btn-primary me-2" disabled={deleting}>Edit</button>
            <button on:click={delete_product} type="button" class="btn btn-danger"  disabled={deleting}>Delete</button>
        </div>
    </div>
</div>