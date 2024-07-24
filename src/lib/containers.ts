export class ProductObj
{
    public id: number = 0;
    public title: string = "";
    public rate: number = 0;
    public sales: number = 0;
    public price: number = 0;
    public discount: number = 0;
}

export class CategoryObj
{
    public id: number = -1;
    public title: string = "";
    public parent: number = -1;
    public children: number[] = [];
}

export class OrderProductObj
{
    public id: number = 0;
    public total_price: number = 0;
}

export class ImageData
{
    public id: number = -1;
    public loaded: boolean = false;
    public data: string = "";
}

export class UploadImage
{
    public url: string = "";
    public file: Blob | undefined;
}