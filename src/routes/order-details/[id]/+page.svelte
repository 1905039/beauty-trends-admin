<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import OrderProductRow from "$lib/components/order-product-row.svelte";
    import { OrderProductObj } from "$lib/containers";
    import { respond401 } from "$lib/helpers";
    import { order_products_store, other_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";

    let id: number;
    let status: number;
    let contact: string;
    let address: string;
    let verified: boolean;
    let paid: boolean;
    let issued_on: Date;
    let date_text: string;
    let time_text: string;
    let sub_total_price: number;
    let student_discount: number;
    let delivery_charge: number;
    let grand_total_price: number;
    let completing: boolean = false;
    let verifying = false;
    let cancelling: boolean = false;

    $: date_text = issued_on?.toLocaleDateString();
    $: time_text = issued_on?.toLocaleTimeString();

    function complete(): void
    {
        completing = true;

        fetch("/api/complete-order",
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

    function verify(): void
    {
        verifying = true;

        fetch("/api/verify-order",
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
                verified = true;
                verifying = false;
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

    function cancel(): void
    {
        fetch("/api/cancel-order",
        {
            method: "DELETE",
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

    onMount((): void =>
    {
        $order_products_store = [];
        cancelling = false;
        id = parseInt($page.params.id);

        fetch("/api/get-order-data",
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
                status = response_obj.data.__status;
                contact = response_obj.data.__contact;
                address = response_obj.data.__address;
                verified = response_obj.data.__verified;
                paid = response_obj.data.__paid;
                issued_on = new Date(response_obj.data.__issued_on)
                sub_total_price = response_obj.data.__sub_total_price;
                student_discount = response_obj.data.__student_discount;
                delivery_charge = response_obj.data.__delivery_charge;
                grand_total_price = response_obj.data.__grand_total_price;
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

        fetch("/api/get-order-products",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json",
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

                $order_products_store = new Array(response_obj.products.length);

                for(let i: number = 0; i < $order_products_store.length; ++i)
                {
                    $order_products_store[i] = new OrderProductObj();
                    $order_products_store[i].id = response_obj.products[i].__id;
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
    });
</script>

<div class="order-root">
    <div class="card card-body shadow mb-5">
        <p class="fs-3 fw-semibold gray-700">Order Details</p>
        <div class="container">
            <div class="row">
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-500 my-0">Order ID</p>
                    <p class="fs-4 fw-semibold gray-700">{id}</p>
                </div>
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-500 my-0">Status</p>
                    <p class="fs-4 fw-semibold gray-700">
                        {#if status === 0}
                            Cancelled
                        {:else if status === 1}
                            Delivering
                        {:else if status === 2}
                            Delivered
                        <!-- unlikely case -->
                        {:else}
                            Unknown
                        {/if}
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-500 my-0">Contact</p>
                    <p class="fs-4 fw-semibold gray-700">{contact}</p>
                </div>
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-500 my-0">Issued On</p>
                    <p class="fs-4 fw-semibold gray-700">
                        <span>{date_text}</span>
                        <span>{time_text}</span>
                    </p>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="row">
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-500 my-0">Verified</p>
                </div>
                <div class="col p-0">
                    <p class="fs-5 fw-semibold gray-500 my-0">Paid</p>
                </div>
            </div>
            <div class="row">
                <div class="col p-0">
                    {#if verified}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check text-success" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban text-danger" viewBox="0 0 16 16">
                            <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                        </svg>
                    {/if}
                </div>
                <div class="col p-0">
                    {#if paid}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check text-success" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban text-danger" viewBox="0 0 16 16">
                            <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                        </svg>
                    {/if}
                </div>
            </div>
        </div>
        <p class="fs-5 fw-semibold gray-500 mt-3 mb-0">Address</p>
        <p class="fs-4 fw-semibold gray-700">{address}</p>
        <p class="fs-3 fw-semibold gray-700 my-0">Products</p>
        <table class="table mb-2">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Product ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Unit Price</th>
                    <th scope="col">Total Price</th>
                </tr>
            </thead>
            <tbody class="align-middle">
                {#each $order_products_store as product, index}
                    <OrderProductRow id={product.id} index={index} />
                {/each}
            </tbody>
        </table>
        <div class="d-flex justify-content-between placeholder-glow mt-2">
            <p class="fs-5 gray-700 m-0">Sub Total</p>
            <p class="fs-5 gray-700 m-0">
                ৳{sub_total_price}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow">
            <p class="fs-5 gray-700 m-0">Student Discount</p>
            <p class="fs-5 gray-700 m-0">
                -{student_discount}%
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow">
            <p class="fs-5 gray-700 m-0">Delivery Charge</p>
            <p class="fs-5 gray-700 m-0">
                ৳{delivery_charge}
            </p>
        </div>
        <div class="d-flex justify-content-between placeholder-glow mb-2">
            <p class="fs-4 fw-semibold gray-700 m-0">Grand Total</p>
            <p class="fs-4 fw-semibold gray-700 m-0">
                ৳{grand_total_price}
            </p>
        </div>
        {#if status === 1}
            <div class="d-flex justify-content-end">
                {#if verified}
                    <button on:click={complete} class="btn btn-success d-flex align-items-center" disabled={completing}>
                        Complete
                    </button>
                {:else}
                    <button on:click={verify} class="btn btn-secondary d-flex align-items-center" disabled={verifying}>
                        Verify
                    </button>
                    <button on:click={cancel} class="btn btn-danger d-flex align-items-center ms-2" disabled={cancelling}>
                        Cancel
                    </button>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .order-root
    {
        position: absolute;
        top: 8rem;
        left: 25%;
        right: 25%;
    }
</style>