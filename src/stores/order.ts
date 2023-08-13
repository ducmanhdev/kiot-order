import {defineStore} from 'pinia';
import axios from '@/plugins/axios';
import {useGlobalStore} from "@/stores/global";
import ModalAddCart from "@/components/modal/ModalAddCart.vue";

export type Promotion = {
    code: string;
    price: number;
}

export type UpdateOrderRequest = {
    order_id: number,
    payment_action: "SALE_RESPONSE",
    data: {
        responseCode: string;
        amount: number;
        [key: string]: any;
    }
}

export type Modifier = {
    modifier_name: string;
    type: 'single' | 'multi';
    required: boolean;
    details: ModifierDetail[];
    is_selected: boolean;
    id: string;
    value?: ModifierValue[];
}

export type ModifierDetail = {
    name: string;
    price: string;
    id: string;
}

export type ModifierValue = {
    id: string;
    name: string;
    price: number;
}

export type Category = {
    id: number;
    name: string;
    items: CategoryItem[];
}

export type CategoryItem = {
    id: number;
    name: string;
    image?: string;
    item_variants: ItemVariant[];
    item_variant?: ItemVariant;
    modifier?: Modifier[];
    quantity?: number;
    note?: string;
}

export type ItemVariant = {
    id: number;
    item_id: number;
    image?: string;
    name: string;
    price: number;
    price_before_discount?: number;
}

export type CartItem = CategoryItem & { cart_id: number }

export const useOrderStore = defineStore('order', {
    state: () => ({
        modalAddCartRef: null as InstanceType<typeof ModalAddCart> | null,
        cartList: [] as CartItem[],
        categoryList: [] as Category[],
        shippingFee: 0,
        vat: 0,
        promotion: null as Promotion | null,
        orderType: 'pick_up' as 'pick_up' | 'delivery',
        paymentMethod: 'cash' as 'cash' | 'credit_card',
        currency: 'USD' as 'USD',
        failedOrderId: null as number | null,
    }),
    getters: {
        isCartEmpty(state) {
            return !(state.cartList && state.cartList.length > 0)
        },
        cartQuantity(state) {
            return (state.cartList || []).reduce((total: number, currentItem: any) => {
                total += currentItem.quantity;
                return total;
            }, 0)
        },
        orderItems(state) {
            return state.cartList.map((item: any) => ({
                item_id: item.id,
                quantity: item.quantity,
                item_name: item.name,
                item_variant: {
                    id: item.item_variant?.id,
                    name: item.item_variant?.name,
                    price: item.item_variant?.price,
                },
                note: item.note,
                item_modifier: item.modifier
            }))
        },
        checkoutData(state) {
            return {
                type: state.orderType,
                payment_method: state.paymentMethod,
                order_items: (this as any).orderItems,
                currency: state.currency,
            }
        },
        priceDiscount(state) {
            return state.promotion?.price ?? 0
        },
        priceSubtotal(state) {
            return state.cartList.reduce((total: number, currentItem: any) => {
                total = total + (this as any).priceTotalOfCartItem(currentItem.cart_id);
                return total;
            }, 0)
        },
        priceTotal(state) {
            return (this as any).priceSubtotal - (this as any).priceDiscount + state.vat
        },
        getCartItem(state) {
            return (cart_id: number) => {
                return state.cartList.find((item: any) => item.cart_id === cart_id)
            };
        },
        priceSubTotalOfCartItem(): (cart_id: number) => number {
            return (cart_id) => {
                const item = (this as any).getCartItem(cart_id);
                if (!item) return 0;
                const modifierTotalPrice = (item?.modifier || [])
                    .filter((item: any) => item?.is_selected)
                    .map((item: any) => item?.value)
                    .flat()
                    .reduce((_total: number, _currentItem: any) => _total + Number(_currentItem?.price || 0), 0);
                const variantPrice = Number(item?.item_variant?.price || 0);
                return variantPrice + modifierTotalPrice;
            }
        },
        priceTotalOfCartItem() {
            return (cart_id: number) => {
                const item = (this as any).getCartItem(cart_id);
                if (!item) return 0;
                return (this as any).priceSubTotalOfCartItem(cart_id) * (item?.quantity || 1);
            }
        },
    },
    actions: {
        showModalAddCart(data: CategoryItem) {
            this.modalAddCartRef?.show(data);
        },
        getList() {
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await axios.get('/orderonline/category_kiot/site/list');
                    this.categoryList = res?.data?.result?.data;
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
        },
        addCartItem(data: any) {
            const index = this.cartList.findIndex((item: any) => item.id === data.id);
            if (
                index > -1 &&
                JSON.stringify(this.cartList[index].modifier) === JSON.stringify(data.modifier) &&
                this.cartList[index].note === data.note &&
                this.cartList[index].item_variant?.id === data.item_variant.id
            ) {
                this.cartList[index].quantity = this.cartList[index].quantity + data.quantity;
            } else {
                this.cartList.push({
                    ...data,
                    cart_id: Date.now(),
                });
            }
        },
        async deleteCartItem(cartId: number) {
            try {
                const globalStore = useGlobalStore();
                await globalStore.confirm('Are you sure to delete this order?');
                this.cartList = this.cartList.filter((item: any) => item.cart_id !== cartId);
            } catch (error) { /* empty */
            }
        },
        setCartItemQuantity(cart_id: number, newQuantity: number) {
            const index = this.cartList?.findIndex((item: any) => item.cart_id === cart_id);
            if (index === -1) return;
            this.cartList[index].quantity = newQuantity;
        },
        clearCart() {
            this.cartList = [];
            this.promotion = null;
            this.orderType = 'pick_up';
            this.paymentMethod = 'cash';
        },
        setPromotion(promotion: Promotion) {
            this.promotion = promotion
        },
        removePromotion() {
            this.promotion = null;
        },
        checkPromotionCode(promotionCode: string) {
            return new Promise(async (resolve, reject) => {
                try {
                    const res: any = await axios.post('/v1/end_user/promotion/check-promotion-code', {
                        ...(this as any).checkoutData,
                        promotion_code: promotionCode
                    });
                    if (!res?.data?.result?.data) {
                        throw new Error('Voucher is not valid');
                    }
                    this.setPromotion({
                        code: promotionCode,
                        price: res?.data?.result?.data?.price_promotion_code,
                    });
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
        },
        createOrder() {
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await axios.post('/orderonline/order/form/create', {
                        ...(this as any).checkoutData,
                    });
                    resolve(res);
                } catch (error) {
                    reject(error);
                }
            })
        },
        updateOrder() {
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await axios.post('/orderonline/order/form/update', {
                        id: this.failedOrderId,
                        ...(this as any).checkoutData,
                    });
                    resolve(res);
                } catch (error) {
                    reject(error);
                }
            })
        },
        checkout() {
            if (this.failedOrderId) {
                return this.updateOrder();
            }
            return this.createOrder();
        },
        updatePaymentData(payload: UpdateOrderRequest) {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios.post('/orderonline/order/form/update-payment-data', payload);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })
        },
        setOrderFailedId(id: number) {
            this.failedOrderId = id;
        },
        clearOrderFailedId() {
            this.failedOrderId = null;
        },
    },
    persist: {
        key: 'cart',
        paths: ['cartList'],
    },
});