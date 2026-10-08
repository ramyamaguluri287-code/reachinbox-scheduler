import { Client } from '@elastic/elasticsearch';
import { ENV } from '../config/env.js';

let esClient: Client | null = null;
let isConnected = false;

try {
  esClient = new Client({
    node: ENV.ELASTICSEARCH.NODE,
  });
} catch (e: any) {
  console.warn('⚠️ Elasticsearch client initialization failed:', e.message);
}

export async function initElasticIndex() {
  if (!esClient) return;

  try {
    const ping = await esClient.ping();
    if (!ping) return;

    isConnected = true;
    const indexExists = await esClient.indices.exists({ index: ENV.ELASTICSEARCH.INDEX_NAME });

    if (!indexExists) {
      await esClient.indices.create({
        index: ENV.ELASTICSEARCH.INDEX_NAME,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              userId: { type: 'keyword' },
              senderEmail: { type: 'keyword' },
              recipientEmail: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              subject: { type: 'text' },
              body: { type: 'text' },
              status: { type: 'keyword' },
              scheduledAt: { type: 'date' },
              sentAt: { type: 'date' },
              createdAt: { type: 'date' },
            },
          },
        },
      });
      console.log(`✅ Elasticsearch index '${ENV.ELASTICSEARCH.INDEX_NAME}' created successfully`);
    } else {
      console.log(`✅ Elasticsearch index '${ENV.ELASTICSEARCH.INDEX_NAME}' is ready`);
    }
  } catch (error: any) {
    isConnected = false;
    console.warn(`⚠️ Elasticsearch not reachable at ${ENV.ELASTICSEARCH.NODE}. Search will fallback to DB:`, error.message);
  }
}

export async function indexEmailInElastic(email: {
  id: string;
  userId: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: string;
  scheduledAt: Date;
  sentAt?: Date | null;
  createdAt: Date;
}) {
  if (!esClient || !isConnected) return;

  try {
    await esClient.index({
      index: ENV.ELASTICSEARCH.INDEX_NAME,
      id: email.id,
      document: {
        id: email.id,
        userId: email.userId,
        senderEmail: email.senderEmail,
        recipientEmail: email.recipientEmail,
        subject: email.subject,
        body: email.body,
        status: email.status,
        scheduledAt: email.scheduledAt.toISOString(),
        sentAt: email.sentAt ? email.sentAt.toISOString() : null,
        createdAt: email.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.warn(`⚠️ Failed to index email ${email.id} into Elasticsearch:`, error.message);
  }
}

export async function searchEmailsInElastic(
  userId: string,
  searchQuery: string,
  status?: string
): Promise<string[] | null> {
  if (!esClient || !isConnected) return null;

  try {
    const mustClauses: any[] = [
      { term: { userId } },
    ];

    if (status) {
      mustClauses.push({ term: { status } });
    }

    if (searchQuery && searchQuery.trim()) {
      mustClauses.push({
        multi_match: {
          query: searchQuery,
          fields: ['recipientEmail^3', 'subject^2', 'body', 'senderEmail'],
          fuzziness: 'AUTO',
        },
      });
    }

    const response = await esClient.search({
      index: ENV.ELASTICSEARCH.INDEX_NAME,
      body: {
        query: {
          bool: {
            must: mustClauses,
          },
        },
        size: 100,
      },
    });

    const hits = response.hits.hits;
    return hits.map((hit: any) => hit._source.id as string);
  } catch (error: any) {
    console.warn('⚠️ Elasticsearch search error, falling back to DB query:', error.message);
    return null;
  }
}
