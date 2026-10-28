import { useEffect } from 'react';

const SITE = 'VehicleStore';

// Sets the browser tab title, e.g. usePageTitle('My vehicles') -> "My vehicles · VehicleStore".
// Pass nothing (or a falsy value while data loads) for the plain site title.
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} · Buy and sell pre-owned vehicles`;
  }, [title]);
}
