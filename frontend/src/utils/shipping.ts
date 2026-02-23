export interface StoreSettingsParams {
    shippingFee: number;
    applyToFree: boolean;
    calcMethod: "single" | "sum" | "first_plus" | "threshold" | "delivery_method";
    freeShippingActive: boolean;
    internationalActive: boolean;
    firstPlusExtra: number;
    thresholdValue: number;
    belowThresholdFee: number;
    aboveThresholdFee: number;
    deliveryMethods?: Array<{ id: number, name: string, fee: string | number, isDefault: boolean }>;
}

export interface CartItemParam {
    id?: string;
    variantId?: string;
    quantity: number;
    price: number;
    // (Optional logic if applyToFree should differentiate products with free shipping)
    isFreeShipping?: boolean;
}

export function calculateShippingCost(
    settings: StoreSettingsParams,
    cartItems: CartItemParam[],
    selectedDeliveryMethodId?: number
): number {

    // Eğer sepet boşsa veya ücretsiz kargo global olarak açıksa
    if (cartItems.length === 0 || settings.freeShippingActive) {
        return 0;
    }

    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    let cost = 0;

    switch (settings.calcMethod) {
        case "single":
            // Tek bir ürünün sabit kargo ücreti
            cost = settings.shippingFee;
            break;

        case "sum":
            // Tüm ürünlerin toplam kargo ücreti
            cost = settings.shippingFee * totalQuantity;
            break;

        case "first_plus":
            // İlk ürün için standart ücret, sonrakiler için ekstra
            if (totalQuantity > 0) {
                cost = settings.shippingFee + ((totalQuantity - 1) * settings.firstPlusExtra);
            }
            break;

        case "threshold":
            // Eşik değer kontrolü
            if (subtotal < settings.thresholdValue) {
                cost = settings.belowThresholdFee;
            } else {
                cost = settings.aboveThresholdFee;
            }
            break;

        case "delivery_method":
            // Müşterinin seçtiği kargo ücreti
            if (settings.deliveryMethods && settings.deliveryMethods.length > 0) {
                let selectedMethod = settings.deliveryMethods.find((m: any) => m.id === selectedDeliveryMethodId);

                // Eğer ID yoksa veya bulunamadıysa varsayılanı kullan
                if (!selectedMethod) {
                    selectedMethod = settings.deliveryMethods.find((m: any) => m.isDefault) || settings.deliveryMethods[0];
                }

                if (selectedMethod) {
                    const feeStr = String(selectedMethod.fee).replace(",", ".");
                    cost = parseFloat(feeStr) || 0;
                }
            }
            break;

        default:
            cost = settings.shippingFee;
            break;
    }

    return cost;
}
