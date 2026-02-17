import ProductForm from "@/components/admin/ProductForm";

// Mock data fetcher
const getProduct = (id: string) => {
    return {
        id,
        name: "Sac de Jour Nano",
        description: "Saint Laurent Sac de Jour Nano modeli. İtalyan yapımı, %100 deri. Klasik ve zamansız tasarım.",
        brand: "Saint Laurent",
        sku: "SL-SDJ-001",
        price: "₺84.500",
        stock: 12,
        status: "Aktif",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaMUIzs8tMbD6Jdp6h7nDFK-t9YBYB6x_vKfQanmFdP2vI7Qo5clJevDG6RHK6orMN-QYMTvw3eek4T8kMOMYRrt2xxqHBMECIfAzxjSBFxeHOifnDaFcXUiKTjKK1TqKRJKgAB3c89TI08kNNMtMyi9gKLvZzBGpq6YI6W5RSvisIkWJnBVrPvWRCfTd_gq7QilmyTPIpEHCXQUeR8Va9V19_Ut9RqD_PqcbBIOdsGwHXU-XZ-jViKVfzRDWSnJYmKcSfmFUl_FLV"
    };
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = getProduct(id);

    return <ProductForm title="Ürünü Düzenle" initialData={product} />;
}
