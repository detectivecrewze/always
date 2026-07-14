const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k) acc[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

async function run() {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = env.KV_NAMESPACE_ID;
  const token = env.CLOUDFLARE_API_TOKEN;

  const listRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys?prefix=draft:`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await listRes.json();

  if (data.result) {
    for (let key of data.result) {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key.name}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const val = await res.json();
      if (val.orderId === 'ORD-MRG0T937') {
        console.log('Found slug:', key.name.replace('draft:', ''));
        return;
      }
    }
  }
  
  // also check orders
  const listOrders = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys?prefix=order:ORD-MRG0T937`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const dataOrder = await listOrders.json();
  if (dataOrder.result && dataOrder.result.length > 0) {
    console.log('Order exists in KV! We can use a generated slug: auto-' + Date.now());
  } else {
    console.log('Order not found');
  }
}
run();
