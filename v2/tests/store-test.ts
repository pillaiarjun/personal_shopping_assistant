// Times Sasha's store search and the three-outfit builder.  Run: node tests/store-test.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });
const { search, brief, buildOutfits, byId } = await import('../store.ts');

const searches: [string, any][] = [
  ['olive bomber jacket', { gender: 'men' }],
  ['something for a beach wedding', { gender: 'men' }],
  ['comfy sneakers', { gender: 'men', just_in: true }],
];
for (const [query, f] of searches) {
  const t0 = Date.now();
  const r = await search({ query, ...f, limit: 4 });
  console.log(`search "${query}" ${JSON.stringify(f)} ${Date.now() - t0} ms:\n  ` + r.map((p: any) => `${p.id} ${brief(p).title} $${p.simulated.price}`).join('\n  '));
}

const { outfits, ms } = await buildOutfits({
  occasion: "cousin's wedding, outdoor, early summer",
  budget_usd: 500,
  gender: 'men',
  notes: 'Into casual streetwear. Would never wear polka dots. Wearing a black track jacket.',
});
console.log(`\n3 outfits in ${ms} ms`);
for (const o of outfits) {
  console.log(`\n${o.outfit_name} ($${o.total_usd}) - ${o.difference}\n  ${o.why_it_works}`);
  for (const it of o.items) console.log(`  ${it.slot}: ${it.product_id} ${byId[it.product_id].title} $${byId[it.product_id].simulated.price}`);
}
