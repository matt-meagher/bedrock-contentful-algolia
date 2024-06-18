import resolveResponse from 'contentful-resolve-response';

/**
 * This is middleware meant to be used as an endpoint for a Contentful to Algolia webhook
 * Contentful can interface with Algolia directly but using a middleware script has 2 benefits
 * 1. This allows linked entries to be queried by Algolia as well (a standard webhook cannot do this)
 * 2. This allows us to "post" entires to an index based on a entry field values. In our case `isSearchable`
 */

const updateIndex = async (request, context, params) => {
  const searchParams = new URL(request.url).searchParams;
  const {
    ALGOLIA_APP_ID: algoliaAppID,
    ALGOLIA_ADMIN_KEY: algoliaAPIKey,
    ALGOLIA_INDEX,
  } = context.environmentVars;

  const indexName = searchParams.get('index_name') || ALGOLIA_INDEX || 'contentful_blogs_pages';

  const algoliaQuery = await fetch(
    `https://${algoliaAppID}-dsn.algolia.net/1/indexes/${indexName}/batch`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-API-Key': algoliaAPIKey,
        'X-Algolia-Application-Id': algoliaAppID,
      },
      body: JSON.stringify({requests: params}),  
      edgio: {
        origin: 'edgio_serverless',
      }
    },
  );

  const algoliaJSON = await algoliaQuery.json();

  return algoliaJSON;
}

const fetchContentfulEntries = async (request, context) => {
  const searchParams = new URL(request.url).searchParams;
  const {
    CONTENTFUL_SPACE_ID: spaceID,
    CONTENTFUL_ACCESS_TOKEN: accessToken,
    CONTENTFUL_ENVIRONMENT_ID
  } = context.environmentVars;

  const API_URL = 'https://cdn.contentful.com';
  const envID = searchParams.get('env_id') || CONTENTFUL_ENVIRONMENT_ID || 'master';
  const contentType = searchParams.get('content_type') || 'blogPost';
  console.log("🚀 ~ fetchContentfulEntries ~ request.body:", request.body)
  const REQUEST_URL = new URL(
    `${API_URL}/spaces/${spaceID}/environments/${envID}/entries/5lMQtX9jg7D7PqsgD7le9d?access_token=${accessToken}`,
  );

  const spaceURL = new URL(`${API_URL}/spaces/${spaceID}/environments/${envID}/content_types/blogPost?access_token=${accessToken}`)

  const response = await fetch(REQUEST_URL.toString(), {
    edgio: {
      origin: 'edgio_serverless',
    }
  });
  // const responseJSON = await response.json();
  console.log("🚀 ~ fetchContentfulEntries ~ responseJSON:", responseJSON)
  // const resolved = await resolveResponse(responseJSON);
  // console.log("🚀 ~ fetchContentfulEntries ~ resolved:", resolved)

  return response;
}

const buildAddObjectRequestBody = (entry, objectID) => ({
  "action": "addObject",
  "body": {
    ...entry,
    // objectID is a Algolia convention. Without this we will add duplicate records
    "objectID": objectID || entry.fields?.slug || entry.fields?.id 
  },
})

export async function handleHttpRequest(request, context) {
  console.log("🚀 ~ handleHttpRequest ~ request:", request.body)
  const searchParams = new URL(request.url).searchParams;

  const objectID = searchParams.get('object_id') 
  try {
    // const entries = await fetchContentfulEntries(request, context);
    // const searchableEntries = entries.filter(entry => entry.fields.isSearchable);
    // const saveEntryParams = searchableEntries.map(searchableEntry => buildAddObjectRequestBody(searchableEntry, objectID));
    // await updateIndex(request, context, saveEntryParams);

    const searchParams = new URL(request.url).searchParams;
    const {
      CONTENTFUL_SPACE_ID: spaceID,
      CONTENTFUL_ACCESS_TOKEN: accessToken,
      CONTENTFUL_ENVIRONMENT_ID
    } = context.environmentVars;
  
    const API_URL = 'https://cdn.contentful.com';
    const envID = searchParams.get('env_id') || CONTENTFUL_ENVIRONMENT_ID || 'master';
    const contentType = searchParams.get('content_type') || 'blogPost';
    console.log("🚀 ~ fetchContentfulEntries ~ request.body:", request.body)
    const REQUEST_URL = new URL(
      `${API_URL}/spaces/${spaceID}/environments/${envID}/entries/5lMQtX9jg7D7PqsgD7le9d?access_token=${accessToken}`,
    );
  
    const spaceURL = new URL(`${API_URL}/spaces/${spaceID}/environments/${envID}/content_types/blogPost?access_token=${accessToken}`)
  
    const response = await fetch(REQUEST_URL.toString(), {
      edgio: {
        origin: 'edgio_serverless',
      }
    });
    return new Response(response);
  } catch (error) {
    console.log(error);
    throw Error(error)
  }

}
