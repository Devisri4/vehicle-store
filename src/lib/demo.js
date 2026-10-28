// Public demo accounts so visitors (e.g. recruiters) can explore without signing up.
// These credentials are intentionally public: the accounts hold only sample data and have no
// admin rights. Database policies still apply to them like any other buyer or seller.
// example.com is reserved for documentation (RFC 2606), so no real person receives mail for these.
export const DEMO_ACCOUNTS = [
  { role: 'buyer', label: 'Demo buyer', email: 'demo.buyer@example.com', password: 'DemoBuyer#2026' },
  { role: 'seller', label: 'Demo seller', email: 'demo.seller@example.com', password: 'DemoSeller#2026' },
];

export const isDemoAccount = (email) => DEMO_ACCOUNTS.some((account) => account.email === email);
