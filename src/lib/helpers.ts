import { categories_store, category_chain, logged_out_toast_store, login_store, other_error_toast_store, selected_category } from "$lib/stores";
import { CategoryObj } from "$lib/containers";
import { get } from "svelte/store";
import { goto } from "$app/navigation";

export function respond401(): void
{
    get(logged_out_toast_store)?.show();
    login_store.set(1);
    goto("/");
}

export function get_categories(): void
{
    fetch("/api/get-categories",
    {
        method: "GET"
    }).then(async (response: Response): Promise<void> =>
    {
        if(response.status === 200)
        {
            let response_obj: any = await response.json();

            categories_store.set(new Map());

            for(let i: number = 0; i < response_obj.categories.length; ++i)
            {
                let new_category: CategoryObj = new CategoryObj();
                new_category.id = response_obj.categories[i].__id;
                new_category.title = response_obj.categories[i].__title;
                new_category.parent = response_obj.categories[i].__parent;

                get(categories_store).set(new_category.id, new_category);
            }

            get(categories_store).forEach((value: CategoryObj): void =>
            {
                if(value.parent === 0)
                {
                    return;
                }

                get(categories_store).get(value.parent)?.children.push(value.id);
            });

            setup_category_chain(get(selected_category));
        }
        else
        {
            get(other_error_toast_store)?.show();
        }
    });
}

export function setup_category_chain(category_id: number): void
{
    category_chain.set([]);
    let current: number = category_id;

    while(current !== 0)
    {
        let current_category: CategoryObj | undefined = get(categories_store).get(current);

        if(current_category)
        {
            get(category_chain).push(current_category.title);
            
            current = current_category.parent;
        }
        else
        {
            current = 0;
        }
    }

    category_chain.set(get(category_chain).reverse());
}