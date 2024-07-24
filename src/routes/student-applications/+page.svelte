<script lang="ts">
    import { respond401 } from "$lib/helpers";
    import { other_error_toast_store } from "$lib/stores";
    import { onMount } from "svelte";

    class StudentApplicant
    {
        public id: number = 0;
        public name: string = "";
        public contact: string = "";
        public date: Date | undefined;
        public front_img: string | undefined;
        public back_img: string | undefined;
    }

    let student_discount: number = 0.0;
    let student_applicants: StudentApplicant[] = [];

    function get_student_discount(): void
    {
        fetch("/api/get-student-discount",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                student_discount = parseFloat(response_obj.student_discount) * 100.0;
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

    function set_student_discount(): void
    {
        let temp_value: number = student_discount / 100.0;

        fetch("/api/set-student-discount",
        {
            method: "POST",
            body: JSON.stringify(
            {
                value: temp_value.toString()
            })
        }).then(async (response: Response) =>
        {
            if(response.status === 200)
            {

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

    function get_discount_applicants(): void
    {
        fetch("/api/get-student-applicants",
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                student_applicants = new Array(response_obj.applicants.length);

                for(let i: number = 0; i < student_applicants.length; ++i)
                {
                    student_applicants[i] = new StudentApplicant();
                    student_applicants[i].id = response_obj.applicants[i].__id;
                    student_applicants[i].name = response_obj.applicants[i].__username;
                    student_applicants[i].contact = response_obj.applicants[i].__contact;
                    student_applicants[i].date = new Date(response_obj.applicants[i].__app_date);

                    fetch("/api/get-student-app-images",
                    {
                        method: "POST",
                        body: JSON.stringify(
                        {
                            id: student_applicants[i].id
                        })
                    }).then(async (response: Response): Promise<void> =>
                    {
                        if(response.status === 200)
                        {
                            let response_obj: FormData = await response.formData();
                            let front_blob: Blob | undefined = new Blob([response_obj.get("front")?.slice() as Blob], {type: "image/webp"});
                            let back_blob: Blob | undefined = new Blob([response_obj.get("back")?.slice() as Blob], {type: "image/webp"});
                            
                            student_applicants[i].front_img = URL.createObjectURL(front_blob);
                            student_applicants[i].back_img = URL.createObjectURL(back_blob);
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

    function finalize_request(id: number, accept: boolean): void
    {
        fetch("/api/finalize-student-app",
        {
            method: "POST",
            body: JSON.stringify(
            {
                id: id,
                accept: accept
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let temp_applicants: StudentApplicant[] = [];

                for(let i: number = 0; i < student_applicants.length; ++i)
                {
                    if(student_applicants[i].id !== id)
                    {
                        temp_applicants.push(student_applicants[i]);
                    }
                }

                student_applicants = Array.from(temp_applicants);
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
        get_student_discount();
        get_discount_applicants();
    });
</script>

<div class="page-root mx-auto">
    <div class="root-child-card-holder">
        <div class="root-child-card card card-body">
            <label for="discount-percentage" class="form-label">Discount Percentage</label>
            <form on:submit={set_student_discount} id="discount-percentage" class="input-group">
                <input bind:value={student_discount} type="number" class="form-control" min="0" max="100" autocomplete="off" required>
                <button type="submit" class="btn btn-primary">Save</button>
            </form>
        </div>
    </div>
    <div class="root-child-card-holder">
        {#each student_applicants as applicant}
            <div class="root-child-card card card-body m-2">
                <p>Name: {applicant.name}</p>
                <p>Contact: {applicant.contact}</p>
                <p>Date: {applicant.date}</p>
                <div class="d-flex align-items-end justify-content-between">
                    <div class="d-flex">
                        <img src={applicant.front_img} alt="front-img" class="application-img rounded me-2" />
                        <img src={applicant.back_img} alt="back-img" class="application-img rounded" />
                    </div>
                    <div class="d-flex">
                        <button on:click={() => {finalize_request(applicant.id, true);}} class="btn btn-primary me-2">Accept</button>
                        <button on:click={() => {finalize_request(applicant.id, false);}} class="btn btn-danger">Cancel</button>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    .page-root
    {
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }
    .root-child-card-holder
    {
        display: flex;
        justify-content: center;
        margin: 1.5rem 0.5rem 1.5rem 0.5rem;
    }
    .root-child-card
    {
        max-width: 60rem;
    }
    .application-img
    {
        height: 128px;
    }
</style>