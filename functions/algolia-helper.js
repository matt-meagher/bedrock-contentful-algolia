import algoliasearchHelper from 'algoliasearch-helper';
//https://github.com/algolia/react-instantsearch/issues/3547
import algoliasearch from 'algoliasearch/dist/algoliasearch-lite.esm.browser';
import { createNodeHttpRequester } from '@algolia/requester-node-http';

export async function handleHttpRequest(request, context) {
  const algoliaParameters = {
    query: 'seltzer',

    /**
     * General Config
     */
    getRankingInfo: true,
    analytics: false,
    enableABTest: false,
    attributesToRetrieve: "*",
    attributesToSnippet: "*:20",
    snippetEllipsisText: "…",


    /**
     * Facet Configuration
     */
    maxValuesPerFacet: 100,
    // facets: [...CONJUNCTIVE_FACETS, ...(facetByIsSearchable ? [IS_SEARCHABLE_FACET] : [])],
    // disjunctiveFacets: DISJUNCTIVE_FACETS,
    // disjunctiveFacetsRefinements,
    // facetsRefinements,
    distinct: true,
    facetingAfterDistinct: false, //False so we get all facets for all variants
    hitsPerPage: 8
  }

  const client = await algoliasearch(context.environmentVars.ALGOLIA_APP_ID, context.environmentVars.ALGOLIA_ADMIN_KEY, { requester: createNodeHttpRequester() });
  const helper = await algoliasearchHelper(client, 'shopify_products', algoliaParameters);
  // const res = await helper.searchOnce();
  const index = client.initIndex('shopify_products');
  const res = await index.search('seltzer');
  console.log("🚀 ~ handleHttpRequest ~ res:", res)

  return new Response('Testing!');
  
}
