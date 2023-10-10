// import EscPosEncoder from "@manhnd/esc-pos-encoder";
// import {print} from "@/sdk";
// import FormatHelper from "@/utils/formatHelper";
// import handleError from "@/utils/error";
// import {useOrderStore} from "@/stores/order";
// import type {CartItem, Modifier, ModifierValue} from "@/stores/order";

// const capitalize = (str: string) => {
//     if (!str) return '';
//     return str.charAt(0).toUpperCase() + str.slice(1);
// }

// export async function printReceipt(cartList: CartItem[], checkoutResponse: any) {
//     try {
//         const orderStore = useOrderStore();
//         const encoder = new EscPosEncoder();

//         const modifierValueRaw = (modifierValue: ModifierValue[] = []) => {
//             return modifierValue.map(item =>
//                 encoder
//                     .initialize()
//                     .line(`- ${item.name}`)
//                     .encode()
//             ) as unknown as number[];
//         }

//         const modifierRaw = (modifier: Modifier[] = []) => {
//             return modifier.map(item =>
//                 encoder
//                     .initialize()
//                     .line(capitalize(`${item?.modifier_name}:`))
//                     .raw(modifierValueRaw(item.value))
//                     .encode()
//             ) as unknown as number[];
//         }

//         const cartListRaw: any = [...cartList].map((product: any) => {
//                 const price = (orderStore as any).priceTotalOfCartItem(product.cart_id);
//                 const modifier = FormatHelper.tryParseJson(product?.modifier);
//                 return (
//                     encoder
//                         .initialize()
//                         .bold(true)
//                         .line(product.name)
//                         .bold(false)
//                         .line(`Variant: ${product?.item_variant?.name}`)
//                         .raw(modifierRaw(modifier))
//                         .line(`Note: ${product?.note}`)
//                         .table(
//                             [
//                                 {width: 22, align: "left"},
//                                 {width: 25, align: "right"},
//                             ],
//                             [
//                                 ['Quantity:', `${product?.quantity}`],
//                                 ['Price:', FormatHelper.formatShownPrice(price)],
//                             ]
//                         )
//                         .printLineFull("-")
//                         .encode()
//                 );
//             }
//         );

//         const result = encoder
//             .initialize()
//             .bold(true)
//             .align('center')
//             .line("RECEIPT")
//             .bold(false)
//             .align('left')
//             .printLineFull("-")
//             .raw(cartListRaw)
//             .table(
//                 [
//                     {width: 22, align: "left"},
//                     {width: 25, align: "right"},
//                 ],
//                 [
//                     ['Sub Total:', FormatHelper.formatShownPrice((orderStore as any).priceSubtotal)],
//                     ['Discount:', FormatHelper.formatShownPrice((orderStore as any).priceDiscount)],
//                     ['VAT:', FormatHelper.formatShownPrice(orderStore.vat)],
//                     ['TOTAL:', FormatHelper.formatShownPrice((orderStore as any).priceTotal)],
//                 ]
//             )
//             .printLineFull("-")
//             .align('center')
//             .line("Thank you for your order")
//             .newline()
//             .newline()
//             .cut()
//             .encode();
//         await print(result);
//     } catch (error) {
//         handleError({error, message: 'Print error'});
//     }
// }
export default {};