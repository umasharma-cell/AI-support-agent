export interface StoreKnowledgeItem {
  title: string;
  content: string;
}

export const storeKnowledge: StoreKnowledgeItem[] = [
  {
    title: 'Shipping Policy',
    content:
      'Standard shipping is available across India and usually arrives within 3-7 business days after order confirmation. International shipping is not available for the demo store unless explicitly announced by support.',
  },
  {
    title: 'Returns Policy',
    content:
      'Customers can request a return within 30 days of delivery. Items must be unused, undamaged, and returned with original packaging and proof of purchase.',
  },
  {
    title: 'Refund Policy',
    content:
      'Refunds are processed to the original payment method within 5 business days after the returned item passes inspection.',
  },
  {
    title: 'Support Hours',
    content:
      'Support is available Monday to Friday, 9:00 AM to 6:00 PM IST. Requests sent outside support hours are picked up on the next business day.',
  },
];

export const formatStoreKnowledge = (items: StoreKnowledgeItem[] = storeKnowledge): string => {
  return items.map((item) => `${item.title}:\n${item.content}`).join('\n\n');
};
