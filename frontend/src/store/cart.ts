import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemState {
    variantId: string;
    productId?: string;
    categoryId?: string;
    productName: string;
    variantLabel: string;
    price: number;
    originalPrice?: number;
    isDiscounted?: boolean;
    image?: string;
    quantity: number;
    sku: string;
}

export interface SelectedCoupon {
    id: string;
    name: string;
    code: string;
    description: string | null;
    discountType: string; // PERCENTAGE | FIXED | BUY_X_GET_Y | FREE_SHIPPING
    discountValue: number;
    buyX: number | null;
    getY: number | null;
    scope: string; // ALL | CATEGORIES | PRODUCTS | CATEGORIES_AND_PRODUCTS
    productIds: string[];
    categoryIds: string[];
}

interface CartStore {
    items: CartItemState[];
    selectedCoupon: SelectedCoupon | null;
    addItem: (item: Omit<CartItemState, "quantity">) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    setSelectedCoupon: (coupon: SelectedCoupon | null) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            selectedCoupon: null,

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.variantId === item.variantId);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, quantity: 1 }] };
                }),

            removeItem: (variantId) =>
                set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

            updateQuantity: (variantId, quantity) =>
                set((state) => ({
                    items: quantity <= 0
                        ? state.items.filter((i) => i.variantId !== variantId)
                        : state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
                })),

            setSelectedCoupon: (coupon) => set({ selectedCoupon: coupon }),

            clearCart: () => set({ items: [], selectedCoupon: null }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        { name: "lina-cart" }
    )
);
