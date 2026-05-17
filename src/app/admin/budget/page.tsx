import { getItems } from './actions';
import { BudgetClient } from './BudgetClient';

export default async function BudgetPage() {
  const items = await getItems();
  return <BudgetClient initialItems={items} />;
}
