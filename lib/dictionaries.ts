import { cookies } from 'next/headers';
import { en } from '../dictionaries/en';
import { gu } from '../dictionaries/gu';

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  if (locale === 'gu') {
    return gu;
  }
  return en;
};
