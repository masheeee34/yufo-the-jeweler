import { getRequests, saveRequests } from './requestsDb';
import { isPaid, orderInfo, requestKind } from './commerce';
import { grantForOrder } from './filesDb';
import { notifyCustomer } from './customersDb';
import { isRealEmail, UserProfile } from './usersDb';

// Achats faits en invité avec cette adresse : rattachés au compte dès que l'adresse est vérifiée,
// avec l'accès aux fichiers des commandes déjà payées.
export function claimGuestPurchases(user: UserProfile): number {
  if (!user.emailVerified || !isRealEmail(user.email)) return 0;
  const email = user.email.trim().toLowerCase();
  const requests = getRequests();
  const claimed = requests.filter(
    (r) =>
      !r.userId &&
      !r.discordId &&
      requestKind(r) === 'order' &&
      (orderInfo(r).email || '').trim().toLowerCase() === email
  );
  if (!claimed.length) return 0;
  for (const r of claimed) r.userId = user.id;
  saveRequests(requests);
  for (const r of claimed) if (isPaid(orderInfo(r).paymentStatus)) grantForOrder(r, 'system');
  notifyCustomer(user.id, {
    type: 'order',
    title: claimed.length === 1 ? 'Purchase added to your library' : `${claimed.length} purchases added to your library`,
    text: 'Your past guest purchases are now saved in your account.',
    href: '/account?tab=library',
  });
  return claimed.length;
}
