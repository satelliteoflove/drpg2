import { weapons } from './categories/weapons';
import { armor } from './categories/armor';
import { consumables } from './categories/consumables';
import { accessories } from './categories/accessories';

export const itemsData = {
  ...weapons,
  ...armor,
  ...consumables,
  ...accessories,
};
